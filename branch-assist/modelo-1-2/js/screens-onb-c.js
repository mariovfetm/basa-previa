/* ============================================================================
   Branch Assist — Onboarding assistido · E10 a E14
   ========================================================================== */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- E10 */
SCREENS.e10 = {
  title: 'Consentimento por finalidade',
  hint: 'E10 · modo cliente. Quatro finalidades independentes, linguagem simples e leitura em voz alta. Três são necessárias para a conta; a biometria é opcional e a <b>recusa não impede a conta</b>.',
  nextLabel: 'Concluir consentimento',
  render() {
    const all = PURPOSES.every(p => S.onb.purposes[p.id] !== null);
    return `
    <div class="cust" style="text-align:left;max-width:760px">
      <div class="cust__task">${ico('docCheck', 16)} Só para você</div>
      <h1 class="cust__title">Precisamos da sua autorização</h1>
      <p class="cust__sub" style="text-align:left">Cada item abaixo é uma finalidade separada, e você responde uma por uma. As três primeiras são necessárias para abrir a conta. A última é opcional: recusar não muda nada no seu atendimento.</p>

      <div class="inline mb-16" style="justify-content:flex-start">
        <button class="audiobtn" data-audio="consent">${ico('speaker', 18)} Ouvir tudo em voz alta</button>
        <span class="badge badge--neutral">${PURPOSES.filter(p => S.onb.purposes[p.id] !== null).length} de ${PURPOSES.length} decididas</span>
      </div>

      ${PURPOSES.map(p => {
        const v = S.onb.purposes[p.id];
        const granted = v === true, refused = v === false;
        return `
        <div class="purpose" data-granted="${granted}" data-pid="${p.id}">
          <div class="purpose__top">
            <div style="flex:1">
              <div class="purpose__name">${p.name}</div>
              <div class="tiny muted" style="margin-top:4px">${p.norm}</div>
            </div>
            ${p.required
              ? '<span class="badge badge--alert">necessário</span>'
              : '<span class="badge badge--neutral">você decide</span>'}
          </div>
          <div class="purpose__why">“${p.plain}”</div>
          ${v === null ? '' : `
          <div class="mt-16 inline">
            ${granted ? '<span class="badge badge--success">você aceitou</span>' : ''}
            ${refused ? '<span class="badge badge--danger">você recusou</span>' : ''}
            <button class="btn btn--link" data-pid="${p.id}" data-act="change">Mudar minha resposta</button>
          </div>`}
          <div class="purpose__acts">
            ${v === null ? `
              <button class="btn btn--cta btn--lg" data-pid="${p.id}" data-act="yes">${ico('check', 18)} Aceito</button>
              <button class="btn btn--outline btn--lg" data-pid="${p.id}" data-act="no" ${p.required ? 'disabled' : ''}>
                ${ico('x', 18)} ${p.required ? 'Obrigatório' : 'Não aceito'}</button>
            ` : ''}
          </div>
        </div>`;
      }).join('')}

      <div class="note note--info mt-24" style="text-align:left">
        <span class="note__ic">${ico('info', 18)}</span>
        <div><b>Cada “aceito” é um registro datado.</b> <span class="muted">Finalidade, versão do texto, data, hora, terminal e <code>consentId</code> ficam guardados. A cliente sai com o <code>consentId</code> e pode revogar qualquer uma delas quando quiser.</span></div>
      </div>
      <div class="note note--success mt-16" style="text-align:left">
        <span class="note__ic">${ico('speaker', 18)}</span>
        <div><b>Registro de acessibilidade.</b> <span class="muted">Como a autorização foi dada ${S.onb.consentAudioPlayed ? '<strong>por áudio</strong> no modo cliente' : 'por leitura em voz alta da atendente'}, esse método fica gravado junto do consentimento. A cliente não precisa ler o texto para ter consentido validamente.</span></div>
      </div>
      <div class="mt-16 inline" style="justify-content:flex-start">
        <span class="chip chip--iface">A08 · A09</span>
        <span class="chip chip--ca">17.11</span>
        <span class="chip chip--norm">LGPD art. 8º §5º · Res. CMN 4.753/2019</span>
      </div>
      ${all ? '' : '<p class="tiny muted mt-16">Falta decidir: <b>' + PURPOSES.filter(p => S.onb.purposes[p.id] === null).map(p => p.name).join(' · ') + '</b></p>'}
    </div>`;
  },
  bind(root) {
    root.querySelectorAll('[data-pid][data-act]').forEach(b => b.onclick = () => {
      const id = b.dataset.pid, act = b.dataset.act;
      S.onb.purposes[id] = act === 'yes' ? true : act === 'no' ? false : null;
      audit('A08', `Consentimento ${id} → ${S.onb.purposes[id] === null ? 'reaberto' : S.onb.purposes[id] ? 'aceito' : 'recusado'}`);
      render();
    });
    /* Leitura em voz alta de todas as finalidades, em linguagem simples.
       O texto falado é o mesmo que está na tela (nada é omitido no áudio). */
    const roteiro = [
      'Precisamos da sua autorização.',
      'Cada item é uma finalidade separada. Você pode aceitar uma e recusar outra.',
      ...PURPOSES.map((p, i) => {
        const estado = S.onb.purposes[p.id];
        const situacao = estado === true ? 'Você já aceitou.'
                       : estado === false ? 'Você já recusou.'
                       : p.required ? 'Esta é indispensável para abrir a conta.'
                       : 'Esta é opcional, você decide.';
        return `Item ${i + 1}. ${p.name}. ${p.plain} ${situacao}`;
      }),
      'Se tiver qualquer dúvida, peça para a pessoa que está te atendendo explicar de novo.',
    ].join(' ');

    const btnAudio = root.querySelector('[data-audio="consent"]');
    ligarAudio(btnAudio, roteiro, 'A08', 'Finalidades do consentimento lidas em voz alta para a titular');
    /* Só registra "consentimento por áudio" quando a leitura foi de fato pedida. */
    if (btnAudio && Fala.supported) btnAudio.addEventListener('click', () => { S.onb.consentAudioPlayed = true; });
  },
  gate() {
    const falta = PURPOSES.filter(p => S.onb.purposes[p.id] === null);
    if (falta.length) return `Responda ${falta.length === 1 ? 'o item' : 'os itens'}: ${falta.map(p => p.name.toLowerCase()).join('; ')}.`;
    return null;
  },
  onNext() {
    S.onb.consentId = uid('CNS');
    S.onb.biometric = S.onb.purposes.BIOMETRIC_LOGIN_CREDENTIAL ? 'ENROLLED' : 'SKIPPED_NO_CONSENT';
    audit('A08', `Consentimento consolidado ${S.onb.consentId} · biometria ${S.onb.biometric}`);
  },
};

