/* =========================================================================
   TELAS — Cartões e visão consolidada
   -------------------------------------------------------------------------
   14.4.2   Ativação, bloqueio, desbloqueio e reemissão ............. S29
   14.4.3   Liberação e habilitação de funções ..................... S29
   15.1.1   Solicitação de cartão de CC e poupança ................. S29
   15.1.2   Liberação de cartão .................................... S29
   15.1.3   Exclusão de cartão ..................................... S29
   15.27.1  Liberação de novo cartão para uso ...................... S29
   15.27.3  Bloqueio e desbloqueio (temporário ou definitivo) ...... S29
   15.27.4  Ativação de função crédito ou débito ................... S29
   15.27.5  Consulta de limite do cartão ........................... S29
   28.7.2.1 Bloqueio por perda, roubo ou fraude .................... S29
   14.4.6   Solicitação e rastreamento de envio .................... S30
   15.27.2  Solicitação de 2ª via .................................. S30
   15.27.6  Alteração de senha do cartão ........................... S30
   15.27.7  Cadastramento de senha para primeiro acesso ............ S30
   ======================================================================= */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- S29
   Gestão dos cartões. O bloqueio por perda ou roubo é o caminho mais
   urgente da tela: em suspeita de fraude, primeiro se bloqueia.        */
