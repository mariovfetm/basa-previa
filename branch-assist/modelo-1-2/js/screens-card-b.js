/* =========================================================================
   TELAS — 2ª via/senha do cartão (S30) e visão consolidada (S31)
   -------------------------------------------------------------------------
   14.4.6    Solicitação e rastreamento de envio de cartões ........ S30
   15.27.2   Solicitação de 2ª via ................................ S30
   15.27.6   Alteração de senha do cartão ......................... S30
   15.27.7   Cadastramento de senha para primeiro acesso .......... S30
   1.1.5     Apuração de saldos: CC, cheque especial, aplicações ... S31
   1.1.6     Interface de consulta de saldos ...................... S31
   1.1.11    Identificar contas paralisadas ....................... S31
   1.1.74.1  Detalhamento dos dados de conta corrente ............. S31
   1.1.74.8  Consultar atributos e parâmetros ..................... S31
   1.1.74.9  Consultar código de cliente x CPF .................... S31
   1.1.74.10 Consultar contas correntes por cliente ............... S31
   1.1.74.11 Consultar contas por situação ........................ S31
   1.1.74.13 Consultar dados de contas x cliente .................. S31
   14.4.7    Dados do cartão: limite, anuidade, aproximação ....... S31
   15.2.7    Consulta de conta corrente com cartão ................ S31
   15.2.8    Consulta de conta poupança ........................... S31
   16.29     Alertas de risco em tempo real ....................... S31
   ======================================================================= */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- S30
   Senha do cartão é da titular: teclado no modo cliente, nunca ditada
   ao atendente. Rastreamento da entrega fica visível para ela.         */
