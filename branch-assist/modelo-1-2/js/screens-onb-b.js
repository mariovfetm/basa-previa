/* ============================================================================
   Branch Assist — Onboarding assistido · E05 a E09
   ========================================================================== */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- E05 */
SCREENS.e05 = {
  title: 'Dados cadastrais declarados',
  hint: 'E05 · dados <b>declarados</b>. Tudo que o sistema deduza de fonte externa fica marcado como verificado, nunca misturado ao que a cliente falou.',
  nextLabel: 'Revisar e seguir',
  render() {
    const c = S.customer;
    return `
    <div class="wrap">
      <div class="h-eyebrow">${ico('user', 14)} E05 · Dados cadastrais</div>
      <h1 class="h1">Dados da cliente</h1>
      <p class="lede">A atendente preenche junto com a cliente, lendo cada campo em voz alta. Campo com máscara de CPF ou telefone tem o valor conferido contra o documento antes de seguir.</p>

      <div class="card">
        <div class="card__head">
          <span class="card__title">Identificação</span>
          <span class="badge badge--brand">declarado</span>
        </div>
        <div class="card__body">
          <div class="grid grid--2">
            <div class="field">
              <label class="field__label" for="d-nome">Nome completo <span class="field__req">*</span></label>
              <input class="field__input" id="d-nome" value="${c.name}">
            </div>
            <div class="field">
              <label class="field__label" for="d-nasc">Data de nascimento <span class="field__req">*</span></label>
              <input class="field__input" id="d-nasc" value="${c.birth}">
            </div>
            <div class="field">
              <label class="field__label" for="d-mae">Nome da mãe</label>
              <input class="field__input" id="d-mae" value="${c.mother}">
              <span class="field__help">Campo do Recibo de Comprovação de Identificação. Não bloqueia a abertura.</span>
            </div>
            <div class="field">
              <label class="field__label" for="d-nat2">Naturalidade</label>
              <input class="field__input" id="d-nat2" value="Bragança/PA">
            </div>
            <div class="field">
              <label class="field__label" for="d-cpf2">CPF</label>
              <input class="field__input" id="d-cpf2" value="${maskCpf(c.cpf)}" readonly>
            </div>
            <div class="field">
              <label class="field__label" for="d-tel">Telefone</label>
              <input class="field__input" id="d-tel" value="${c.phone || 'não informado'}" placeholder="opcional">
              <span class="field__help">Contato é opcional. Sem celular, o modelo não exige aplicativo nem WhatsApp em nenhum momento.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid--2">
        <div class="card">
          <div class="card__title mb-16">Endereço</div>
          <div class="grid">
            <div class="field">
              <label class="field__label" for="d-cep">CEP</label>
              <input class="field__input" id="d-cep" value="${c.address.zip}" inputmode="numeric">
            </div>
            <div class="grid grid--2">
              <div class="field">
                <label class="field__label" for="d-log">Logradouro</label>
                <input class="field__input" id="d-log" value="${c.address.street}">
              </div>
              <div class="field">
                <label class="field__label" for="d-num">Número</label>
                <input class="field__input" id="d-num" value="${c.address.num}">
              </div>
            </div>
            <div class="grid grid--2">
              <div class="field">
                <label class="field__label" for="d-cid">Cidade</label>
                <input class="field__input" id="d-cid" value="${c.address.city}">
              </div>
              <div class="field">
                <label class="field__label" for="d-uf">UF</label>
                <input class="field__input" id="d-uf" value="${c.address.state}">
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card__title mb-16">Perfil econômico declarado</div>
          <div class="grid">
            <div class="field">
              <label class="field__label" for="d-ocup">Ocupação</label>
              <input class="field__input" id="d-ocup" value="${c.occupation}">
            </div>
            <div class="grid grid--2">
              <div class="field">
                <label class="field__label" for="d-cbo">CBO</label>
                <input class="field__input" id="d-cbo" value="${c.cbo}">
              </div>
              <div class="field">
                <label class="field__label" for="d-renda">Renda</label>
                <input class="field__input" id="d-renda" value="${c.income || ''}" inputmode="decimal" placeholder="ex.: 1518,00">
                <span class="tiny muted">Informe apenas o número. A formatação em reais é aplicada na conferência (E09).</span>
              </div>
            </div>
            <div class="field">
              <label class="field__label" for="d-final">Finalidade da conta</label>
              <select class="field__select" id="d-final">
                <option value="RECEIVE_BENEFIT" ${c.purpose === 'RECEIVE_BENEFIT' ? 'selected' : ''}>Receber aposentadoria ou benefício</option>
                <option value="DAILY_BANKING" ${c.purpose === 'DAILY_BANKING' ? 'selected' : ''}>Movimentação do dia a dia</option>
                <option value="RECEIVE_SALARY" ${c.purpose === 'RECEIVE_SALARY' ? 'selected' : ''}>Receber salário</option>
                <option value="BUSINESS" ${c.purpose === 'BUSINESS' ? 'selected' : ''}>Receber e pagar do próprio negócio</option>
              </select>
              <span class="field__help">Ocupação e renda são exigidas pelo Banco Central na abertura de conta.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="note note--alert">
        <span class="note__ic">${ico('scan', 18)}</span>
        <div><b>Declaração é diferente de verificação.</b> <span class="muted">O que a cliente falou fica marcado como <code>DECLARED</code>. O que veio de base oficial entra como <code>VERIFIED</code>, com a fonte registrada. A tela de KYC (E09) mostra as duas colunas lado a lado.</span></div>
      </div>
      <div class="trace">
        <span class="chip chip--iface">E05 · DECLARED</span>
        <span class="chip chip--ca">16.21 · 17.1</span>
        <span class="chip chip--norm">Res. CMN 4.753/2019 · art. 3º · Circ. BCB 3.978/2020</span>
      </div>
    </div>`;
  },
  bind(root) {
    const p = PERSONAS[PERSONA];
    const grab = (sel, key) => {
      const el = root.querySelector(sel);
      if (el) el.oninput = () => { S.customer[key] = el.value; };
    };
    grab('#d-nome', 'name'); grab('#d-nasc', 'birth'); grab('#d-mae', 'mother'); grab('#d-ocup', 'occupation');
    grab('#d-renda', 'income'); grab('#d-cbo', 'cbo');
    const tel = root.querySelector('#d-tel');
    if (tel) tel.oninput = () => { S.customer.phone = /não informado/i.test(tel.value) ? '' : tel.value; };
    const fin = root.querySelector('#d-final');
    if (fin) fin.onchange = () => { S.customer.purpose = fin.value; };
    [['#d-cep', 'zip'], ['#d-log', 'street'], ['#d-num', 'num'], ['#d-cid', 'city'], ['#d-uf', 'state']].forEach(([sel, k]) => {
      const el = root.querySelector(sel);
      if (el) el.oninput = () => { S.customer.address[k] = el.value; };
    });
    if (!S.customer.name) Object.assign(S.customer, {
      name: p.name, birth: p.birth, mother: p.mother, phone: p.phone, income: p.income,
      occupation: p.occupation, cbo: p.cbo, purpose: p.purpose, cpf: p.cpf.replace(/\D/g, ''), address: { ...p.address },
    });
  },
  gate() {
    const c = S.customer;
    const falta = [];
    if (!String(c.name || '').trim()) falta.push('nome completo');
    if (!String(c.birth || '').trim()) falta.push('data de nascimento');
    if (!String(c.occupation || '').trim()) falta.push('ocupação');
    if (!(parseFloat(String(c.income || '').replace(/\./g, '').replace(',', '.')) > 0)) falta.push('renda');
    return falta.length ? `Preencha ${falta.join(', ')}. Ocupação e renda são exigidas na abertura de conta.` : null;
  },
  onNext() { audit('E05', `Dados cadastrais declarados registrados · finalidade ${S.customer.purpose}`); },
};