/* ---------------------------------------------------------------- E11 */
SCREENS.e11 = {
  title: 'Definição do PIN pela titular',
  hint: 'E11 · modo cliente. Cinco métodos em cadeia. Três erros no método corrente <b>não travam a conta</b>: a cadeia continua.',
  nextLabel: 'Concluir',
  render() {
    const p = S.onb.pin;
    const cur = p.exhausted[p.exhausted.length - 1] || p.method;
    const entryLen = p.entry.length;
    const a11yKeys = p.method === 'TOUCH_KEYPAD_ACCESSIBLE';
    return `
    <div class="cust" style="text-align:left;max-width:820px">
      <div class="cust__task">${ico('lock', 16)} Só para você</div>
      <h1 class="cust__title">Crie sua senha</h1>
      <p class="cust__sub" style="text-align:left">São 4 números. Ninguém além de você vê esta tela: nem o atendente, nem o banco. Não use números iguais, em sequência ou a sua data de nascimento. Se você não quiser criar agora, a conta abre e você define depois no terminal ou pelo telefone.</p>
      ${p.erro ? `<div class="note note--alert" role="alert" style="text-align:left"><span class="note__ic">${ico('alert', 18)}</span><div><b>${p.erro}</b></div></div>` : ''}
      ${p.status === 'ENROLLED' ? `<div class="note note--success" style="text-align:left"><span class="note__ic">${ico('checkCircle', 18)}</span><div><b>Senha criada.</b> <span class="muted">Ela não fica guardada nesta tela nem aparece para o atendente.</span></div></div>` : ''}

      <div class="grid grid--2" style="align-items:start">
        <div class="pin">
          <div class="card__title center" style="text-transform:uppercase;letter-spacing:.06em;font-size:var(--fs-2xs);color:var(--tx-secondary)">
            ${p.stage === 'entry' ? 'Digite sua senha' : 'Repita a senha'}
          </div>
          <div class="pin__dots">
            ${[0, 1, 2, 3].map(i => `<span class="pin__dot" data-filled="${i < (p.stage === 'entry' ? entryLen : p.confirm.length)}"></span>`).join('')}
          </div>

          <div class="keypad ${a11yKeys ? 'keypad--a11y' : ''}">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}
            <button data-k="0">0</button>
            <button data-act="del" aria-label="Apagar último">${ico('minus', 22)}</button>
            <button data-act="ok" aria-label="Confirmar senha">${ico('check', 24)}</button>
          </div>

          <div class="center mt-16">
            <button class="audiobtn" data-audio="pin">${ico('speaker', 18)} Ouvir esta etapa</button>
          </div>
        </div>

        <div>
          <div class="card__title mb-16">Métodos disponíveis, em ordem</div>
          <div class="pinchain">
            ${PIN_METHODS.map(m => {
              const exhausted = p.exhausted.includes(m.id) || p.attempts >= p.maxAttempts;
              const active = m.id === cur;
              return `
              <button class="pinmethod" data-m="${m.id}" data-active="${active}" data-state="${exhausted ? 'exhausted' : 'ok'}">
                <span class="pinmethod__n">${m.n}</span>
                <span class="pinmethod__b">
                  <span class="pinmethod__name">${m.name}</span>
                  <span class="pinmethod__desc">${m.desc}</span>
                </span>
                <span>${active ? '<span class="badge badge--brand">em uso</span>' : exhausted ? '<span class="badge badge--neutral">encerrado</span>' : ''}</span>
              </button>`;
            }).join('')}
          </div>

          <div class="mt-16">
            <div class="rows">
              <div class="row"><span class="row__k">Tentativas no método atual</span><span class="row__v">${p.attempts} de ${p.maxAttempts}</span></div>
              <div class="row"><span class="row__k">Confirmação</span><span class="row__v">${PIN_METHODS.find(m => m.id === p.confirmationMethod)?.name || '—'}</span></div>
              <div class="row"><span class="row__k">Alerta de furto</span><span class="row__v">${p.attempts >= p.maxAttempts - 1 ? '<span class="badge badge--alert">exibido</span>' : 'não exibido'}</span></div>
              <div class="row"><span class="row__k">Regra de confirmação</span><span class="row__v">a senha repetida precisa ser igual à primeira</span></div>
              <div class="row"><span class="row__k">Senha fácil</span><span class="row__v">recusada (repetida, em sequência ou data de nascimento)</span></div>
            </div>
          </div>
        </div>
      </div>

      ${p.attempts >= p.maxAttempts ? `
      <div class="note note--alert mt-24" style="text-align:left">
        <span class="note__ic">${ico('alert', 18)}</span>
        <div><b>Tentativas esgotadas neste método.</b> <span class="muted">A conta <strong>não é bloqueada</strong>. O app avisa sobre risco de bloqueio permanente e oferece o próximo método da cadeia: teclado ampliado, pinpad físico, definir no terminal ou envelope selado.</span></div>
      </div>` : ''}
      <div class="trace">
        <span class="chip chip--iface">A10 · A11 · A12</span>
        <span class="chip chip--ca">16.33</span>
        <span class="chip chip--norm">Res. CMN 4.753/2019 · art. 4º, XI</span>
      </div>
    </div>`;
  },
  bind(root) {
    const p = S.onb.pin;
    root.querySelectorAll('.keypad button').forEach(b => b.onclick = () => {
      const act = b.dataset.act;
      if (p.status === 'ENROLLED') return;
      p.erro = null;
      if (act === 'del') p[p.stage] = p[p.stage].slice(0, -1);
      else if (act === 'ok') {
        if (p[p.stage].length !== 4) { p.erro = 'Faltam números. A senha tem quatro.'; render(); return; }
        if (p.stage === 'entry') {
          /* Senha previsível é recusada antes da confirmação. O motivo vai
             para a trilha; os números, nunca. */
          const motivo = senhaPrevisivel(p.entry, S.customer.birth);
          if (motivo) {
            p.policyViolation++;
            p.entry = '';
            p.erro = 'Essa senha é fácil de adivinhar. Escolha outros quatro números.';
            audit('A10', `Senha recusada por ser previsível (${motivo}) · titular orientada a escolher outra`);
            render(); return;
          }
          p.stage = 'confirm';
        } else {
          if (p.entry === p.confirm) {
            p.status = 'ENROLLED'; p.enrollmentId = uid('PIN');
            p.entry = ''; p.confirm = ''; p.stage = 'entry';
            audit('A10', 'Senha criada e confirmada pela titular · valor não registrado');
          } else {
            p.attempts++; p.stage = 'entry'; p.entry = ''; p.confirm = '';
            p.erro = 'Os números não são os mesmos. Vamos tentar de novo.';
            audit('A10', `Divergência na confirmação da senha · tentativa ${p.attempts}/${p.maxAttempts}`);
            if (p.attempts >= p.maxAttempts) advanceMethod(p);
          }
        }
        render();
        return;
      } else if (p[p.stage].length < 4) {
        p[p.stage] += b.dataset.k;
        if (S.a11y.hapticFeedback && navigator.vibrate) navigator.vibrate(20);
      }
      render();
    });
    root.querySelectorAll('[data-m]').forEach(b => b.onclick = () => {
      const id = b.dataset.m;
      if (p.exhausted.includes(id)) return;
      if (id === 'ATM_DEFERRED') { p.status = 'DEFERRED_ATM'; p.enrollmentId = uid('PIN'); audit('A11', 'Senha adiada para definição no terminal do autoatendimento'); render(); return; }
      if (id === 'SEALED_ENVELOPE') { p.status = 'SEALED_ENVELOPE'; p.enrollmentId = uid('PIN'); audit('A11', 'Senha gerada pelo sistema e entregue em envelope selado'); render(); return; }
      if (id === 'EXTERNAL_PINPAD') { p.method = id; p.attempts = 0; p.stage = 'entry'; p.entry = ''; p.confirm = ''; audit('A11', 'Método de senha alterado para pinpad físico'); render(); return; }
      p.method = id; p.attempts = 0; p.stage = 'entry'; p.entry = ''; p.confirm = ''; render();
    });
    /* A senha nunca é falada — só a instrução de como digitá-la. */
    const metodoAtual = PIN_METHODS.find(m => m.id === p.method);
    const roteiroPin = [
      'Agora você vai criar a sua senha de quatro números.',
      'Ninguém do banco pode ver ou pedir esta senha, nem a pessoa que está te atendendo.',
      metodoAtual ? `Você está usando: ${metodoAtual.name}.` : '',
      p.stage === 'confirm'
        ? 'Digite os mesmos quatro números de novo, para confirmar.'
        : 'Escolha quatro números que você consiga lembrar, e digite no teclado da tela.',
      'Se errar, use o botão apagar. Se preferir, você pode deixar para criar a senha depois, no caixa eletrônico.',
    ].filter(Boolean).join(' ');

    ligarAudio(root.querySelector('[data-audio="pin"]'), roteiroPin, 'A10',
               'Instruções de criação de senha lidas em voz alta');
  },
  onNext() {
    const p = S.onb.pin;
    if (p.status === 'PENDING') { p.status = 'SKIPPED'; audit('A11', 'Criação de senha adiada: conta aberta sem senha; cliente pode definir depois'); }
  },
};