SCREENS.s30 = {
  title: '2ª via, entrega e senha',
  hint: 'S30 · modo cliente. A senha é digitada <b>pela titular</b>, nunca dita em voz alta nem ao atendente. O rastreio da entrega fica visível para ela.',
  nextLabel: 'Concluir',
  render() {
    const sel = S.cards.lista.find(c => c.id === S.cards.cardSel) || S.cards.lista[0];
    const pin = S.cards.pin || { entry: '', confirm: '', stage: 'entry', done: false };
    const emTransito = S.cards.lista.filter(c => c.entrega);
    const sv = S.cards.segundaVia;

    if (pin.done) {
      return `
      <div class="cust" style="text-align:left;max-width:760px">
        <div class="cust__task">${ico('check', 16)} Tarefa concluída</div>
        <h1 class="cust__title">Senha cadastrada</h1>
        <p class="cust__sub" style="text-align:left">Sua senha está guardada. Ninguém do banco pode ver nem pedir ela, nem pelo telefone, nem aqui na agência.</p>
        <div class="note note--info">
          <span class="note__ic">${ico('shield', 18)}</span>
          <div><b>Se alguém pedir sua senha, é golpe.</b> <span class="muted">O banco nunca liga pedindo senha. Se acontecer, desligue e venha à agência.</span></div>
        </div>
        <button class="audiobtn mt-16" data-audio="senha-ok">${ico('speaker', 18)} Ouvir este aviso</button>
      </div>`;
    }

    return `
    <div class="cust" style="text-align:left;max-width:820px">
      <div class="cust__task">${ico('card', 16)} Só para você</div>
      <h1 class="cust__title">Seu cartão</h1>
      <p class="cust__sub" style="text-align:left">Aqui você acompanha a entrega e cadastra a sua senha.</p>

      <div class="inline mb-16" style="justify-content:flex-start">
        <button class="audiobtn" data-audio="cartao">${ico('speaker', 18)} Ouvir em voz alta</button>
      </div>

      ${sv ? `
      <div class="card">
        <div class="card__head"><span class="card__title">Segunda via pedida</span>
          <span class="badge badge--info">protocolo ${sv.protocolo}</span></div>
        <div class="card__body">
          <p class="p">O cartão antigo foi bloqueado e não funciona mais. Um novo já foi pedido e chega na agência. Você será avisada quando chegar.</p>
          <div class="note note--info">
            <span class="note__ic">${ico('info', 18)}</span>
            <div><b>Não tem custo.</b> <span class="muted">Segunda via por perda, roubo ou fraude é isenta de tarifa.</span></div>
          </div>
        </div>
      </div>` : ''}

      ${emTransito.length ? emTransito.map(c => `
      <div class="card">
        <div class="card__head"><span class="card__title">${c.nome} ···· ${c.final}</span>
          <span class="badge badge--info">chega em ${Math.max(0, Math.round((parseISO(c.entrega.previsao) - new Date()) / 864e5))} dias</span></div>
        <div class="card__body">
          <div class="rows mb-16">
            <div class="row"><span class="row__k">Onde está</span><span class="row__v">${c.entrega.etapa}</span></div>
            <div class="row"><span class="row__k">Previsão</span><span class="row__v">${parseISO(c.entrega.previsao).toLocaleDateString('pt-BR')}</span></div>
            <div class="row"><span class="row__k">Código de rastreio</span><span class="row__v"><code>${c.entrega.objeto}</code></span></div>
          </div>
          <div class="card__title mb-8">Por onde passou</div>
          ${c.entrega.historico.slice().reverse().map(h => `
            <div class="inline" style="justify-content:flex-start;gap:var(--sp-12);padding:var(--sp-8) 0">
              <span class="badge badge--neutral">${parseISO(h.em).toLocaleDateString('pt-BR')}</span>
              <span>${h.ev}</span>
            </div>`).join('')}
        </div>
      </div>`).join('') : ''}

      <div class="card">
        <div class="card__head">
          <span class="card__title">${sel.senhaDefinida ? 'Trocar a senha' : 'Criar a senha do cartão'}</span>
          <span class="badge badge--${sel.senhaDefinida ? 'neutral' : 'alert'}">${sel.senhaDefinida ? 'já tem senha' : 'primeiro acesso'}</span>
        </div>
        <div class="card__body">
          <p class="p">${pin.stage === 'confirm'
            ? 'Agora digite os mesmos quatro números outra vez, para confirmar.'
            : 'Escolha quatro números que você consiga lembrar. Não use sua data de nascimento nem números em sequência.'}</p>

          <div class="pin__dots">
            ${[0, 1, 2, 3].map(i => {
              const v = pin.stage === 'confirm' ? pin.confirm : pin.entry;
              return `<span class="pin__dot" data-filled="${i < v.length}"></span>`;
            }).join('')}
          </div>

          ${pin.erro ? `
          <div class="note note--danger">
            <span class="note__ic">${ico('xCircle', 18)}</span>
            <div><b>${pin.erro}</b></div>
          </div>` : ''}

          <div class="keypad keypad--a11y">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}
            <button data-act="apagar">${ico('arrowLeft', 20)}</button>
            <button data-k="0">0</button>
            <button data-act="ok">OK</button>
          </div>

          <div class="note note--info mt-16">
            <span class="note__ic">${ico('shield', 18)}</span>
            <div><b>Ninguém pode ver o que você digita.</b> <span class="muted">O atendente não vê a senha, e ela não aparece na tela dele. Se alguém pedir sua senha, é golpe.</span></div>
          </div>
        </div>
      </div>

      <div class="trace" style="justify-content:flex-start">
        <span class="chip chip--iface">I34 · A10</span>
        <span class="chip chip--ca">14.4.6 · 15.27.2 · 15.27.6 · 15.27.7</span>
        <span class="chip chip--norm">Lei 8.078/1990 (CDC)</span>
      </div>
    </div>`;
  },
  bind(root) {
    const sel = S.cards.lista.find(c => c.id === S.cards.cardSel) || S.cards.lista[0];
    if (!S.cards.pin) S.cards.pin = { entry: '', confirm: '', stage: 'entry', done: false };
    const pin = S.cards.pin;

    if (pin.done) {
      ligarAudio(root.querySelector('[data-audio="senha-ok"]'),
        'Sua senha está cadastrada. Guarde ela só na sua memória. O banco nunca vai ligar pedindo a sua senha. '
        + 'Se alguém ligar pedindo, é golpe: desligue e venha à agência.',
        'A10', 'Aviso de segurança da senha lido em voz alta');
      return;
    }

    const emTransito = S.cards.lista.filter(c => c.entrega);
    ligarAudio(root.querySelector('[data-audio="cartao"]'), [
      'Seu cartão.',
      S.cards.segundaVia ? 'Seu cartão antigo foi bloqueado e um novo já foi pedido, sem custo.' : '',
      ...emTransito.map(c => {
        const d = Math.max(0, Math.round((parseISO(c.entrega.previsao) - new Date()) / 864e5));
        return `O ${c.nome} está ${c.entrega.etapa.toLowerCase()} e deve chegar em ${d} dias.`;
      }),
      sel.senhaDefinida
        ? 'Abaixo você pode trocar a senha do seu cartão.'
        : 'Agora você vai criar a senha do seu cartão.',
      'Escolha quatro números que você consiga lembrar. Não use a sua data de nascimento, nem números em sequência.',
      'Importante: ninguém do banco pode ver ou pedir a sua senha. Se alguém pedir, é golpe.',
    ].filter(Boolean).join(' '), 'A10', 'Instruções de senha do cartão lidas em voz alta');

    root.querySelectorAll('.keypad button').forEach(b => b.onclick = () => {
      pin.erro = null;
      const campo = pin.stage === 'confirm' ? 'confirm' : 'entry';

      if (b.dataset.act === 'apagar') {
        pin[campo] = pin[campo].slice(0, -1);
        render(); return;
      }
      if (b.dataset.act === 'ok') {
        if (pin[campo].length < 4) { pin.erro = 'Faltam números. A senha tem quatro.'; render(); return; }
        if (pin.stage === 'entry') {
          /* Senha previsível é recusada (mesma regra da senha da conta, E11). */
          const motivo = senhaPrevisivel(pin.entry, S.customer.birth);
          if (motivo) {
            pin.erro = 'Essa senha é fácil de adivinhar. Escolha outros números.';
            pin.entry = '';
            audit('A10', `Senha do cartão recusada por ser previsível (${motivo}) · titular orientada a escolher outra`);
            render(); return;
          }
          pin.stage = 'confirm';
          audit('A10', 'Senha digitada pela titular · aguardando confirmação');
          render(); return;
        }
        if (pin.entry !== pin.confirm) {
          pin.erro = 'Os números não são os mesmos. Vamos tentar de novo.';
          pin.entry = ''; pin.confirm = ''; pin.stage = 'entry';
          audit('A10', 'Confirmação de senha divergente e processo reiniciado pela titular');
          render(); return;
        }
        pin.done = true;
        pin.entry = ''; pin.confirm = ''; pin.stage = 'entry';
        sel.senhaDefinida = true;
        audit('A10', `Senha do cartão ···· ${sel.final} cadastrada pela titular · valor nunca exibido ao atendente nem registrado na trilha`);
        render(); return;
      }
      if (pin[campo].length < 4) {
        pin[campo] += b.dataset.k;
        if (S.a11y.hapticFeedback && navigator.vibrate) navigator.vibrate(20);
        render();
      }
    });
  },
  onNext() {
    const pin = S.cards.pin;
    if (pin && !pin.done) audit('A10', 'Etapa encerrada sem cadastro de senha: cartão segue sem senha até novo atendimento');
  },
};