SCREENS.s29 = {
  title: 'Cartões: funções, limite e bloqueio',
  hint: 'S29 · em <b>perda, roubo ou fraude, bloqueia-se primeiro</b> e apura depois. Bloqueio definitivo é irreversível e já dispara a 2ª via.',
  nextLabel: 'Levar ao cliente',
  render() {
    const cs = S.cards.lista;
    const sel = cs.find(c => c.id === S.cards.cardSel) || cs[0];
    const SIT = {
      ATIVO: ['success', 'ativo'],
      BLOQUEADO_TEMP: ['alert', 'bloqueado temporariamente'],
      BLOQUEADO_DEF: ['danger', 'bloqueado definitivamente'],
      AGUARDANDO_ENTREGA: ['info', 'aguardando entrega'],
      CANCELADO: ['neutral', 'cancelado'],
    };

    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('card', 14)} I34 · Cartões</div>
      <h1 class="h1">Cartões da cliente</h1>
      <p class="lede">Situação, funções habilitadas e limite. Bloquear por perda ou roubo não depende de apuração: bloqueia-se na hora.</p>

      <div class="card card--flush">
        <div class="card__head"><span class="card__title">Cartões vinculados</span>
          <span class="badge badge--neutral">${cs.length} cartões</span></div>
        <div class="card__body" style="padding:0">
          <table class="table">
            <thead><tr><th>Cartão</th><th>Conta</th><th>Situação</th><th>Funções</th><th>Limite</th><th></th></tr></thead>
            <tbody>
              ${cs.map(c => {
                const s = SIT[c.situacao] || ['neutral', c.situacao];
                const fn = Object.entries(c.funcoes).filter(([, v]) => v)
                  .map(([k]) => ({ debito: 'débito', credito: 'crédito', exterior: 'exterior' })[k]);
                return `
                <tr${c.id === sel.id ? ' style="background:var(--c-verde-light)"' : ''}>
                  <td><b>${c.nome}</b><div class="tiny muted">${c.bandeira} ···· ${c.final}</div></td>
                  <td><code>${c.vinculo}</code></td>
                  <td><span class="badge badge--${s[0]}">${s[1]}</span></td>
                  <td>${fn.length ? fn.join(', ') : '<span class="tiny muted">nenhuma</span>'}</td>
                  <td>${c.limite ? money(c.limite) : '—'}</td>
                  <td><button class="btn btn--outline" data-card="${c.id}">${ico('search', 14)} Abrir</button></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid grid--2">
        <div>
          <div class="card">
            <div class="card__head"><span class="card__title">${sel.nome} ···· ${sel.final}</span>
              <span class="badge badge--${(SIT[sel.situacao] || ['neutral'])[0]}">${(SIT[sel.situacao] || ['', sel.situacao])[1]}</span></div>
            <div class="card__body">
              <div class="rows">
                <div class="row"><span class="row__k">Emitido em</span><span class="row__v">${parseISO(sel.emitidoEm).toLocaleDateString('pt-BR')}</span></div>
                <div class="row"><span class="row__k">Anuidade</span><span class="row__v">${sel.anuidade ? money(sel.anuidade) : 'isento'}</span></div>
                ${sel.limite ? `
                <div class="row"><span class="row__k">Limite</span><span class="row__v row__v--lg">${money(sel.limite)}</span></div>
                <div class="row"><span class="row__k">Utilizado</span><span class="row__v">${money(sel.usado || 0)}</span></div>
                <div class="row"><span class="row__k">Disponível</span><span class="row__v">${money(sel.limite - (sel.usado || 0))}</span></div>` : ''}
                <div class="row"><span class="row__k">Pagar por aproximação</span><span class="row__v">${sel.aproximacao ? 'habilitado' : 'desabilitado'}</span></div>
                <div class="row"><span class="row__k">Senha cadastrada</span><span class="row__v">${sel.senhaDefinida ? 'sim' : 'ainda não'}</span></div>
              </div>

              ${sel.motivoBloqueio ? `
              <div class="note note--alert mt-16">
                <span class="note__ic">${ico('alert', 18)}</span>
                <div><b>Cartão bloqueado.</b> <span class="muted">${sel.motivoBloqueio}</span></div>
              </div>` : ''}
            </div>
          </div>

          <div class="card">
            <div class="card__title mb-16">Funções do cartão</div>
            ${[['debito', 'Função débito', 'Compras e saques direto da conta.'],
               ['credito', 'Função crédito', 'Compras com fatura mensal.'],
               ['exterior', 'Uso no exterior', 'Compras fora do país e em sites estrangeiros. Manter desabilitado reduz risco de fraude.']]
              .map(([k, nome, desc]) => `
              <div class="toggle">
                <div class="toggle__txt">
                  <div class="toggle__name">${nome}</div>
                  <div class="toggle__desc">${desc}</div>
                </div>
                <button class="switch" role="switch" aria-checked="${!!sel.funcoes[k]}" data-fn="${k}"
                  ${sel.situacao === 'BLOQUEADO_DEF' || sel.situacao === 'CANCELADO' ? 'disabled' : ''}></button>
              </div>`).join('')}
            ${sel.situacao === 'BLOQUEADO_DEF' ? `
            <div class="note note--info mt-16">
              <span class="note__ic">${ico('info', 18)}</span>
              <div><b>Cartão bloqueado definitivamente não tem função alterada.</b> <span class="muted">O caminho é a 2ª via.</span></div>
            </div>` : ''}
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card__title mb-16">Perda, roubo ou fraude</div>
            <div class="note note--danger">
              <span class="note__ic">${ico('shield', 18)}</span>
              <div><b>Na dúvida, bloqueie.</b> <span class="muted">Bloqueio temporário é reversível e não custa nada. Deixar um cartão possivelmente clonado ativo custa muito mais do que bloquear por engano.</span></div>
            </div>
            <div class="inline mt-16" style="flex-wrap:wrap">
              ${sel.situacao === 'ATIVO' ? `
                <button class="btn btn--outline" data-blq="TEMP">${ico('lock', 16)} Bloquear temporário</button>
                <button class="btn btn--danger" data-blq="DEF">${ico('xCircle', 16)} Bloquear definitivo</button>
              ` : sel.situacao === 'BLOQUEADO_TEMP' ? `
                <button class="btn btn--cta" data-blq="DESBLOQUEAR">${ico('key', 16)} Desbloquear</button>
                <button class="btn btn--danger" data-blq="DEF">${ico('xCircle', 16)} Bloquear definitivo</button>
              ` : sel.situacao === 'AGUARDANDO_ENTREGA' ? `
                <button class="btn btn--cta" data-blq="LIBERAR">${ico('check', 16)} Liberar para uso</button>
              ` : `<span class="tiny muted">Cartão bloqueado definitivamente ou cancelado: sem ações de bloqueio.</span>`}
            </div>
            ${sel.situacao === 'BLOQUEADO_DEF' ? `
            <div class="note note--alert mt-16">
              <span class="note__ic">${ico('alert', 18)}</span>
              <div><b>2ª via já solicitada automaticamente.</b> <span class="muted">Bloqueio definitivo deixa a cliente sem meio de pagamento. Pedir a reposição no mesmo atendimento evita que ela volte à agência.</span></div>
            </div>` : ''}
          </div>

          <div class="card">
            <div class="card__title mb-16">Outras ações</div>
            <div class="inline" style="flex-wrap:wrap">
              <button class="btn btn--outline" data-act="novo-cartao">${ico('plus', 16)} Solicitar cartão</button>
              <button class="btn btn--ghost" data-act="aprox">${ico('refresh', 16)} ${sel.aproximacao ? 'Desabilitar' : 'Habilitar'} aproximação</button>
              <button class="btn btn--ghost" data-act="excluir-cartao"
                ${sel.situacao === 'AGUARDANDO_ENTREGA' ? 'disabled' : ''}>${ico('x', 16)} Excluir cartão</button>
            </div>
            <div class="tiny muted mt-8">Excluir é definitivo e some com o vínculo. Cartão em trânsito não pode ser excluído antes da entrega.</div>
            ${S.cards.novoPedido ? `
            <div class="note note--success mt-16">
              <span class="note__ic">${ico('check', 18)}</span>
              <div><b>Cartão solicitado.</b> <span class="muted">Protocolo ${S.cards.novoPedido}. O rastreamento aparece em S30.</span></div>
            </div>` : ''}
          </div>
        </div>
      </div>

      <div class="trace">
        <span class="chip chip--iface">I34</span>
        <span class="chip chip--ca">14.4.2 · 14.4.3 · 15.1.1 · 15.1.2 · 15.1.3 · 15.27.1 · 15.27.3 · 15.27.4 · 15.27.5 · 28.7.2.1</span>
        <span class="chip chip--norm">Res. CMN 4.549/2017 (cartão de crédito) · Lei 8.078/1990 (CDC)</span>
      </div>
    </div>`;
  },
  bind(root) {
    const cs = S.cards.lista;
    const sel = cs.find(c => c.id === S.cards.cardSel) || cs[0];

    root.querySelectorAll('[data-card]').forEach(b => b.onclick = () => {
      S.cards.cardSel = b.dataset.card;
      const c = cs.find(x => x.id === S.cards.cardSel);
      audit('I34', `Cartão ${c.nome} ···· ${c.final} aberto para consulta · limite ${c.limite ? money(c.limite) : 'não aplicável'}`);
      render();
    });

    root.querySelectorAll('[data-fn]').forEach(b => b.onclick = comTitular('Alteração das funções do cartão', () => {
      const k = b.dataset.fn;
      sel.funcoes[k] = !sel.funcoes[k];
      const NOME = { debito: 'débito', credito: 'crédito', exterior: 'uso no exterior' };
      audit('I34', `Função ${NOME[k]} ${sel.funcoes[k] ? 'habilitada' : 'desabilitada'} no cartão ···· ${sel.final} a pedido da titular`
                 + (k === 'exterior' && sel.funcoes[k] ? ' · risco de fraude internacional explicado' : ''));
      render();
    }));

    root.querySelectorAll('[data-blq]').forEach(b => b.onclick = comTitular('Bloqueio ou desbloqueio do cartão', () => {
      const acao = b.dataset.blq;
      if (acao === 'TEMP') {
        sel.situacao = 'BLOQUEADO_TEMP';
        sel.motivoBloqueio = 'Bloqueio temporário a pedido da titular';
        audit('I34', `Cartão ···· ${sel.final} bloqueado temporariamente · reversível · vigência imediata`);
      } else if (acao === 'DEF') {
        sel.situacao = 'BLOQUEADO_DEF';
        sel.motivoBloqueio = 'Bloqueio definitivo por perda, roubo ou suspeita de fraude';
        sel.funcoes = { debito: false, credito: false, exterior: false };
        /* Bloqueio definitivo deixa a cliente sem cartão: a 2ª via é
           pedida no mesmo atendimento, não numa nova ida à agência. */
        S.cards.segundaVia = { origem: sel.id, protocolo: uid('2VIA'), pedidoEm: hojeISO() };
        audit('I34', `Cartão ···· ${sel.final} bloqueado DEFINITIVAMENTE · irreversível · 2ª via ${S.cards.segundaVia.protocolo} solicitada automaticamente`);
      } else if (acao === 'DESBLOQUEAR') {
        sel.situacao = 'ATIVO';
        sel.motivoBloqueio = null;
        audit('I34', `Cartão ···· ${sel.final} desbloqueado a pedido da titular · voltou a funcionar`);
      } else if (acao === 'LIBERAR') {
        sel.situacao = 'ATIVO';
        sel.entrega = null;
        audit('I34', `Cartão ···· ${sel.final} liberado para uso na agência · entrega confirmada`);
      }
      render();
    }));

    const novo = root.querySelector('[data-act="novo-cartao"]');
    if (novo) novo.onclick = () => {
      S.cards.novoPedido = uid('CTZ');
      S.cards.lista.push({
        id: S.cards.novoPedido, nome: 'Cartão de débito adicional', bandeira: 'ELO',
        final: String(1000 + Math.floor(Math.random() * 8999)),
        vinculo: S.cc.contaSel, situacao: 'AGUARDANDO_ENTREGA',
        funcoes: { debito: true, credito: false, exterior: false },
        limite: 0, anuidade: 0, senhaDefinida: false, aproximacao: false,
        emitidoEm: hojeISO(),
        entrega: { transportadora: 'Correios', objeto: 'BR' + Math.floor(1e8 + Math.random() * 9e8) + 'PA',
                   etapa: 'Cartão solicitado na agência', previsao: emDias(10),
                   historico: [{ em: hojeISO(), ev: 'Cartão solicitado na agência' }] },
      });
      audit('I34', `Novo cartão solicitado · protocolo ${S.cards.novoPedido} · vínculo ${S.cc.contaSel} · entrega em até 10 dias`);
      render();
    };

    const apr = root.querySelector('[data-act="aprox"]');
    if (apr) apr.onclick = () => {
      sel.aproximacao = !sel.aproximacao;
      audit('I34', `Pagamento por aproximação ${sel.aproximacao ? 'habilitado' : 'desabilitado'} no cartão ···· ${sel.final}`);
      render();
    };

    const exc = root.querySelector('[data-act="excluir-cartao"]');
    if (exc) exc.onclick = () => {
      sel.situacao = 'CANCELADO';
      sel.funcoes = { debito: false, credito: false, exterior: false };
      audit('I34', `Cartão ···· ${sel.final} excluído · vínculo encerrado · ação irreversível`);
      render();
    };
  },
  onNext() {
    const bl = S.cards.lista.filter(c => c.situacao === 'BLOQUEADO_DEF');
    if (bl.length) audit('I34', `${bl.length} cartão bloqueado definitivamente, com reposição encaminhada`);
  },
};