function advanceMethod(p) {
  const order = PIN_METHODS.map(m => m.id);
  const i = order.indexOf(p.method);
  if (p.exhausted.indexOf(p.method) === -1) p.exhausted.push(p.method);
  const next = order.slice(i + 1).find(id => !p.exhausted.includes(id)) || 'ATM_DEFERRED';
  p.method = next;
  p.attempts = 0;
  p.stage = 'entry';
  p.entry = ''; p.confirm = '';
  if (next === 'ATM_DEFERRED') p.status = 'DEFERRED_ATM';
  audit('A11', `Cadeia de métodos avançou para ${next}, sem bloqueio de conta`);
}

/* ---------------------------------------------------------------- E12 */
SCREENS.e12 = {
  title: 'Assinatura do termo de adesão',
  hint: 'E12 · modo cliente. A assinatura é da <b>titular</b>. Se ela não souber assinar, existe caminho alternativo formalizado; o acompanhante não assina por ela.',
  nextLabel: 'Confirmar assinatura',
  render() {
    const s = S.onb.signature;
    const signed = s.status === 'SIGNED';
    return `
    <div class="cust" style="text-align:left;max-width:800px">
      <div class="cust__task">${ico('signature', 16)} Só para você</div>
      <h1 class="cust__title">Assine o termo de abertura</h1>
      <p class="cust__sub" style="text-align:left">${S.a11y.simplifiedLanguage
        ? 'Este é o papel que diz que a conta é sua. Leia em voz alta comigo, se quiser. Se não souber assinar, tem outro jeito. Eu te explico.'
        : 'Leia o termo e assine no quadro abaixo. Se preferir não assinar no tablet, é possível registrar o termo em papel no balcão.'}</p>

      <div class="card">
        <div class="card__head">
          <span class="card__title">Termo de adesão e abertura de conta</span>
          <span class="badge badge--neutral">versão 4.2 · 2,1 mil caracteres</span>
        </div>
        <div class="card__body">
          <p class="tiny muted" style="line-height:1.7">
            A cliente declara que os dados informados são verdadeiros, autoriza a verificação de identidade junto a fornecedor especializado,
            concorda com o uso dos dados para manutenção da conta e com o compartilhamento de indícios de fraude quando houver.
            Declara estar ciente das tarifas, dos limites de transferência e da possibilidade de bloqueio por determinação judicial.
            O Banco Central é informado sobre a abertura conforme as normas em vigor.
          </p>
          <div class="inline mt-16">
            <button class="btn btn--link" data-audio="termo">${ico('speaker', 18)} Ler o termo em voz alta</button>
            <button class="btn btn--link" data-bigger="1">${ico('textSize', 18)} Letra maior</button>
          </div>
        </div>
      </div>

      ${signed ? `
      <div class="note note--success">
        <span class="note__ic">${ico('checkCircle', 18)}</span>
        <div><b>Termo assinado ${({ ROGO: 'a rogo, com duas testemunhas', WITNESSED: 'com duas testemunhas', PAPER_BALCAO: 'em papel, no balcão', AUDIO_BIOMETRIC: 'por áudio e biometria' })[s.mode] || 'pela própria titular'}.</b> <span class="muted">envelope <code>${s.envelopeId}</code>. O hash do termo assinado fica anexado à sessão.</span></div>
      </div>` : `
      <div class="grid grid--2" style="align-items:start">
        <div>
          <div class="sigpad" id="sigpad">
            <span class="sigpad__hint">${ico('pen', 20)} Assine aqui com o dedo</span>
            <div class="sigpad__line"></div>
          </div>
          <div class="inline mt-16">
            <button class="btn btn--outline" data-sign="self">Assinar aqui</button>
            <button class="btn btn--ghost" data-sign="paper">Prefiro assinar no papel</button>
          </div>
        </div>
        <div>
          <div class="card__title mb-16">Não sabe assinar?</div>
          <div class="stack">
            <button class="btn btn--outline btn--block" data-sign="rogo">Assinatura a rogo, com duas testemunhas</button>
            <button class="btn btn--outline btn--block" data-sign="witnessed">Assinar com duas testemunhas</button>
            <button class="btn btn--outline btn--block" data-sign="audio">Assinatura por áudio e biometria</button>
          </div>
          <div class="note note--info mt-16">
            <span class="note__ic">${ico('info', 18)}</span>
            <div><b>O acompanhante não assina por ela.</b> <span class="muted">Testemunha e responsável são figuras diferentes, e nenhuma delas assume obrigação da conta.</span></div>
          </div>
        </div>
      </div>`}

      <div class="trace">
        <span class="chip chip--iface">I03</span>
        <span class="chip chip--norm">MP 2.200-2/2001 · art. 10 · Código Civil art. 595 (a rogo)</span>
      </div>
    </div>`;
  },
  bind(root) {
    const pad = root.querySelector('#sigpad');
    const curto = () => {
      const partes = String(S.customer.name || 'Titular').split(' ');
      return partes.length > 2 ? `${partes[0]} ${partes.slice(1, -1).map(x => x[0] + '.').join(' ')} ${partes[partes.length - 1]}` : partes.join(' ');
    };
    const btnSelf = root.querySelector('[data-sign="self"]');
    if (btnSelf) btnSelf.disabled = !S.onb.signature.drawn;
    if (pad) pad.onclick = () => {
      S.onb.signature.drawn = true;
      root.querySelector('.sigpad__hint').innerHTML = `<span style="font-family:inherit;font-size:34px;color:var(--c-verde-escuro-2)">${curto()}</span>`;
      if (btnSelf) btnSelf.disabled = false;
    };
    root.querySelectorAll('[data-sign]').forEach(b => b.onclick = () => {
      const m = { self: 'SELF', paper: 'PAPER_BALCAO', rogo: 'ROGO', witnessed: 'WITNESSED', audio: 'AUDIO_BIOMETRIC' }[b.dataset.sign];
      S.onb.signature.mode = m;
      S.onb.signature.status = 'SIGNED';
      S.onb.signature.envelopeId = uid('ENV');
      if (m === 'WITNESSED' || m === 'ROGO') S.onb.signature.witnesses = ['Nome Testemunha 1', 'Nome Testemunha 2'];
      audit('I03', `Termo assinado por ${m} · envelope ${S.onb.signature.envelopeId}`);
      render();
    });
    /* Lê o próprio texto do termo que está na tela — não uma paráfrase.
       Se o texto mudar, o áudio acompanha, sem risco de divergir. */
    const corpoTermo = root.querySelector('.card__body .tiny');
    const roteiroTermo = 'Termo de adesão e abertura de conta. '
      + (corpoTermo ? corpoTermo.textContent : '')
      + ' Fim do termo. Se quiser ouvir de novo, é só tocar outra vez no botão.';
    ligarAudio(root.querySelector('[data-audio="termo"]'), roteiroTermo, 'I03',
               'Termo de adesão lido em voz alta antes da assinatura');
    const bg = root.querySelector('[data-bigger]');
    if (bg) bg.onclick = () => {
      S.a11y.fontScale = S.a11y.fontScale >= 1.5 ? 1 : 1.5;
      applyA11y(); render();
      audit('A01', `Fonte ampliada ${S.a11y.fontScale >= 1.5 ? 'ativada' : 'desativada'} a pedido da cliente no termo`);
    };
  },
  gate() {
    return S.onb.signature.status === 'SIGNED' ? null : 'Assine o termo antes de continuar, ou escolha uma das outras formas de assinatura.';
  },
  onNext() { audit('I03', `Assinatura concluída em modo cliente · handoff ${(S.handoff && S.handoff.handoffId) || 's/n'}`); },
};