/* Tratativas possíveis de um alerta de risco (16.29). */
const TRATATIVAS = {
  CONFIRMADO_CLIENTE: 'Cliente confirmou a operação',
  CARTAO_BLOQUEADO: 'Cartão bloqueado e 2ª via pedida',
  ORIENTADA: 'Cliente orientada sobre golpes',
  ENCAMINHADO: 'Enviado à prevenção a fraudes',
  SEM_ACAO: 'Verificado, sem ação necessária',
};

/* ---------------------------------------------------------------- S31
   Visão consolidada: tudo do cliente numa tela, com alertas de risco.  */
SCREENS.s31 = {
  title: 'Visão consolidada e alertas',
  hint: 'S31 · patrimônio, contas, cartões e alertas de risco em uma tela. <b>Alerta de risco não fica escondido</b> em relatório que ninguém abre.',
  nextLabel: 'Encerrar atendimento',
  render() {
    const contas = S.cc.contas;
    const cards = S.cards.lista;
    const inv = S.inv.positions;
    const ch = S.cc.chequeEspecial;
    const alertas = S.cards.alertas;

    const totalContas = contas.reduce((a, c) => a + c.saldo, 0);
    /* A poupança já está em "contas": somá-la de novo nas aplicações
       contaria o mesmo dinheiro duas vezes. */
    const totalInv = inv.filter(p => p.produto !== 'POUPANCA').reduce((a, p) => a + p.bruto, 0);
    const patrimonio = totalContas + totalInv;
    const dividaCartao = cards.reduce((a, c) => a + (c.usado || 0), 0);
    const dividaCheque = ch.usado || 0;
    const NIVEL = { ALTO: ['danger', 'alto'], MEDIO: ['alert', 'médio'], BAIXO: ['info', 'baixo'] };

    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('users', 14)} I35 · Visão consolidada</div>
      <h1 class="h1">${S.customer.name}</h1>
      <p class="lede">Código de cliente <code>${S.session.customerCode || 'CLI-' + String(S.customer.cpf).slice(0, 6)}</code> · CPF ${maskCpf(S.customer.cpf)} · cliente desde ${parseISO(contas[0].abertaEm).getFullYear()}</p>

      ${alertas.filter(a => a.nivel === 'ALTO').length ? `
      <div class="note note--danger">
        <span class="note__ic">${ico('alert', 18)}</span>
        <div><b>${alertas.filter(a => a.nivel === 'ALTO')[0].titulo}.</b> <span class="muted">${alertas.filter(a => a.nivel === 'ALTO')[0].detalhe}</span></div>
      </div>` : ''}

      <div class="grid grid--3 mb-16">
        <div class="card"><div class="tiny muted">Patrimônio no banco</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:var(--c-verde-escuro-2)">${money(patrimonio)}</div>
          <div class="tiny muted">contas + aplicações</div></div>
        <div class="card"><div class="tiny muted">Dívidas no banco</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:${dividaCartao + dividaCheque ? 'var(--c-destructive-150)' : 'var(--tx-secondary)'}">${money(dividaCartao + dividaCheque)}</div>
          <div class="tiny muted">cartão + cheque especial</div></div>
        <div class="card"><div class="tiny muted">Alertas de risco</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:${alertas.length ? 'var(--c-warning-150)' : 'var(--tx-secondary)'}">${alertas.length}</div>
          <div class="tiny muted">${alertas.filter(a => a.nivel === 'ALTO').length} de nível alto</div></div>
      </div>

      <div class="grid grid--2">
        <div>
          <div class="card card--flush">
            <div class="card__head"><span class="card__title">Contas</span>
              <span class="badge badge--neutral">${contas.filter(c => c.situacao === 'ATIVA').length} ativas de ${contas.length}</span></div>
            <div class="card__body" style="padding:0">
              <table class="table">
                <thead><tr><th>Conta</th><th>Tipo</th><th>Situação</th><th>Saldo</th></tr></thead>
                <tbody>
                  ${contas.map(c => `
                  <tr>
                    <td><code>${c.id}</code>${c.temCartao ? '<div class="tiny muted">com cartão</div>' : ''}</td>
                    <td>${c.tipo === 'CORRENTE' ? 'corrente' : 'poupança'}</td>
                    <td><span class="badge badge--${c.situacao === 'ATIVA' ? 'success' : 'alert'}">${c.situacao === 'ATIVA' ? 'ativa' : c.situacao === 'PARALISADA' ? 'paralisada' : 'em encerramento'}</span></td>
                    <td><b>${money(c.saldo)}</b>${c.bloqueado ? `<div class="tiny" style="color:var(--c-destructive-150)">${money(c.bloqueado)} bloqueado</div>` : ''}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card card--flush">
            <div class="card__head"><span class="card__title">Cartões</span></div>
            <div class="card__body" style="padding:0">
              <table class="table">
                <thead><tr><th>Cartão</th><th>Situação</th><th>Limite</th><th>Anuidade</th></tr></thead>
                <tbody>
                  ${cards.map(c => `
                  <tr>
                    <td><b>···· ${c.final}</b><div class="tiny muted">${c.nome}${c.aproximacao ? ' · aproximação' : ''}</div></td>
                    <td><span class="badge badge--${c.situacao === 'ATIVO' ? 'success' : c.situacao === 'AGUARDANDO_ENTREGA' ? 'info' : 'alert'}">${
                      { ATIVO: 'ativo', BLOQUEADO_TEMP: 'bloq. temporário', BLOQUEADO_DEF: 'bloq. definitivo',
                        AGUARDANDO_ENTREGA: 'a caminho', CANCELADO: 'cancelado' }[c.situacao] || c.situacao}</span></td>
                    <td>${c.limite ? money(c.limite) : '—'}</td>
                    <td>${c.anuidade ? money(c.anuidade) : 'isento'}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card__title mb-16">Apuração de saldos</div>
            <div class="rows">
              <div class="row"><span class="row__k">Conta corrente</span><span class="row__v">${money(saldoCC())}</span></div>
              <div class="row"><span class="row__k">Poupança</span><span class="row__v">${money(saldoPoup())}</span></div>
              <div class="row"><span class="row__k">Aplicações</span><span class="row__v">${money(totalInv)}</span></div>
              <div class="row"><span class="row__k">Cheque especial contratado</span><span class="row__v">${ch.contratado ? money(ch.limite) : 'não tem'}</span></div>
              <div class="row"><span class="row__k">Cheque especial em uso</span><span class="row__v">${dividaCheque ? money(dividaCheque) : 'nada'}</span></div>
              <div class="row"><span class="row__k"><b>Posição líquida</b></span><span class="row__v row__v--lg">${money(patrimonio - dividaCartao - dividaCheque)}</span></div>
            </div>
          </div>
        </div>

        <div>
          <div class="card card--flush">
            <div class="card__head"><span class="card__title">Alertas de risco</span>
              <button class="btn btn--ghost" data-audio="alertas">${ico('speaker', 18)} Ouvir</button></div>
            <div class="card__body">
              ${alertas.map(a => {
                const n = NIVEL[a.nivel] || ['neutral', a.nivel];
                return `
                <div class="note note--${n[0]}" style="margin-bottom:var(--sp-12)">
                  <span class="note__ic">${ico('alert', 18)}</span>
                  <div>
                    <b>${a.titulo}</b>
                    <div class="tiny muted mt-8">${a.detalhe}</div>
                    <div class="tiny mt-8">
                      <span class="badge badge--${n[0]}">risco ${n[1]}</span>
                      <span class="muted" style="margin-left:6px">${parseISO(a.em).toLocaleDateString('pt-BR')}</span>
                    </div>
                    ${S.cards.tratativas[a.id] ? `
                    <div class="tiny mt-8"><span class="badge badge--success">tratado</span> <span class="muted">${TRATATIVAS[S.cards.tratativas[a.id]]}</span></div>` : `
                    <div class="inline mt-8">
                      <select class="field__select" data-trat-sel="${a.id}" aria-label="Tratativa do alerta ${a.titulo}" style="max-width:300px">
                        ${Object.entries(TRATATIVAS).map(([k, t]) => `<option value="${k}">${t}</option>`).join('')}
                      </select>
                      <button class="btn btn--outline" data-trat="${a.id}">${ico('check', 16)} Registrar</button>
                    </div>`}
                  </div>
                </div>`;
              }).join('')}
              ${!alertas.length ? `
              <div class="note note--success">
                <span class="note__ic">${ico('check', 18)}</span>
                <div><b>Nenhum alerta ativo.</b></div>
              </div>` : ''}
              <p class="tiny muted">${alertas.filter(a => !S.cards.tratativas[a.id]).length} de ${alertas.length} alerta(s) sem tratativa. O atendimento só encerra com todos tratados.</p>
            </div>
          </div>

          <div class="card">
            <div class="card__title mb-16">Atributos cadastrais</div>
            <div class="rows">
              <div class="row"><span class="row__k">Tipo de pessoa</span><span class="row__v">física</span></div>
              <div class="row"><span class="row__k">Ocupação</span><span class="row__v">${S.customer.occupation || '—'}</span></div>
              <div class="row"><span class="row__k">Renda declarada</span><span class="row__v">${money(S.customer.income || 0)}</span></div>
              <div class="row"><span class="row__k">Perfil de investidor</span><span class="row__v">${S.inv.suitability.profile ? SUIT_PROFILES[S.inv.suitability.profile].label : 'não respondido'}</span></div>
              <div class="row"><span class="row__k">Risco de crédito</span><span class="row__v">${S.cred.limits.credito.risco}</span></div>
              <div class="row"><span class="row__k">Adesão ao DDA</span><span class="row__v">${S.ops.dda.adherido ? 'sim' : 'não'}</span></div>
              <div class="row"><span class="row__k">Histórico de lançamentos</span><span class="row__v">${S.cc.lancamentos.filter(l => l.ativo).length} ativos</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="trace">
        <span class="chip chip--iface">I35</span>
        <span class="chip chip--ca">1.1.5 · 1.1.6 · 1.1.11 · 1.1.74.1 · 1.1.74.8 · 1.1.74.9 · 1.1.74.10 · 1.1.74.11 · 1.1.74.13 · 14.4.7 · 15.2.7 · 15.2.8 · 16.29</span>
        <span class="chip chip--norm">Res. CMN 4.557/2017 · Circ. BCB 3.978/2020</span>
      </div>
    </div>`;
  },
  bind(root) {
    const alertas = S.cards.alertas;

    ligarAudio(root.querySelector('[data-audio="alertas"]'), [
      `${alertas.length} ${alertas.length === 1 ? 'alerta' : 'alertas'} de risco na conta da cliente.`,
      ...alertas.map(a => `Risco ${a.nivel === 'ALTO' ? 'alto' : a.nivel === 'MEDIO' ? 'médio' : 'baixo'}: ${a.titulo}. ${a.detalhe}`),
    ].join(' '), 'I35', 'Alertas de risco lidos em voz alta');

    root.querySelectorAll('[data-trat]').forEach(b => b.onclick = () => {
      const id = b.dataset.trat;
      const sel = root.querySelector(`[data-trat-sel="${id}"]`);
      const a = alertas.find(x => x.id === id);
      S.cards.tratativas[id] = sel.value;
      audit('I35', `Alerta ${a.nivel} "${a.titulo}" tratado com a cliente presente · ${TRATATIVAS[sel.value]}`);
      render();
    });
  },
  gate() {
    const falta = S.cards.alertas.filter(a => !S.cards.tratativas[a.id]);
    return falta.length ? `Registre a tratativa de cada alerta antes de encerrar. Falta${falta.length > 1 ? 'm' : ''}: ${falta.map(a => a.titulo.toLowerCase()).join('; ')}.` : null;
  },
  onNext() {
    audit('I35', `Visão consolidada encerrada · ${S.cards.alertas.length} alerta(s) com tratativa registrada · atendimento concluído`);
  },
};