/* ---------------------------------------------------------------- E06 */
SCREENS.e06 = {
  title: 'Captura do documento',
  hint: 'E06 · documento degradado vai para <b>análise manual</b>, sem recusa automática. A foto bruta vai para o dossiê, sem recorte automático.',
  nextLabel: 'Concluir captura',
  render() {
    const cond = S.onb.documentCondition;
    const CONDS = [
      ['GOOD', 'Documento em bom estado', 'Leitura direta'],
      ['WORN', 'Documento desgastado', 'Leitura com revisão'],
      ['LAMINATED', 'Documento plastificado', 'Reflexo exige análise manual'],
      ['HANDWRITTEN', 'Documento manuscrito', 'Leitura manual'],
      ['PRE_1990', 'Documento sem foto de padrão novo', 'Análise manual'],
    ];
    return `
    <div class="wrap">
      <div class="h-eyebrow">${ico('camera', 14)} E06 · Captura de documento</div>
      <h1 class="h1">Fotografe o documento</h1>
      <p class="lede">A cliente coloca o documento sobre a mesa; a câmera fica com o atendente. O app orienta em voz alta, avisa quando a imagem está ruim e repete a foto quantas vezes for preciso antes do envio, sem limite escondido.</p>
      ${S.onb.docAttempts ? `
      <div class="note note--alert">
        <span class="note__ic">${ico('refresh', 18)}</span>
        <div><b>O fornecedor recusou a imagem enviada.</b> <span class="muted">Nova captura ${S.onb.docAttempts} de ${DOC_RECAPTURE_MAX}. Se for recusada de novo depois da última, a proposta segue para análise manual sem abrir a conta.</span></div>
      </div>` : ''}

      <div class="grid grid--2">
        <div>
          <div class="grid">
            <div class="field">
              <label class="field__label" for="d-tipo">Tipo de documento</label>
              <select class="field__select" id="d-tipo">
                ${['RG', 'CNH', 'CPF (sem outro documento)', 'Passaporte', 'Título de eleitor', 'Documento antigo sem padrão'].map(t =>
                  `<option ${S.onb.documentType === t.split(' ')[0] ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label class="field__label" for="d-cond">Condição do documento</label>
              <select class="field__select" id="d-cond">
                ${CONDS.map(([v, t]) => `<option value="${v}" ${cond === v ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
              <span class="field__help">A condição declarada muda o caminho da análise. Documento ruim nunca vira recusa automática.</span>
            </div>
          </div>

          <div class="grid grid--2 mt-16">
            ${[['docFront', 'Frente do documento', 'Toque para capturar'],
               ['docBack', 'Verso do documento', 'Obrigatório apenas em RG com folha de verso']]
              .map(([lado, titulo, vazio]) => `
            <div class="drop" data-side="${lado}" data-filled="${!!S.onb[lado]}">
              ${S.onb[lado + 'Shot'] ? `
                <img class="drop__img" src="${S.onb[lado + 'Shot']}" alt="${titulo} capturada">
                <div class="drop__t">${titulo}</div>
                <div class="drop__s">Foto capturada · ${ico('check', 12)} legível</div>
                <button class="btn btn--link" data-recapture="${lado}">Capturar de novo</button>
              ` : `
                <div class="drop__ic">${ico('doc', 30)}</div>
                <div class="drop__t">${titulo}</div>
                <div class="drop__s">${S.onb[lado] ? 'Registrada sem imagem' : vazio}</div>
                <div class="inline mt-8" style="justify-content:center">
                  <button class="btn btn--outline" data-capture="${lado}">
                    ${ico('camera', 16)} ${Camera.supported ? 'Usar a câmera' : 'Registrar'}
                  </button>
                  <label class="btn btn--ghost" title="Para estação sem câmera. Alternativa em avaliação com o Banco.">
                    ${ico('folder', 16)} Enviar arquivo
                    <input type="file" accept="image/*" data-upload="${lado}" hidden>
                  </label>
                </div>
              `}
            </div>`).join('')}
          </div>

          <!-- Visor da câmera: aparece só durante a captura -->
          <div class="camshot" id="camshot" hidden>
            <div class="camshot__head">
              <span class="camshot__title" id="camshot-title">Enquadre o documento</span>
              <button class="btn btn--link" data-cam="cancelar">Cancelar</button>
            </div>
            <div class="camshot__frame">
              <video id="cam-video" playsinline muted></video>
              <div class="camshot__guide"></div>
            </div>
            <div class="inline mt-12" style="justify-content:center">
              <button class="btn btn--cta btn--lg" data-cam="tirar">${ico('camera', 18)} Tirar a foto</button>
            </div>
            <div class="tiny muted mt-8" id="camshot-msg">A imagem não é recortada nem tratada: o arquivo original vai para o dossiê.</div>
          </div>

          <div class="note note--info mt-16">
            <span class="note__ic">${ico('info', 18)}</span>
            <div><b>O que o app nunca faz.</b> <span class="muted">Não recorta a imagem automaticamente, não realça contraste e não recusa a foto por baixa qualidade: só avisa e pede outra. O arquivo original vai para o dossiê de análise.</span></div>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card__title mb-16">Qualidade da captura</div>
            <div class="rows">
              <div class="row"><span class="row__k">${ico('scan', 16)} Borda do documento</span><span class="row__v">${S.onb.docFront ? 'dentro da área' : 'aguardando'}</span></div>
              <div class="row"><span class="row__k">${ico('eye', 16)} Reflexo</span><span class="row__v">${S.onb.documentCondition === 'LAMINATED' ? 'detectado' : 'nenhum'}</span></div>
              <div class="row"><span class="row__k">${ico('doc', 16)} Nitidez</span><span class="row__v">${S.onb.documentCondition === 'GOOD' ? 'boa' : 'aceitável'}</span></div>
              <div class="row"><span class="row__k">${ico('file', 16)} Documento bruto</span><span class="row__v" id="e06-doc">${S.onb.documentId || 'não enviado'}</span></div>
            </div>
            <div class="progress"><div class="progress__bar" style="width:${(S.onb.docFront ? 50 : 0) + (S.onb.docBack ? 50 : 0)}%"></div></div>
          </div>

          <div class="card">
            <div class="card__title mb-16">Documento fora do padrão</div>
            <div class="stack">
              <div class="note note--alert"><span class="note__ic">${ico('doc', 18)}</span>
                <div><b>Sem foto de padrão.</b> <span class="muted">Documento antigo, sem padrão biométrico legível: segue para análise manual. Sem bloqueio e sem recusa.</span></div></div>
              <div class="note note--alert"><span class="note__ic">${ico('clock', 18)}</span>
                <div><b>Documento vencido.</b> <span class="muted">A validade expirada não impede conta corrente; impede outros produtos e é registrada como pendência.</span></div></div>
              <div class="note note--danger"><span class="note__ic">${ico('xCircle', 18)}</span>
                <div><b>Documento de terceiro.</b> <span class="muted">Só é aceito como procuração, e apenas no módulo de atendimento (S08), nunca na abertura de conta da própria cliente.</span></div></div>
            </div>
          </div>
          <div class="trace">
            <span class="chip chip--iface">A02 · captura de imagem</span>
            <span class="chip chip--ca">16.1 · 17.3</span>
            <span class="chip chip--norm">Res. CMN 4.753/2019 · Anexo II</span>
          </div>
        </div>
      </div>
    </div>`;
  },
  bind(root) {
    const t = root.querySelector('#d-tipo'); if (t) t.onchange = e => { S.onb.documentType = e.target.value.split(' ')[0]; };
    const c = root.querySelector('#d-cond'); if (c) c.onchange = e => { S.onb.documentCondition = e.target.value; render(); };

    const painel = root.querySelector('#camshot');
    const video = root.querySelector('#cam-video');
    const titulo = root.querySelector('#camshot-title');
    const msg = root.querySelector('#camshot-msg');
    let ladoAtivo = null;

    const fechar = () => {
      Camera.fechar();
      if (painel) painel.hidden = true;
      ladoAtivo = null;
    };

    const abrir = async (lado) => {
      ladoAtivo = lado;
      const nome = lado === 'docFront' ? 'a frente' : 'o verso';
      if (!Camera.supported) {
        /* Sem câmera, o campo é marcado como registrado e o motivo fica na trilha. */
        S.onb[lado] = true;
        audit('A02', `Captura d${nome} registrada sem câmera (navegador sem suporte) · imagem a anexar no dossiê`);
        render();
        return;
      }
      painel.hidden = false;
      titulo.textContent = `Enquadre ${nome} do documento`;
      msg.textContent = 'Pedindo permissão para usar a câmera…';
      /* facingMode 'environment': a câmera traseira é a que fotografa o documento na mesa. */
      const r = await Camera.abrir(video, { facingMode: 'environment' });
      if (!r.ok) {
        msg.textContent = `Câmera indisponível (${r.motivo}). O campo foi marcado como registrado.`;
        S.onb[lado] = true;
        audit('A02', `Captura d${nome} sem câmera (${r.motivo}) · registrada para continuidade`);
        setTimeout(() => { fechar(); render(); }, 1600);
        return;
      }
      msg.textContent = 'A imagem não é recortada nem tratada: o arquivo original vai para o dossiê.';
      audit('A02', `Câmera traseira aberta para capturar ${nome} do documento`);
    };

    root.querySelectorAll('[data-capture]').forEach(b => b.onclick = () => abrir(b.dataset.capture));
    /* Estação sem câmera: a foto do documento vem de um arquivo, reduzida no próprio navegador. */
    root.querySelectorAll('[data-upload]').forEach(inp => inp.onchange = () => {
      const arq = inp.files && inp.files[0];
      const lado = inp.dataset.upload;
      if (!arq) return;
      const leitor = new FileReader();
      leitor.onload = () => {
        const img = new Image();
        img.onload = () => {
          const escala = Math.min(1, 900 / img.naturalWidth);
          const c = document.createElement('canvas');
          c.width = Math.round(img.naturalWidth * escala);
          c.height = Math.round(img.naturalHeight * escala);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          S.onb[lado] = true;
          S.onb[lado + 'Shot'] = c.toDataURL('image/jpeg', 0.82);
          S.onb.documentId = S.onb.documentId || uid('DOC');
          audit('A02', `${lado === 'docFront' ? 'Frente' : 'Verso'} do documento enviada por arquivo (estação sem câmera)`);
          render();
        };
        img.onerror = () => { audit('A02', 'Arquivo enviado não é uma imagem válida · nada foi registrado'); render(); };
        img.src = leitor.result;
      };
      leitor.readAsDataURL(arq);
    });
    root.querySelectorAll('[data-recapture]').forEach(b => b.onclick = () => {
      const lado = b.dataset.recapture;
      S.onb[lado] = false; S.onb[lado + 'Shot'] = null;
      audit('A02', 'Captura anterior descartada a pedido do atendente');
      abrir(lado);
    });

    root.querySelectorAll('[data-cam]').forEach(b => b.onclick = () => {
      if (b.dataset.cam === 'cancelar') {
        audit('A02', 'Captura pela câmera cancelada pelo atendente');
        fechar(); render(); return;
      }
      const foto = Camera.capturar(video, { max: 900 });
      if (ladoAtivo) {
        S.onb[ladoAtivo] = true;
        S.onb[ladoAtivo + 'Shot'] = foto;
        S.onb.documentId = S.onb.documentId || uid('DOC');
        audit('A02', `${ladoAtivo === 'docFront' ? 'Frente' : 'Verso'} do documento capturado pela câmera do dispositivo`);
      }
      fechar(); render();
    });
  },
  gate() {
    if (!S.onb.docFront) return 'Capture a frente do documento antes de seguir.';
    if (S.onb.documentType === 'RG' && !S.onb.docBack) return 'Para RG, capture também o verso do documento.';
    return null;
  },
  onNext() {
    S.onb.documentId = S.onb.documentId || uid('DOC');
    S.onb.docState = 'SUBMITTED';
    S.onb.docManual = false;
    audit('E06', `Documento ${S.onb.documentType} capturado · condição ${S.onb.documentCondition} · ${S.onb.documentId}`);
  },
};

/* ---------------------------------------------------------------- E07 */
SCREENS.e07 = {
  title: 'Selfie com prova de vida',
  hint: 'E07 · modo cliente. Uma tarefa por vez, sem menu lateral, sem espelhamento e com leitura em voz alta.',
  nextLabel: 'Confirmar envio',
  render() {
    if (S.onb.selfie) {
      return `
      <div class="cust">
        <div class="cust__task">${ico('check', 16)} Tarefa concluída</div>
        <h1 class="cust__title">Recebemos sua foto</h1>
        <p class="cust__sub">Agora o tablet volta para o atendente. Se precisar repetir a foto, ele te avisa e o tablet volta para você.</p>
        ${S.onb.selfieShot ? `
        <div class="selfie selfie--done">
          <img src="${S.onb.selfieShot}" alt="Foto capturada da titular">
        </div>` : ''}
        <div class="inline" style="justify-content:center">
          <span class="badge badge--success">Selfie enviada</span>
          <span class="badge badge--neutral">documento ${S.onb.documentId}</span>
        </div>
        <div class="inline mt-16" style="justify-content:center">
          <button class="btn btn--outline" data-act="refazer">${ico('refresh', 18)} Tirar outra foto</button>
        </div>
      </div>`;
    }
    return `
    <div class="cust">
      <div class="cust__task">${ico('camera', 16)} Só para você</div>
      <h1 class="cust__title">Vamos tirar uma foto sua</h1>
      <p class="cust__sub">É para confirmar que é você. Olhe para a câmera e, se conseguir, tire os óculos.</p>
      ${S.onb.faceAttempts ? `
      <div class="note note--info" style="text-align:left">
        <span class="note__ic">${ico('refresh', 18)}</span>
        <div><b>Vamos tirar a foto mais uma vez.</b> <span class="muted">Fique num lugar com boa luz, sem boné ou chapéu, e olhe direto para a câmera.</span></div>
      </div>` : ''}

      <div class="selfie" id="selfie-box">
        <div class="selfie__ring"></div>
        <video id="selfie-video" playsinline muted></video>
        <div id="selfie-ic">${ico('face', 40)}</div>
        <div class="tiny" id="selfie-msg">Toque para abrir a câmera</div>
      </div>

      <div class="inline" style="justify-content:center">
        <button class="btn btn--cta btn--lg" data-act="abrir">${ico('camera', 18)} Abrir a câmera</button>
        <button class="btn btn--cta btn--lg" data-act="tirar" hidden>${ico('camera', 18)} Tirar a foto</button>
      </div>

      <div class="inline mt-16" style="justify-content:center">
        <button class="audiobtn" data-audio="selfie">${ico('speaker', 18)} Ouvir as instruções</button>
      </div>

      <div class="note note--info mt-24" style="text-align:left">
        <span class="note__ic">${ico('shield', 18)}</span>
        <div><b>Por que esta etapa existe.</b> <span class="muted">É a conferência de que a pessoa do documento é a mesma que está aqui. Sem ela, o Banco Central não permite abrir conta a distância, e na agência o critério é o mesmo.</span></div>
      </div>
    </div>`;
  },
  bind(root) {
    /* Instruções faladas: é a etapa em que a titular está sozinha com o
       tablet, então a orientação por voz substitui o atendente. */
    ligarAudio(root.querySelector('[data-audio="selfie"]'), [
      'Vamos tirar uma foto sua.',
      'Isto serve para confirmar que é você mesma, comparando com a foto do seu documento.',
      'Toque no botão Abrir a câmera. Depois, olhe para a tela, deixe o rosto dentro do círculo,',
      'tire o óculos se conseguir, e toque em Tirar a foto.',
      'Se a foto não ficar boa, você pode tirar outra quantas vezes precisar.',
    ].join(' '), 'A02', 'Instruções da prova de vida lidas em voz alta');

    const refazer = root.querySelector('[data-act="refazer"]');
    if (refazer) refazer.onclick = () => {
      S.onb.selfie = false;
      S.onb.selfieShot = null;
      audit('A02', 'Titular optou por repetir a foto e a captura anterior foi descartada');
      render();
    };

    const box = root.querySelector('#selfie-box');
    const video = root.querySelector('#selfie-video');
    const btnAbrir = root.querySelector('[data-act="abrir"]');
    const btnTirar = root.querySelector('[data-act="tirar"]');
    if (!box || !video || !btnAbrir) return;

    const msg = (t) => { const e = root.querySelector('#selfie-msg'); if (e) e.textContent = t; };

    /* Sem câmera (ou sem permissão) a jornada não pode parar: cai para
       captura simulada e registra o motivo na trilha. */
    const simular = (motivo) => {
      box.dataset.state = 'capturing';
      msg('Registrando…');
      audit('A02', `Prova de vida sem câmera (${motivo}): registro simulado para continuidade do atendimento`);
      setTimeout(() => { S.onb.selfie = true; audit('A02', 'Selfie e prova de vida capturadas'); render(); }, 1200);
    };

    if (!Camera.supported) {
      btnAbrir.innerHTML = `${ico('camera', 18)} Registrar sem câmera`;
      btnAbrir.onclick = () => simular('navegador sem suporte');
      msg('Câmera indisponível neste navegador');
      return;
    }

    btnAbrir.onclick = async () => {
      msg('Pedindo permissão para usar a câmera…');
      /* facingMode 'user': é a câmera frontal que enquadra o rosto. */
      const r = await Camera.abrir(video, { facingMode: 'user' });
      if (!r.ok) { msg('Não foi possível abrir a câmera'); simular(r.motivo); return; }
      box.dataset.state = 'live';
      box.dataset.live = 'true';
      btnAbrir.hidden = true;
      btnTirar.hidden = false;
      msg('Deixe o rosto dentro do círculo');
      audit('A02', 'Câmera frontal aberta no modo cliente para prova de vida');
    };

    btnTirar.onclick = () => {
      const foto = Camera.capturar(video, { max: 640 });
      Camera.fechar();
      S.onb.selfieShot = foto;
      S.onb.selfie = true;
      audit('A02', foto ? 'Selfie capturada pela câmera do dispositivo · prova de vida concluída'
                        : 'Selfie confirmada sem imagem legível');
      render();
    };
  },
  gate() {
    return S.onb.selfie ? null : 'Tire a sua foto antes de continuar. Toque em “Abrir a câmera”.';
  },
  onNext() {
    if (S.handoff) S.handoff.mirroringSuppressed = true;
    S.onb.docState = 'SUBMITTED';
    S.onb.docManual = false;
    audit('A02', `Selfie registrada em modo cliente · handoff ${(S.handoff && S.handoff.handoffId) || 's/n'}`);
  },
};

/* ---------------------------------------------------------------- E08 */
/* Regras de documentoscopia (decisão de 01/10/2026):
   · APPROVED           segue para KYC
   · REJECTED_FACE      1ª vez: uma nova selfie (E07); 2ª vez: abertura suspensa,
                        caso para prevenção a fraudes, com protocolo
   · REJECTED_DOCUMENT  nova captura (E06) até DOC_RECAPTURE_MAX; depois, análise manual
   · MANUAL_REVIEW e INDETERMINATE: a conta não é criada; proposta pendente
                        com protocolo e retorno em até 3 dias úteis              */
function e08Pendente() {
  const st = S.onb.docState;
  return !st || st === 'SUBMITTED' || st === 'IN_ANALYSIS';
}

SCREENS.e08 = {
  title: 'Documentoscopia e face match',
  hint: 'E08 · oito estados. Divergência facial permite <b>uma única nova selfie</b>; a segunda suspende a abertura. Análise manual e indeterminado não criam conta.',
  nextLabel() {
    const st = S.onb.docState;
    if (e08Pendente()) return 'Aguardando resultado';
    if (st === 'APPROVED') return 'Prosseguir para KYC';
    if (st === 'REJECTED_FACE') return S.onb.faceAttempts < FACE_RECAPTURE_MAX ? 'Pedir nova selfie' : 'Suspender com protocolo';
    if (st === 'REJECTED_DOCUMENT') return S.onb.docAttempts < DOC_RECAPTURE_MAX ? 'Capturar o documento de novo' : 'Encaminhar à análise manual';
    return 'Registrar pendência com protocolo';
  },
  render() {
    const st = e08Pendente() ? 'IN_ANALYSIS' : S.onb.docState;
    const cfg = DOC_STATES[st] || DOC_STATES.IN_ANALYSIS;
    const tonal = { info: 'info', success: 'success', alert: 'alert', danger: 'danger', neutral: 'info' }[cfg.tone];
    const faceRestante = S.onb.faceAttempts < FACE_RECAPTURE_MAX;
    const docRestante = S.onb.docAttempts < DOC_RECAPTURE_MAX;
    const guide = {
      REJECTED_FACE: faceRestante
        ? `Primeira divergência entre o rosto e a foto do documento. A titular refaz a selfie <b>uma única vez</b>, com o tablet nas mãos dela. Se divergir de novo, a abertura é suspensa e o caso vai para prevenção a fraudes.`
        : `Segunda divergência facial. <b>A abertura é suspensa</b>, sem nova tentativa, e o caso segue para prevenção a fraudes com protocolo. A cliente sai com o protocolo e o prazo de retorno; a tela não fala em fraude com ela.`,
      REJECTED_DOCUMENT: docRestante
        ? `O fornecedor recusou a imagem do documento. Nova captura permitida (${S.onb.docAttempts + 1} de ${DOC_RECAPTURE_MAX}).`
        : `Recusado depois de ${DOC_RECAPTURE_MAX} recapturas. A proposta segue para <b>análise manual</b>, sem abrir a conta.`,
      MANUAL_REVIEW: `O documento está legível, mas fora do padrão. Segue para a equipe de análise com protocolo, e a cliente sai sabendo o prazo: <b>até 3 dias úteis</b>. A conta só é criada depois da confirmação.`,
      INDETERMINATE: `A resposta não é sim nem não. Isso exige <b>protocolo de rastreio</b> e nova consulta (requery). A conta só é criada quando a identidade for confirmada; tratar como recusa seria errar com a cliente.`,
      APPROVED: `Documento e rosto conferidos. O app mostra o resultado explicitamente, com o identificador da análise.`,
    }[st] || 'A análise está em curso no fornecedor. <b>Suspender o app não cancela o envio</b>: a imagem já tem identificador e estado persistido.';
    const podeAbrir = {
      APPROVED: 'sim',
      REJECTED_FACE: faceRestante ? 'só depois da nova selfie' : 'não · abertura suspensa',
      REJECTED_DOCUMENT: docRestante ? 'só depois da nova captura' : 'não · proposta pendente',
      MANUAL_REVIEW: 'não · proposta pendente', INDETERMINATE: 'não · proposta pendente',
    }[st] || 'aguardando resultado';
    return `
    <div class="wrap">
      <div class="h-eyebrow">${ico('scan', 14)} A05 · A06 · A07 · Documentoscopia</div>
      <h1 class="h1">Conferência de identidade</h1>
      <p class="lede">A conferência acontece fora do tablet, no fornecedor de validação. O app acompanha e mostra o resultado; nunca esconde a etapa nem deixa a cliente esperando sem explicação.</p>

      <div class="card">
        <div class="card__head">
          <span class="card__title">Estado atual</span>
          <span class="badge badge--${tonal}">${cfg.label}</span>
        </div>
        <div class="card__body">
          <div class="docstate">
            <div class="docstate__ic" style="background:var(--bg-info-secondary);color:var(--tx-info)">${ico('doc', 22)}</div>
            <div class="docstate__b">
              <div class="docstate__name">Documento · ${S.onb.documentType} · ${S.onb.documentId || 'sem id'}</div>
              <div class="docstate__desc">${cfg.desc}</div>
            </div>
            <span class="badge badge--neutral">A05</span>
          </div>
          <div class="docstate">
            <div class="docstate__ic" style="background:var(--bg-success-secondary);color:var(--tx-success)">${ico('face', 22)}</div>
            <div class="docstate__b">
              <div class="docstate__name">Conferência de rosto · liveness</div>
              <div class="docstate__desc">${st === 'REJECTED_FACE' ? `Divergência identificada no ${S.onb.faceAttempts + 1}º teste de face.` : 'Prova de vida concluída; comparação facial em curso ou concluída.'}</div>
            </div>
            <span class="badge badge--neutral">A06</span>
          </div>
          <div class="docstate">
            <div class="docstate__ic" style="background:var(--c-neutral-60);color:var(--tx-primary)">${ico('flag', 22)}</div>
            <div class="docstate__b">
              <div class="docstate__name">Consulta a lista de indícios de fraude</div>
              <div class="docstate__desc">Participação no mecanismo de troca de informações entre instituições, com a finalidade de prevenir fraude.</div>
            </div>
            <span class="badge badge--neutral">A07</span>
          </div>

          <div class="note note--${tonal === 'neutral' ? 'info' : tonal} mt-16">
            <span class="note__ic">${ico(st === 'APPROVED' ? 'checkCircle' : st === 'REJECTED_FACE' ? 'xCircle' : 'info', 18)}</span>
            <div>${guide}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <span class="card__title">Simular retorno da A06</span>
          <span class="badge badge--neutral">cenário</span>
        </div>
        <div class="card__body">
          <p class="tiny muted mb-16">Sem clique aqui, o retorno é o escolhido em “Resultado Valid · A06” no console.</p>
          <div class="grid grid--3">
            <button class="btn btn--outline" data-doc="IN_ANALYSIS">Em análise</button>
            <button class="btn btn--outline" data-doc="APPROVED">Aprovado</button>
            <button class="btn btn--outline" data-doc="REJECTED_DOCUMENT">Documento recusado</button>
            <button class="btn btn--outline" data-doc="REJECTED_FACE">Divergência facial</button>
            <button class="btn btn--outline" data-doc="MANUAL_REVIEW">Análise manual</button>
            <button class="btn btn--outline" data-doc="INDETERMINATE">Indeterminado</button>
          </div>
          <div class="mt-16">
            <div class="rows">
              <div class="row"><span class="row__k">Tentativa de biometria</span><span class="row__v">${S.onb.faceAttempts ? '2ª tentativa · <b>última</b>' : '1ª tentativa'}</span></div>
              <div class="row"><span class="row__k">Recapturas de documento</span><span class="row__v">${S.onb.docAttempts} de ${DOC_RECAPTURE_MAX}</span></div>
              <div class="row"><span class="row__k">Prazo de resolução</span><span class="row__v">${st === 'MANUAL_REVIEW' || st === 'INDETERMINATE' || (st === 'REJECTED_DOCUMENT' && !docRestante) ? 'até 3 dias úteis' : st === 'REJECTED_FACE' && !faceRestante ? 'prevenção a fraudes' : 'imediato'}</span></div>
              <div class="row"><span class="row__k">Conta pode abrir?</span><span class="row__v">${podeAbrir}</span></div>
            </div>
          </div>
          <div class="trace">
            <span class="chip chip--iface">A05 · A06 · A07</span>
            <span class="chip chip--ca">16.1 · 17.3</span>
            <span class="chip chip--norm">Res. Conj. CMN/BCB 6/2023</span>
          </div>
        </div>
      </div>
    </div>`;
  },
  bind(root) {
    root.querySelectorAll('[data-doc]').forEach(b => b.onclick = () => {
      S.onb.docState = b.dataset.doc;
      S.onb.docManual = true;
      audit('A06', `Resultado da conferência: ${DOC_STATES[b.dataset.doc].label}`);
      render();
    });
    /* Envio novo: a resposta chega do fornecedor em instantes, conforme o
       cenário escolhido no console. */
    if (e08Pendente() && !S.onb.docManual) {
      S.onb.docState = 'IN_ANALYSIS';
      clearTimeout(SCREENS.e08._t);
      SCREENS.e08._t = setTimeout(() => {
        if (step().render !== 'e08' || S.onb.docState !== 'IN_ANALYSIS' || S.onb.docManual) return;
        S.onb.docState = S.onb.validScenario;
        audit('A06', `Retorno do fornecedor: ${DOC_STATES[S.onb.docState].label}`);
        render();
      }, 1500);
    }
  },
  gate() {
    return e08Pendente() ? 'A conferência ainda está em andamento. Aguarde o retorno do fornecedor de validação.' : null;
  },
  onNext() {
    const st = S.onb.docState;
    const pendencia = (motivo) => {
      S.onb.outcome = 'PENDING_IDENTITY';
      S.onb.protocolo = S.onb.protocolo || uid('PRO');
      audit('I07', `Protocolo ${S.onb.protocolo} emitido · ${motivo} · conta não criada · resolução em até 3 dias úteis`);
      return { ir: 'E14' };
    };
    audit('A05', `Documentoscopia encerrada em ${st}`);
    if (st === 'APPROVED') { S.onb.kycDone = true; return; }
    if (st === 'REJECTED_FACE') {
      if (S.onb.faceAttempts < FACE_RECAPTURE_MAX) {
        S.onb.faceAttempts++;
        S.onb.selfie = false; S.onb.selfieShot = null; S.onb.docState = null; S.onb.docManual = false;
        audit('A06', `Divergência facial ${S.onb.faceAttempts}ª · nova selfie solicitada (única)`);
        return { ir: 'E07' };
      }
      S.onb.outcome = 'FRAUD_REVIEW';
      S.onb.protocolo = S.onb.protocolo || uid('PRO');
      audit('A07', `Segunda divergência facial · abertura suspensa · caso ${S.onb.protocolo} encaminhado à prevenção a fraudes`);
      return { ir: 'E14' };
    }
    if (st === 'REJECTED_DOCUMENT') {
      if (S.onb.docAttempts < DOC_RECAPTURE_MAX) {
        S.onb.docAttempts++;
        S.onb.docFront = false; S.onb.docBack = false; S.onb.docFrontShot = null; S.onb.docBackShot = null;
        S.onb.documentId = null; S.onb.docState = null; S.onb.docManual = false;
        audit('A05', `Documento recusado · nova captura ${S.onb.docAttempts} de ${DOC_RECAPTURE_MAX}`);
        return { ir: 'E06' };
      }
      return pendencia('documento recusado depois das recapturas, análise manual');
    }
    if (st === 'MANUAL_REVIEW') return pendencia('documento em análise manual');
    if (st === 'INDETERMINATE') return pendencia('resultado indeterminado, requery programado');
    if (st === 'CANCELLED') { S.onb.outcome = 'CANCELLED'; return { ir: 'E14' }; }
  },
};

/* ---------------------------------------------------------------- E09 */
/* Declarado (E05) × verificado (bases externas, simuladas). A diferença vira
   pendência com dono e prazo, nunca correção silenciosa. 16.5, 16.6, 16.22,
   17.1: enriquecimento e legitimidade de renda; 16.21: propósito da relação. */
function e09Base() {
  const lk = S.onb.lookup;
  const p = lk && lk.persona ? PERSONAS[lk.persona] : (lk && lk.name ? null : PERSONAS[PERSONA]);
  return {
    name: lk && lk.name ? lk.name : (p ? p.name : ''),
    birth: lk && lk.birth ? lk.birth : (p ? p.birth : ''),
    occupation: p ? p.occupation : 'sem fonte externa',
    v: p ? p.verificado : { renda: 'sem fonte externa aplicável', fonteRenda: '—', telefone: '—', endereco: '—', obito: 'não consta', vinculos: '—' },
  };
}
function e09Divergencias() {
  const b = e09Base(), c = S.customer;
  const norm = (x) => String(x || '').trim().toLowerCase();
  const out = [];
  if (norm(c.name) !== norm(b.name)) out.push('nome');
  if (norm(c.birth) !== norm(b.birth)) out.push('data de nascimento');
  if (b.occupation !== 'sem fonte externa' && norm(c.occupation) !== norm(b.occupation)) out.push('ocupação');
  return out;
}
const PROPOSITO = {
  RECEIVE_BENEFIT: 'recebimento de benefício', DAILY_BANKING: 'movimentação do dia a dia',
  RECEIVE_SALARY: 'recebimento de salário', BUSINESS: 'movimentação do próprio negócio',
};

SCREENS.e09 = {
  title: 'KYC, enriquecimento e segmentação',
  hint: 'E09 · declarado × verificado lado a lado. A divergência vira pendência com dono e prazo, nunca correção silenciosa.',
  nextLabel: 'Concluir KYC',
  render() {
    const b = e09Base(), c = S.customer;
    const div = e09Divergencias();
    const conf = (campo) => div.includes(campo)
      ? '<span class="badge badge--alert">divergente</span>' : '<span class="badge badge--success">confere</span>';
    const risco = e09Risco();
    const pep = S.onb.pepStatus === 'PENDENTE' ? 'em consulta' : S.onb.pepStatus === 'PENDING' ? 'não avaliado' : S.onb.pepStatus;
    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('scale', 14)} I02 · A14 · KYC e enriquecimento</div>
      <h1 class="h1">Conferência de dados e perfil de risco</h1>
      <p class="lede">A KYC compara o que a cliente declarou com as bases oficiais e define o perfil de risco, que determina limite, salvaguardas e quem pode aprovar a conta.</p>

      <div class="card">
        <div class="card__head">
          <span class="card__title">Comparação declarado × verificado</span>
          <span class="badge badge--${div.length ? 'alert' : 'success'}">${div.length ? div.length + ' divergência(s)' : 'sem divergências'}</span>
        </div>
        <div class="card__body" style="padding:0">
          <table class="table">
            <thead><tr><th>Campo</th><th>Declarado pela cliente</th><th>Verificado na fonte</th><th>Situação</th></tr></thead>
            <tbody>
              <tr><td>Nome</td><td>${c.name || '—'}</td><td>${b.name || '—'}</td><td>${conf('nome')}</td></tr>
              <tr><td>Data de nascimento</td><td>${c.birth ? dataBR(c.birth) : '—'}</td><td>${b.birth ? dataBR(b.birth) : '—'}</td><td>${conf('data de nascimento')}</td></tr>
              <tr><td>CPF</td><td>${maskCpf(c.cpf)}</td><td>${maskCpf(c.cpf)} · situação regular</td><td><span class="badge badge--success">confere</span></td></tr>
              <tr><td>Ocupação</td><td>${c.occupation || '—'}</td><td>${b.occupation}</td><td>${conf('ocupação')}</td></tr>
              <tr><td>Renda</td><td>${money(c.income || 0)}</td><td>${b.v.renda}<div class="tiny muted">${b.v.fonteRenda}</div></td><td><span class="badge badge--success">legítima</span></td></tr>
              <tr><td>PEP</td><td>não declarado</td><td>${pep}</td><td><span class="badge badge--${S.onb.pepStatus === 'NEGATIVO' ? 'success' : 'info'}">${S.onb.pepStatus === 'NEGATIVO' ? 'não é PEP' : pep}</span></td></tr>
              <tr><td>Documento de identificação</td><td>${S.onb.documentType}</td><td>${(DOC_STATES[S.onb.docState] || DOC_STATES.IN_ANALYSIS).label}</td><td><span class="badge badge--${S.onb.docState === 'APPROVED' ? 'success' : 'alert'}">${S.onb.docState === 'APPROVED' ? 'ok' : 'pendente'}</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid grid--3">
        <div class="card">
          <div class="card__title mb-16">${ico('chart', 16)} Perfil de risco</div>
          <div class="rows">
            <div class="row"><span class="row__k">Faixa</span><span class="row__v row__v--lg">${risco === 'LOW' ? 'Baixo' : 'Médio'}</span></div>
            <div class="row"><span class="row__k">Limite de transferência</span><span class="row__v row__v--wrap">${money(limiteConta())}</span></div>
            <div class="row"><span class="row__k">Salvaguardas</span><span class="row__v row__v--wrap">completas</span></div>
            <div class="row"><span class="row__k">Aprovação</span><span class="row__v row__v--wrap">${risco === 'LOW' ? 'atendente' : 'supervisor'}</span></div>
          </div>
        </div>
        <div class="card">
          <div class="card__title mb-16">${ico('scale', 16)} Propósito e segmentação</div>
          <div class="rows">
            <div class="row"><span class="row__k">Propósito declarado</span><span class="row__v row__v--wrap">${PROPOSITO[c.purpose] || '—'}</span></div>
            <div class="row"><span class="row__k">Natureza da relação</span><span class="row__v row__v--wrap">${c.purpose === 'BUSINESS' ? 'pessoa física com atividade empresarial' : 'pessoa física, uso pessoal'}</span></div>
            <div class="row"><span class="row__k">Recebimento em espécie</span><span class="row__v row__v--wrap">sim</span></div>
            <div class="row"><span class="row__k">Monitoramento</span><span class="row__v row__v--wrap">${risco === 'LOW' ? 'padrão' : 'reforçado'}</span></div>
          </div>
        </div>
        <div class="card">
          <div class="card__title mb-16">${ico('folder', 16)} Enriquecimento (fontes externas)</div>
          <div class="rows">
            <div class="row"><span class="row__k">Telefone</span><span class="row__v row__v--wrap">${b.v.telefone}</span></div>
            <div class="row"><span class="row__k">Endereço</span><span class="row__v row__v--wrap">${b.v.endereco}</span></div>
            <div class="row"><span class="row__k">Óbito</span><span class="row__v row__v--wrap">${b.v.obito}</span></div>
            <div class="row"><span class="row__k">Vínculos</span><span class="row__v row__v--wrap">${b.v.vinculos}</span></div>
            <div class="row"><span class="row__k">Vínculo bancário</span><span class="row__v row__v--wrap">novo relacionamento</span></div>
          </div>
        </div>
      </div>

      <div class="note note--alert">
        <span class="note__ic">${ico('alert', 18)}</span>
        <div><b>Divergência não se resolve adivinhando.</b> <span class="muted">Se o declarado não bater com a fonte, o sistema abre <strong>pendência com dono e prazo</strong> e segue o fluxo. Nenhum atendente “ajusta” o dado para fechar a demanda.</span></div>
      </div>
      <div class="trace">
        <span class="chip chip--iface">I02 · A14</span>
        <span class="chip chip--ca">16.5 · 16.6 · 16.21 · 16.22 · 17.1</span>
        <span class="chip chip--norm">Res. CMN 4.753/2019 · art. 3º, XI · Circ. BCB 3.978/2020</span>
      </div>
    </div>`;
  },
  onNext() {
    S.onb.account.risk = e09Risco();
    S.onb.kycDivergencias = e09Divergencias();
    audit('I02', `KYC concluída · risco ${S.onb.account.risk} · alçada ${S.onb.account.risk === 'LOW' ? 'atendente' : 'supervisor'}`
               + (S.onb.kycDivergencias.length ? ` · divergência em ${S.onb.kycDivergencias.join(', ')} registrada como pendência` : ''));
  },
};

function e09Risco() {
  return S.onb.docState === 'APPROVED' && !e09Divergencias().length && S.onb.eligibility !== 'RESTRICTED' ? 'LOW' : 'MEDIUM';
}