/* ---------------------------------------------------------------- E13 */
/* A conta só nasce com assinatura válida, documentoscopia APROVADA e
   consentimentos necessários. 16.31 conta · 16.32 risco e limite ·
   16.33 credenciais e senha transacional · 16.34 solicitação de cartão
   de débito, com cartão virtual tokenizado no dispositivo da titular.  */
function e13Pendencias() {
  const out = [];
  /* Desfecho já registrado (suspensão, pendência, indisponibilidade) não se
     desfaz por navegação: a conta não nasce nessa sessão. */
  if (S.onb.outcome && S.onb.outcome !== 'ACCOUNT_OPENED') out.push(`a abertura já foi encerrada como “${OUTCOMES[S.onb.outcome].label}”`);
  const sit = situacaoE02(S.onb.lookup);
  if (sit !== 'NOVO') out.push(`a identificação do CPF não libera a abertura (${E02_SITUACAO[sit].badge}, E02)`);
  if (S.onb.eligibility === 'UNAVAILABLE') out.push('a consulta regulatória não foi concluída (E04)');
  if (S.onb.signature.status !== 'SIGNED') out.push('o termo de adesão ainda não foi assinado (E12)');
  if (!S.onb.docFront) out.push('nenhum documento foi capturado (E06)');
  if (S.onb.docState !== 'APPROVED') out.push('a conferência de identidade não foi aprovada (E08)');
  const faltaConsent = PURPOSES.filter(p => p.required && S.onb.purposes[p.id] !== true);
  if (faltaConsent.length) out.push('faltam consentimentos necessários (E10)');
  return out;
}
/* Aprovação do supervisor: credencial própria (matrícula diferente da do atendente e PIN de
   6 dígitos), que nunca vai para a trilha. */
