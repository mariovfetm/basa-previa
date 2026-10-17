/* =========================================================================
   MÍDIA — voz e câmera reais
   -------------------------------------------------------------------------
   Implementa de verdade dois recursos que o dossiê exige e que antes eram
   apenas simulados:

   · audioGuidance (A01/A08) — Web Speech API, em pt-BR, sem rede.
   · captura de documento e prova de vida (A02/A05) — getUserMedia.

   Ambos degradam com elegância: se o navegador ou a permissão não
   permitirem, a jornada continua e o motivo fica registrado na trilha
   de auditoria, que é o comportamento esperado em agência.
   ======================================================================= */

/* ----------------------------------------------------------------- VOZ */
const Fala = {
  supported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  _voz: null,
  _falando: false,
  _onState: null,

  /* O Chrome carrega as vozes de forma assíncrona. */
  init() {
    if (!this.supported) return;
    const carregar = () => { this._voz = this.escolherVoz(); };
    carregar();
    window.speechSynthesis.onvoiceschanged = carregar;
  },

  escolherVoz() {
    const vozes = window.speechSynthesis.getVoices() || [];
    if (!vozes.length) return null;
    return vozes.find(v => /pt[-_]BR/i.test(v.lang) && /natural|google|luciana|francisca/i.test(v.name))
        || vozes.find(v => /pt[-_]BR/i.test(v.lang))
        || vozes.find(v => /^pt/i.test(v.lang))
        || null;
  },

  falando() { return this.supported && window.speechSynthesis.speaking; },

  /* Fala o texto. Se já estiver falando, interrompe (comportamento de toggle). */
  dizer(texto, opts = {}) {
    if (!this.supported) return { ok: false, motivo: 'navegador sem síntese de voz' };
    const limpo = String(texto).replace(/\s+/g, ' ').trim();
    if (!limpo) return { ok: false, motivo: 'texto vazio' };

    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(limpo);
    u.lang = 'pt-BR';
    if (!this._voz) this._voz = this.escolherVoz();
    if (this._voz) u.voice = this._voz;
    /* Ritmo mais pausado: o público-alvo inclui pessoas idosas. */
    u.rate = opts.rate ?? 0.92;
    u.pitch = opts.pitch ?? 1;
    u.volume = 1;

    u.onstart = () => { this._falando = true; this._onState && this._onState(true); };
    const fim = () => { this._falando = false; this._onState && this._onState(false); opts.onEnd && opts.onEnd(); };
    u.onend = fim;
    u.onerror = fim;

    window.speechSynthesis.speak(u);
    return { ok: true, voz: this._voz ? this._voz.name : 'padrão do sistema' };
  },

  parar() {
    if (!this.supported) return;
    window.speechSynthesis.cancel();
    this._falando = false;
    this._onState && this._onState(false);
  },
};

/* Liga um botão .audiobtn (ou qualquer botão) a um texto falado.
   Cuida do estado visual, do aria-pressed e do registro em auditoria. */
function ligarAudio(btn, texto, iface, msgAuditoria) {
  if (!btn) return;
  const rotuloOriginal = btn.innerHTML;

  const pintar = (ativo) => {
    btn.dataset.playing = ativo ? 'true' : 'false';
    btn.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    btn.innerHTML = ativo
      ? `${ico('speaker', 18)} Parar a leitura`
      : rotuloOriginal;
  };

  if (!Fala.supported) {
    btn.disabled = true;
    btn.title = 'Este navegador não oferece síntese de voz.';
    btn.innerHTML = `${ico('speaker', 18)} Áudio indisponível neste navegador`;
    return;
  }

  btn.onclick = () => {
    if (Fala.falando()) {
      Fala.parar();
      pintar(false);
      audit(iface || 'A01', 'Leitura em voz alta interrompida pela titular');
      return;
    }
    Fala._onState = pintar;
    const r = Fala.dizer(texto, { onEnd: () => { pintar(false); } });
    pintar(true);
    if (r.ok) audit(iface || 'A01', (msgAuditoria || 'Conteúdo lido em voz alta') + ` · voz ${r.voz}`);
    else audit(iface || 'A01', `Áudio não disponível (${r.motivo}) · conteúdo permanece legível em tela`);
  };
}

/* -------------------------------------------------------------- CÂMERA */
const Camera = {
  supported: typeof navigator !== 'undefined'
          && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
  _stream: null,

  async abrir(video, { facingMode = 'environment' } = {}) {
    if (!this.supported) return { ok: false, motivo: 'navegador sem acesso à câmera' };
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      this.fechar();
      this._stream = stream;
      video.srcObject = stream;
      video.setAttribute('playsinline', '');
      video.muted = true;
      await video.play().catch(() => {});
      return { ok: true };
    } catch (e) {
      const motivo = e && e.name === 'NotAllowedError' ? 'permissão negada pela pessoa'
                   : e && e.name === 'NotFoundError' ? 'nenhuma câmera encontrada'
                   : (e && e.message) || 'falha ao abrir a câmera';
      return { ok: false, motivo };
    }
  },

  /* Congela o quadro atual e devolve um data URI. */
  capturar(video, { max = 720 } = {}) {
    if (!video || !video.videoWidth) return null;
    const escala = Math.min(1, max / video.videoWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(video.videoWidth * escala);
    c.height = Math.round(video.videoHeight * escala);
    c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.82);
  },

  fechar() {
    if (this._stream) {
      this._stream.getTracks().forEach(t => t.stop());
      this._stream = null;
    }
  },
};
