/* =========================================================================
   TELAS — Propostas (14.3.2) e limites (8.3 · 17.15 · 19.2.1)
   ======================================================================= */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- S19
   Acompanhamento de propostas. O ponto central é a pendência com dono
   e prazo: proposta parada sem responsável é o que gera retrabalho.    */
SCREENS.s19 = {
  title: 'Propostas em acompanhamento',
  hint: 'S19 · toda proposta parada tem <b>motivo, responsável e prazo</b>. "Em análise" sem dono não é situação aceitável.',
  nextLabel: 'Concluir acompanhamento',
  render() {
    const props = S.cred.proposals;
    const ESTADOS = {
      EM_ANALISE: { label: 'em análise', badge: 'info' },
      PENDENTE: { label: 'pendente de documento', badge: 'alert' },
      APROVADA: { label: 'aprovada', badge: 'success' },
      RECUSADA: { label: 'recusada', badge: 'danger' },
      DESEMBOLSADA: { label: 'desembolsada', badge: 'success' },
    };

    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('list', 14)} I24 · Propostas de crédito</div>
      <h1 class="h1">Propostas da cliente</h1>
      <p class="lede">O que está em andamento, o que travou e de quem é a bola. A cliente tem direito de saber em que etapa está e o que falta.</p>

      <div class="grid grid--3 mb-16">
        <div class="card"><div class="tiny muted">Em andamento</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold)">${props.filter(p => ['EM_ANALISE', 'PENDENTE'].includes(p.status)).length}</div></div>
        <div class="card"><div class="tiny muted">Aprovadas</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:var(--tx-success)">${props.filter(p => p.status === 'APROVADA').length}</div></div>
        <div class="card"><div class="tiny muted">Com pendência</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:var(--c-warning-150)">${props.filter(p => p.pendencia).length}</div></div>
      </div>

      ${props.map(p => {
        const e = ESTADOS[p.status] || ESTADOS.EM_ANALISE;
        const prod = CRED_PRODUCTS.find(x => x.id === p.produto);
        const dias = Math.round((new Date() - parseISO(p.criadaEm)) / 864e5);
        return `
        <div class="card">
          <div class="card__head">
            <span class="card__title">${p.id} · ${prod ? prod.nome : p.produto}
              ${p.origem === 'FNO' ? '<span class="badge badge--brand" style="margin-left:6px">FNO</span>' : ''}</span>
            <span class="badge badge--${e.badge}">${e.label}</span>
          </div>
          <div class="card__body">
            <div class="grid grid--2">
              <div class="rows">
                <div class="row"><span class="row__k">Valor</span><span class="row__v">${money(p.valor)}</span></div>
                <div class="row"><span class="row__k">Prazo</span><span class="row__v">${p.parcelas}x</span></div>
                <div class="row"><span class="row__k">Aberta em</span><span class="row__v">${parseISO(p.criadaEm).toLocaleDateString('pt-BR')} <span class="tiny muted">(${dias} dias)</span></span></div>
                <div class="row"><span class="row__k">Etapa atual</span><span class="row__v">${p.etapa}</span></div>
              </div>
              <div>
                ${p.pendencia ? `
                <div class="note note--alert">
                  <span class="note__ic">${ico('alert', 18)}</span>
                  <div><b>Falta documento.</b> <span class="muted">${p.pendencia}</span>
                    <div class="tiny mt-8"><b>Responsável:</b> agência 0108 · <b>prazo:</b> 5 dias úteis</div></div>
                </div>
                <button class="btn btn--outline mt-8" data-pend="${p.id}">${ico('bell', 16)} Avisar a cliente</button>
                ` : p.status === 'APROVADA' ? `
                <div class="note note--success">
                  <span class="note__ic">${ico('check', 18)}</span>
                  <div><b>Pronta para desembolso.</b> <span class="muted">Falta a autorização da titular no tablet. O valor cai na conta no mesmo dia.</span></div>
                </div>
                <button class="btn btn--cta mt-8" data-desemb="${p.id}">${ico('money', 16)} Levar para autorizar</button>
                ` : `
                <div class="note note--info">
                  <span class="note__ic">${ico('clock', 18)}</span>
                  <div><b>Em análise há ${dias} dias.</b> <span class="muted">Prazo desta linha: até 10 dias úteis. A cliente pode acompanhar pelo protocolo.</span></div>
                </div>`}
                ${dias > 10 && ['EM_ANALISE', 'PENDENTE'].includes(p.status) ? `
                <div class="note note--danger mt-8">
                  <span class="note__ic">${ico('alert', 18)}</span>
                  <div><b>Fora do prazo.</b> <span class="muted">Passou de 10 dias úteis. Escalar para a alçada regional em vez de deixar a cliente esperando.</span></div>
                </div>` : ''}
              </div>
            </div>
          </div>
        </div>`;
      }).join('')}

      <div class="trace">
        <span class="chip chip--iface">I24</span>
        <span class="chip chip--ca">14.3.2</span>
        <span class="chip chip--norm">Res. CMN 4.881/2020 (CET) · Res. CMN 4.539/2016</span>
      </div>
    </div>`;
  },
  bind(root) {
    root.querySelectorAll('[data-pend]').forEach(b => b.onclick = () => {
      const p = S.cred.proposals.find(x => x.id === b.dataset.pend);
      audit('I24', `Cliente notificada sobre pendência da proposta ${p.id}: ${p.pendencia}`);
      b.innerHTML = `${ico('check', 16)} Cliente avisada`;
      b.disabled = true;
    });
    root.querySelectorAll('[data-desemb]').forEach(b => b.onclick = () => {
      const p = S.cred.proposals.find(x => x.id === b.dataset.desemb);
      const prod = CRED_PRODUCTS.find(x => x.id === p.produto);
      /* Reaproveita o fluxo de contratação (S18) para a autorização. */
      S.cred.simulation = {
        produto: p.produto, nome: prod ? prod.nome : p.produto, valor: p.valor,
        parcelas: p.parcelas, taxaMes: prod ? prod.taxaMes : 2,
        parcela: parcelaPrice(p.valor, prod ? prod.taxaMes : 2, p.parcelas),
        iof: p.valor * 0.0038, bloqueios: [], impedida: false,
        comprometimento: (parcelaPrice(p.valor, prod ? prod.taxaMes : 2, p.parcelas) / (S.customer.income || 1518)) * 100,
      };
      S.cred.simulation.total = S.cred.simulation.parcela * p.parcelas;
      S.cred.simulation.cet = (Math.pow(1 + (prod ? prod.taxaMes : 2) / 100, 12) - 1) * 100;
      audit('I24', `Proposta ${p.id} encaminhada para autorização da titular · ${money(p.valor)}`);
      /* Vai para S18, que é modo cliente: o handoff é acionado pela navegação. */
      S.idx = STEPS_SRV.findIndex(z => z.id === 'S18');
      const ns = step();
      if (ns.mode === 'CUSTOMER_MODE' && S.mode !== 'CUSTOMER_MODE') requestHandoff(ns);
      else render();
    });
  },
  onNext() {
    const travadas = S.cred.proposals.filter(p => p.pendencia);
    if (travadas.length) audit('I24', `${travadas.length} proposta(s) seguem pendentes de documento com responsável definido`);
  },
};

/* ---------------------------------------------------------------- S20
   Limites de TED e de crédito, com monitoramento contínuo.
   Regra central: reduzir vale na hora, aumentar espera carência.       */
SCREENS.s20 = {
  title: 'Limites de TED e de crédito',
  hint: 'S20 · <b>reduzir limite vale na hora; aumentar só depois da carência</b>. É trava antifraude: golpista com o tablet não consegue elevar limite e sacar.',
  nextLabel: 'Concluir ajuste',
  render() {
    const li = S.cred.limits;
    const cr = li.credito;
    const uso = (cr.usado / cr.limite) * 100;

    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('lock', 14)} I25 · Limites e monitoramento</div>
      <h1 class="h1">Limites da cliente</h1>
      <p class="lede">Limite de transferência por período do dia e limite de crédito por risco. Toda alteração fica registrada com quem pediu e quando passa a valer.</p>

      <div class="grid grid--2">
        <div>
          <div class="card">
            <div class="card__head"><span class="card__title">Limite de transferência (TED e Pix)</span>
              <span class="badge badge--neutral">por dia</span></div>
            <div class="card__body">
              <div class="rows">
                <div class="row"><span class="row__k">${ico('clock', 16)} Durante o dia (6h às 20h)</span><span class="row__v row__v--lg">${money(li.tedDia)}</span></div>
                <div class="row"><span class="row__k">${ico('lock', 16)} À noite (${li.janelaNoturna})</span><span class="row__v row__v--lg">${money(li.tedNoite)}</span></div>
              </div>
              <div class="note note--info mt-16">
                <span class="note__ic">${ico('shield', 18)}</span>
                <div><b>Por que o limite da noite é menor.</b> <span class="muted">A maior parte dos golpes com transferência acontece de madrugada. O limite noturno reduzido é exigência do Banco Central, não escolha do banco.</span></div>
              </div>

              <div class="field mt-16">
                <label class="field__label" for="lim-novo">Novo limite diurno solicitado</label>
                <input class="field__input" id="lim-novo" inputmode="decimal" placeholder="ex.: 5000" value="${li.tedSolicitado || ''}">
                <span class="field__help">Reduzir passa a valer imediatamente. Aumentar só depois de 48 horas.</span>
              </div>
              <button class="btn btn--cta mt-8" data-act="lim-pedir">${ico('check', 18)} Registrar solicitação</button>

              ${li.tedVigenciaEm ? `
              <div class="note note--${li.tedImediato ? 'success' : 'alert'} mt-16">
                <span class="note__ic">${ico(li.tedImediato ? 'check' : 'clock', 18)}</span>
                <div><b>${li.tedImediato ? 'Redução já aplicada.' : 'Aumento agendado.'}</b>
                  <span class="muted">${li.tedImediato
                    ? `O limite diurno passou a ser ${money(li.tedDia)} agora mesmo.`
                    : `O novo limite de ${money(li.tedSolicitado)} passa a valer em ${li.tedVigenciaEm}. Até lá, permanece ${money(li.tedDia)}.`}</span></div>
              </div>` : ''}
            </div>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card__head"><span class="card__title">Limite de crédito</span>
              <span class="badge badge--${cr.risco === 'A' ? 'success' : cr.risco === 'B' ? 'info' : 'alert'}">risco ${cr.risco}</span></div>
            <div class="card__body">
              <div class="rows">
                <div class="row"><span class="row__k">Limite aprovado</span><span class="row__v row__v--lg">${money(cr.limite)}</span></div>
                <div class="row"><span class="row__k">Em uso</span><span class="row__v">${money(cr.usado)} <span class="tiny muted">(${uso.toFixed(0)}%)</span></span></div>
                <div class="row"><span class="row__k">Disponível</span><span class="row__v">${money(cr.limite - cr.usado)}</span></div>
                <div class="row"><span class="row__k">Última revisão</span><span class="row__v">${parseISO(cr.revisadoEm).toLocaleDateString('pt-BR')}</span></div>
              </div>
              <div class="note note--info mt-16">
                <span class="note__ic">${ico('info', 18)}</span>
                <div><b>O limite não é definido na agência.</b> <span class="muted">Vem do modelo de risco, com critérios do Banco Central. A atendente pode pedir revisão e explicar o motivo, mas nunca alterar direto.</span></div>
              </div>
              <button class="btn btn--outline mt-16" data-act="rev-credito">${ico('refresh', 18)} Pedir revisão de limite</button>
              ${li.revisaoPedida ? `
              <div class="note note--success mt-16">
                <span class="note__ic">${ico('check', 18)}</span>
                <div><b>Revisão solicitada.</b> <span class="muted">Protocolo ${li.revisaoPedida}. Resposta em até 5 dias úteis, informada à cliente pelo canal que ela escolheu.</span></div>
              </div>` : ''}
            </div>
          </div>

          <div class="card card--flush">
            <div class="card__head"><span class="card__title">Monitoramento contínuo</span>
              <span class="badge badge--neutral">${li.monitor.length} eventos</span></div>
            <div class="card__body" style="padding:0">
              <table class="table">
                <thead><tr><th>Quando</th><th>Evento</th><th>Efeito no limite</th></tr></thead>
                <tbody>
                  ${li.monitor.map(m => `
                  <tr><td>${parseISO(m.em).toLocaleDateString('pt-BR')}</td>
                      <td>${m.evento}</td>
                      <td>${m.efeito}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="trace">
        <span class="chip chip--iface">I25</span>
        <span class="chip chip--ca">8.3 · 17.15 · 19.2.1</span>
        <span class="chip chip--norm">Res. BCB 142/2021 · Res. CMN 4.557/2017</span>
      </div>
    </div>`;
  },
  bind(root) {
    const li = S.cred.limits;

    const pedir = root.querySelector('[data-act="lim-pedir"]');
    if (pedir) pedir.onclick = comTitular('Alteração do limite de TED', () => {
      const novo = Number(String(root.querySelector('#lim-novo').value).replace(/\./g, '').replace(',', '.')) || 0;
      if (novo <= 0) { audit('I25', 'Solicitação de limite sem valor válido'); return; }
      li.tedSolicitado = novo;
      if (novo < li.tedDia) {
        /* Redução é proteção: vale na hora. */
        const antes = li.tedDia;
        li.tedDia = novo;
        li.tedImediato = true;
        li.tedVigenciaEm = 'agora';
        audit('I25', `Limite diurno de TED reduzido de ${money(antes)} para ${money(novo)} · vigência imediata a pedido da titular`);
      } else {
        /* Aumento espera 48h: janela antifraude. */
        const d = new Date(Date.now() + 48 * 3600e3);
        li.tedImediato = false;
        li.tedVigenciaEm = d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        audit('I25', `Aumento de limite para ${money(novo)} agendado para ${li.tedVigenciaEm} · carência antifraude de 48h`);
      }
      render();
    });

    const rev = root.querySelector('[data-act="rev-credito"]');
    if (rev) rev.onclick = comTitular('Revisão do limite de crédito', () => {
      li.revisaoPedida = uid('REV');
      audit('I25', `Revisão de limite de crédito solicitada · protocolo ${li.revisaoPedida} · decisão pelo modelo de risco, não pela agência`);
      render();
    });
  },
  onNext() {
    const li = S.cred.limits;
    if (li.tedVigenciaEm && !li.tedImediato) audit('I25', `Aumento de limite permanece em carência até ${li.tedVigenciaEm}`);
  },
};