function aprovarComSupervisor() {
  if (overlayAberto()) return;
  const host = abrirOverlay(`
    <div class="overlay">
      <div class="handoff">
        <div class="handoff__dir">${ico('users', 18)} <b>APROVAÇÃO DO SUPERVISOR</b></div>
        <h1 class="handoff__title">O supervisor confere e aprova a abertura</h1>
        <p class="handoff__sub">Identidade aprovada, consentimentos registrados e termo assinado. Com a aprovação, a conta nasce na ${AGENCIA_DIGITAL.nome} ${AGENCIA_DIGITAL.id}.</p>
        <div class="reauth">
          <label class="reauth__lbl" for="sup-mat">Matrícula do supervisor</label>
          <input class="reauth__in" id="sup-mat" style="letter-spacing:normal;font-size:var(--fs-base)" value="BASA\\marcos.souza" autocomplete="off">
        </div>
        ${campoReauth('sup-pin').replace('PIN do atendente · ' + S.session.operatorId, 'PIN do supervisor')}
        <div class="inline" style="justify-content:center">
          <button class="btn btn--ghost" data-sp="cancel" style="color:#fff;border-color:#ffffff59">Voltar</button>
          <button class="btn btn--cta btn--lg" data-sp="go">${ico('check', 18)} Aprovar a abertura</button>
        </div>
      </div>
    </div>`);
  const go = host.querySelector('[data-sp="go"]');
  ligarReauth(host, 'sup-pin', go);
  host.querySelector('[data-sp="cancel"]').onclick = () => { fecharOverlay(); render(); };
  go.onclick = () => {
    const mat = host.querySelector('#sup-mat').value.trim();
    if (!mat || mat.toLowerCase() === String(S.session.operatorId).toLowerCase()) {
      host.querySelector('#sup-mat').setCustomValidity('A aprovação precisa ser de outra pessoa.');
      host.querySelector('#sup-mat').reportValidity();
      return;
    }
    S.onb.supervisorApproval = { supervisorId: mat, em: new Date().toISOString() };
    audit('I18', `Abertura aprovada pelo supervisor ${mat} · atendente ${S.session.operatorId}`);
    fecharOverlay();
    render();
  };
}

const PIN_LABEL = {
  ENROLLED: 'criada pela titular', DEFERRED_ATM: 'a definir no terminal', SEALED_ENVELOPE: 'envelope selado',
  SKIPPED: 'adiada pela titular', PENDING: 'não definida',
};

SCREENS.e13 = {
  title: 'Abertura da conta e credenciais',
  hint: 'E13 · a conta só é criada quando tudo acima está resolvido. Número, agência, risco, limite, credenciais e solicitação de cartão saem em um único passo.',
  nextLabel: 'Criar conta e emitir credenciais',
  render() {
    const pend = e13Pendencias();
    const a = S.onb.account;
    const n = a.number;
    const risco = a.risk || e09Risco();
    const temCelular = !!String(S.customer.phone || '').trim();
    return `
    <div class="wrap">
      <div class="h-eyebrow">${ico('bank', 14)} I04 · I05 · A13 · Criação da conta</div>
      <h1 class="h1">${n ? 'Conta criada' : 'Abertura da conta'}</h1>
      <p class="lede">A criação é atômica: ou a conta nasce com número, agência, risco, limite e credenciais, ou nada é gravado. Não existe conta meio criada para a cliente descobrir depois.</p>

      ${pend.length && !n ? `
      <div class="note note--danger">
        <span class="note__ic">${ico('alert', 18)}</span>
        <div><b>Abertura bloqueada.</b> <span class="muted">${pend.join('; ')}. Volte à etapa correspondente: abrir conta sem identidade verificada não é permitido.</span></div>
      </div>` : ''}

      <div class="grid grid--2">
        <div class="card">
          <div class="card__head">
            <span class="card__title">Dados da conta</span>
            <span class="badge badge--${n ? 'success' : 'neutral'}">${n ? 'ativa' : 'pré-visualização'}</span>
          </div>
          <div class="card__body">
            <div class="rows">
              <div class="row"><span class="row__k">${ico('folder', 16)} Número da conta</span><span class="row__v row__v--lg">${n || '—'}</span></div>
              <div class="row"><span class="row__k">${ico('bank', 16)} Agência da conta</span><span class="row__v row__v--wrap">${AGENCIA_DIGITAL.id} · ${AGENCIA_DIGITAL.nome}</span></div>
              <div class="row"><span class="row__k">${ico('users', 16)} Atendimento</span><span class="row__v row__v--wrap">0108 · Bragança</span></div>
              <div class="row"><span class="row__k">${ico('wallet', 16)} Produto</span><span class="row__v row__v--wrap">${S.onb.accountTypes.map(t => ({ CHECKING: 'Conta corrente', SAVINGS: 'Poupança', BASIC: 'Conta básica' }[t])).join(' · ')}</span></div>
              <div class="row"><span class="row__k">${ico('shield', 16)} Risco calculado</span><span class="row__v row__v--wrap">${risco === 'LOW' ? 'Baixo' : 'Médio'} · política do Banco (simulada)</span></div>
              <div class="row"><span class="row__k">${ico('money', 16)} Limite de transferência</span><span class="row__v row__v--wrap">${money(a.limit || limiteConta())} por transação</span></div>
              <div class="row"><span class="row__k">${ico('face', 16)} Biometria</span><span class="row__v row__v--wrap">${S.onb.biometric === 'ENROLLED' ? 'ativada com consentimento' : 'não ativada'}</span></div>
            </div>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card__title mb-16">Credenciais e cartão</div>
            <div class="rows">
              <div class="row"><span class="row__k">${ico('user', 16)} Acesso aos canais digitais</span><span class="row__v row__v--wrap">${n ? 'credencial criada · ativação no primeiro acesso' : 'criada junto com a conta'}</span></div>
              <div class="row"><span class="row__k">${ico('lock', 16)} Senha transacional</span><span class="row__v row__v--wrap">${PIN_LABEL[S.onb.pin.status] || S.onb.pin.status}</span></div>
              <div class="row"><span class="row__k">${ico('card', 16)} Cartão de débito</span><span class="row__v row__v--wrap">${a.cardRequest ? 'solicitado · ' + a.cardRequest.id : 'solicitado ao criar a conta'}</span></div>
              <div class="row"><span class="row__k">${ico('tablet', 16)} Cartão virtual tokenizado</span><span class="row__v row__v--wrap">${temCelular ? 'vinculado ao celular da titular' : 'aguardando aparelho: a titular não tem celular cadastrado'}</span></div>
              <div class="row"><span class="row__k">${ico('pix', 16)} Chave Pix</span><span class="row__v row__v--wrap">não criada automaticamente · escolha da titular no atendimento (S03)</span></div>
            </div>
            <div class="note note--info mt-16"><span class="note__ic">${ico('atm', 18)}</span>
              <div><b>Cartão físico.</b> <span class="muted">A solicitação sai agora; entrega no endereço cadastrado ou retirada no balcão, com rastreio e senha no atendimento (S30).</span></div></div>
          </div>
          <div class="card">
            <div class="card__head">
              <span class="card__title">Aprovação do supervisor</span>
              <span class="badge badge--${S.onb.supervisorApproval ? 'success' : 'alert'}">${S.onb.supervisorApproval ? 'aprovada' : 'pendente'}</span>
            </div>
            <div class="card__body">
              ${S.onb.supervisorApproval
                ? `<div class="rows"><div class="row"><span class="row__k">${ico('user', 16)} Supervisor</span><span class="row__v row__v--wrap">${S.onb.supervisorApproval.supervisorId}</span></div>
                   <div class="row"><span class="row__k">${ico('clock', 16)} Aprovada em</span><span class="row__v">${new Date(S.onb.supervisorApproval.em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></div></div>`
                : `<p class="tiny muted mb-0">Operador e supervisor: a conta só é criada depois que um supervisor com alçada confere a proposta e aprova com a credencial dele. Produto, tarifa e limites são os mesmos da abertura digital.</p>
                   <div class="spread mt-16"><span class="tiny muted">${pend.length ? 'Resolva as pendências antes de pedir a aprovação.' : 'Proposta pronta para aprovação.'}</span>
                   <button class="btn btn--outline" id="e13-sup" ${pend.length ? 'disabled' : ''}>${ico('users', 18)} Pedir aprovação do supervisor</button></div>`}
            </div>
          </div>
          <div class="card">
            <div class="card__title mb-16">Comunicação ao Banco Central</div>
            <div class="rows">
              <div class="row"><span class="row__k">Abertura reportada</span><span class="row__v row__v--wrap">${n ? 'sim · ' + (a.reportId || '—') : 'ao criar a conta'}</span></div>
              <div class="row"><span class="row__k">Recebimento em espécie</span><span class="row__v row__v--wrap">declarado</span></div>
              <div class="row"><span class="row__k">Início de relacionamento</span><span class="row__v row__v--wrap">${n ? 'hoje' : 'pendente'}</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="trace">
        <span class="chip chip--iface">I04 · I05 · A13 · I06 · I08</span>
        <span class="chip chip--ca">16.31 · 16.32 · 16.33 · 16.34</span>
        <span class="chip chip--norm">Res. CMN 4.753/2019 · art. 3º</span>
      </div>
    </div>`;
  },
  bind(root) {
    const sup = root.querySelector('#e13-sup');
    if (sup) sup.onclick = () => aprovarComSupervisor();
  },
  gate() {
    if (S.onb.account.number) return null;
    const pend = e13Pendencias();
    if (pend.length) return `A conta não pode ser criada: ${pend.join('; ')}.`;
    return S.onb.supervisorApproval ? null : 'A conta só é criada depois da aprovação do supervisor.';
  },
  onNext() {
    const a = S.onb.account;
    if (a.number) return;
    a.number = '0' + Math.floor(1e7 + Math.random() * 9e7) + '-X';
    a.status = 'ACTIVE';
    a.risk = a.risk || e09Risco();
    a.limit = limiteConta();
    a.reportId = uid('RPT');
    a.credentials = { canais: 'CRIADA', transacional: S.onb.pin.status };
    a.cardRequest = { id: uid('CRD'), tipo: 'DEBITO', virtual: true,
                      token: String(S.customer.phone || '').trim() ? 'VINCULADO' : 'AGUARDANDO_APARELHO' };
    S.onb.outcome = 'ACCOUNT_OPENED';
    S.onb.protocolo = S.onb.protocolo || uid('PRO');
    S.onb.assignedBranch = AGENCIA_DIGITAL.id;
    audit('I04', `Conta ${a.number} criada na agência ${AGENCIA_DIGITAL.id} (${AGENCIA_DIGITAL.nome}) · atendimento na 0108 · risco ${a.risk} · limite ${money(a.limit)} · aprovada por ${S.onb.supervisorApproval.supervisorId}`);
    audit('I06', `Credenciais de acesso criadas · senha transacional ${S.onb.pin.status}`);
    audit('I05', `Solicitação de cartão de débito ${a.cardRequest.id} · cartão virtual ${a.cardRequest.token === 'VINCULADO' ? 'tokenizado no celular' : 'aguardando aparelho'}`);
  },
};

/* ---------------------------------------------------------------- E14 */
const E14_TEXTO = {
  ACCOUNT_OPENED:      { h: 'Atendimento concluído', d: 'A conta está ativa. A cliente sai com os comprovantes abaixo e o canal de retorno.' },
  PENDING_IDENTITY:    { h: 'Proposta registrada, conta aguardando identidade', d: 'A conta não foi criada. A identidade segue em análise e a cliente sai com protocolo e prazo de retorno de até 3 dias úteis.' },
  FRAUD_REVIEW:        { h: 'Abertura suspensa', d: 'A proposta passa por análise complementar. A cliente recebe o protocolo e o prazo; o motivo interno não é exposto no atendimento.' },
  SERVICE_UNAVAILABLE: { h: 'Atendimento interrompido com protocolo', d: 'A consulta regulatória não pôde ser concluída. Isso não é negativa: a cliente volta em outro dia com o protocolo.' },
  CANCELLED:           { h: 'Abertura cancelada', d: 'A desistência foi registrada com o motivo.' },
};

SCREENS.e14 = {
  title: 'Comprovantes e encerramento',
  hint: 'E14 · a cliente sai com o que precisa para provar o que aconteceu: protocolo, termo, comprovante de endereço e canal de retorno.',
  nextLabel: 'Encerrar atendimento',
  render() {
    const oc = S.onb.outcome;
    const done = oc === 'ACCOUNT_OPENED';
    const txt = E14_TEXTO[oc] || { h: 'Resumo do atendimento', d: 'A abertura ainda não chegou a um desfecho. O que ficou pendente aparece abaixo com responsável e prazo.' };
    const cfg = OUTCOMES[oc];
    return `
    <div class="wrap">
      <div class="h-eyebrow">${ico('checkCircle', 14)} A03 · I07 · Encerramento</div>
      <h1 class="h1">${txt.h}</h1>
      <p class="lede">${txt.d}</p>
      ${cfg ? `<div class="inline mb-16"><span class="badge badge--${cfg.tone}">${cfg.label}</span>${S.onb.protocolo ? `<span class="badge badge--neutral">protocolo ${S.onb.protocolo}</span>` : ''}</div>` : ''}

      <div class="grid grid--2">
        <div class="card">
          <div class="card__head">
            <span class="card__title">Comprovantes para impressão</span>
            <span class="badge badge--${done ? 'success' : 'neutral'}">${done ? 'disponíveis' : 'parcial'}</span>
          </div>
          <div class="card__body">
            <div class="stack">
              ${[
                ['Protocolo de atendimento', S.onb.protocolo || 'pendente'],
                ['Termo de adesão assinado', S.onb.signature.status === 'SIGNED' ? 'assinado · ' + S.onb.signature.envelopeId : 'pendente'],
                ['Comprovante de vínculo de endereço', done ? 'emitido' : 'pendente'],
                ['Ficha de resumo de produtos e tarifas', 'sempre emitido'],
                ['Credencial de senha provisória', S.onb.pin.status === 'SEALED_ENVELOPE' && done ? 'envelope selado' : 'não aplicável'],
              ].map(([t, s]) => `
                <div class="toggle">
                  <div class="toggle__txt"><div class="toggle__name">${t}</div></div>
                  <div class="inline" style="justify-content:flex-end">
                    <span class="tiny muted">${s}</span>
                    <button class="btn btn--ghost" data-print="${t}" ${/pendente|não aplicável/i.test(s) ? 'disabled' : ''}>${ico('print', 18)} Imprimir</button>
                  </div>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card__title mb-16">Pendências em aberto</div>
            ${pendingList().length ? pendingList().map(p => `
              <div class="note note--alert">
                <span class="note__ic">${ico('clock', 18)}</span>
                <div><b>${p.t}</b><br><span class="muted">${p.d} · responsável: ${p.who} · prazo: ${p.sla}</span></div>
              </div>`).join('') : '<div class="note note--success"><span class="note__ic">' + ico('checkCircle', 18) + '</span><div>Nenhuma pendência. A cliente pode usar a conta normalmente.</div></div>'}
          </div>
          <div class="card">
            <div class="card__title mb-16">Como continuar falando com o banco</div>
            <div class="rows">
              <div class="row"><span class="row__k">${ico('bank', 16)} Agência 0108</span><span class="row__v">com o mesmo atendente</span></div>
              <div class="row"><span class="row__k">${ico('atm', 18)} Autoatendimento</span><span class="row__v">${!done ? 'disponível depois da abertura' : S.onb.pin.status === 'DEFERRED_ATM' ? 'definir senha no terminal' : 'consultar saldo e extrato'}</span></div>
              <div class="row"><span class="row__k">${ico('headphone', 16)} Atendimento remoto</span><span class="row__v">canal acessível</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card card--flush">
        <div class="card__head">
          <span class="card__title">Trilha da sessão</span>
          <span class="badge badge--neutral">${S.audit.length} eventos · I07</span>
        </div>
        <div class="card__body">
          <table class="table">
            <thead><tr><th>Horário</th><th>Interface</th><th>Evento</th><th>Modo</th></tr></thead>
            <tbody>
              ${S.audit.slice(0, 12).map(e => `
                <tr><td>${e.t}</td><td><code>${e.iface}</code></td><td>${e.msg}</td>
                <td>${e.ctx.deviceMode === 'CUSTOMER_MODE' ? '<span class="badge badge--brand">cliente</span>' : '<span class="badge badge--neutral">funcionário</span>'}</td></tr>`).join('')
                || '<tr><td colspan="4" class="muted">Nenhum evento registrado ainda.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      <div class="trace">
        <span class="chip chip--iface">A03 · I07</span>
        <span class="chip chip--norm">NFR-17 · trilha de auditoria</span>
      </div>
    </div>`;
  },
  bind(root) {
    root.querySelectorAll('[data-print]').forEach(b => b.onclick = () => audit('A03', `Comprovante impresso: ${b.dataset.print}`));
  },
  onNext() {
    if (S.session.outcome === 'ENCERRADO') return;
    S.session.outcome = 'ENCERRADO';
    const oc = S.onb.outcome;
    audit('A03', `Atendimento encerrado · ${oc ? OUTCOMES[oc].label : 'sem desfecho de abertura'}${S.onb.protocolo ? ' · protocolo ' + S.onb.protocolo : ''}`);
  },
};

function pendingList() {
  const out = [];
  const st = S.onb.docState;
  const oc = S.onb.outcome;
  if (oc === 'PENDING_IDENTITY') {
    if (st === 'MANUAL_REVIEW' || st === 'REJECTED_DOCUMENT') out.push({ t: 'Documento em análise manual', d: 'conta será criada só depois da confirmação', who: 'Núcleo de análise cadastral', sla: '3 dias úteis' });
    if (st === 'INDETERMINATE') out.push({ t: 'Resultado indeterminado do fornecedor', d: 'nova consulta (requery) programada', who: 'Núcleo de análise cadastral', sla: '3 dias úteis' });
  }
  if (oc === 'FRAUD_REVIEW') out.push({ t: 'Análise complementar de identidade', d: 'segunda divergência facial, caso em prevenção a fraudes', who: 'Prevenção a fraudes', sla: 'conforme política interna' });
  if (oc === 'SERVICE_UNAVAILABLE') out.push({ t: 'Consulta regulatória não concluída', d: 'refazer a consulta A04 no retorno da cliente', who: 'atendente', sla: 'próxima visita' });
  (S.onb.kycDivergencias || []).forEach(c => out.push({ t: `Divergência cadastral: ${c}`, d: 'declarado diferente da fonte, sem correção silenciosa', who: 'Núcleo de análise cadastral', sla: '5 dias úteis' }));
  if (oc === 'ACCOUNT_OPENED') {
    if (S.onb.pin.status === 'DEFERRED_ATM') out.push({ t: 'Senha ainda não definida', d: 'definir no terminal do autoatendimento', who: 'cliente', sla: 'próxima visita' });
    if (S.onb.pin.status === 'SKIPPED') out.push({ t: 'Senha adiada', d: 'cliente optou por não criar agora', who: 'cliente', sla: 'a qualquer momento' });
    if (S.onb.biometric === 'SKIPPED_NO_CONSENT') out.push({ t: 'Biometria não ativada', d: 'recusa registrada; sem impacto na conta', who: 'cliente', sla: '—' });
    if (S.onb.account.cardRequest && S.onb.account.cardRequest.token === 'AGUARDANDO_APARELHO') out.push({ t: 'Cartão virtual sem aparelho', d: 'tokenizar quando a titular tiver celular', who: 'cliente', sla: 'quando houver aparelho' });
  }
  if (S.onb.pin.policyViolation) out.push({ t: 'Orientação sobre senha segura', d: `${S.onb.pin.policyViolation} senha(s) fácil(eis) recusada(s) durante a criação`, who: 'atendente', sla: 'no encerramento' });
  return out;
}
