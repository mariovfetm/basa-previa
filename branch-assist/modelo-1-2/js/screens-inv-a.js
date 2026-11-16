/* =========================================================================
   TELAS — Investimentos (Deposits)
   -------------------------------------------------------------------------
   Cobre os 13 requisitos de Deposits do escopo funcional:

   2.1.1  CDB/RDB nas modalidades pré, pós e híbrida ............ S14
   2.1.8  Monitorar vencimentos com notificação ................. S16
   2.1.9  Resgate antecipado com penalidade calculada ........... S16
   2.1.10 Renovação automática ou reinvestimento ................ S16
   2.1.15 Tarifas e encargos com transparência no extrato ....... S14 · S16
   14.5.1 Simulação e aplicação em fundos, CDB e LCA ............ S14 · S15
   14.5.2 Resgatar, cancelar e ordem de resgate automático ...... S16
   14.5.3 Extrato de investimentos e saldo consolidado .......... S16
   14.5.4 Perfil de investidor (questionário e consulta) ........ S13
   15.31.1 Consulta de saldo e extrato de aplicações ............ S16
   15.31.2 Aplicação em CDB, LCA, fundos e poupança ............. S14 · S15
   15.31.3 Resgate para conta corrente ou poupança .............. S16
   17.9   Suitability: adequação do produto ao perfil ........... S13 · S15
   ======================================================================= */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- S13
   Suitability — a titular responde. É decisão dela, então vai para o
   modo cliente, com leitura em voz alta e alvos de 64px.              */
SCREENS.s13 = {
  title: 'Perfil de investidor (suitability)',
  hint: 'S13 · modo cliente. O perfil é declarado <b>pela titular</b>, nunca preenchido pelo atendente. Recusar é caminho legítimo e fica registrado.',
  nextLabel: 'Concluir perfil',
  render() {
    const su = S.inv.suitability;

    if (su.refused) {
      return `
      <div class="cust" style="text-align:left;max-width:760px">
        <div class="cust__task">${ico('info', 16)} Registrado</div>
        <h1 class="cust__title">Você preferiu não responder</h1>
        <p class="cust__sub" style="text-align:left">Sem problema. Isso não afeta sua conta nem os serviços do dia a dia. Só não vamos oferecer aplicações hoje, porque o banco precisa conhecer seu perfil antes de indicar qualquer investimento.</p>
        <div class="note note--info">
          <span class="note__ic">${ico('shield', 18)}</span>
          <div><b>Você pode responder quando quiser.</b> <span class="muted">Basta pedir na agência ou pelo aplicativo. A poupança continua disponível normalmente.</span></div>
        </div>
        <button class="btn btn--outline mt-16" data-act="retomar">${ico('refresh', 18)} Quero responder agora</button>
      </div>`;
    }

    if (su.profile) {
      const p = SUIT_PROFILES[su.profile];
      return `
      <div class="cust" style="text-align:left;max-width:760px">
        <div class="cust__task">${ico('check', 16)} Tarefa concluída</div>
        <h1 class="cust__title">Seu perfil: ${p.label}</h1>
        <p class="cust__sub" style="text-align:left">“${p.plain}”</p>

        <div class="card">
          <div class="card__head">
            <span class="card__title">O que isso significa</span>
            <span class="badge badge--success">válido por 24 meses</span>
          </div>
          <div class="card__body">
            <div class="rows">
              <div class="row"><span class="row__k">Perfil declarado</span><span class="row__v">${p.label}</span></div>
              <div class="row"><span class="row__k">Vale até</span><span class="row__v">${su.expiresAt}</span></div>
              <div class="row"><span class="row__k">Produtos que combinam</span><span class="row__v">${p.aceita.map(a => SUIT_PROFILES[a].label).join(', ')}</span></div>
            </div>
            <div class="note note--info mt-16">
              <span class="note__ic">${ico('info', 18)}</span>
              <div><b>Você continua no comando.</b> <span class="muted">Se quiser aplicar em algo fora do seu perfil, é possível. O banco vai avisar por escrito que aquilo não combina com o que você respondeu, e você decide.</span></div>
            </div>
          </div>
        </div>

        <div class="inline">
          <button class="audiobtn" data-audio="perfil">${ico('speaker', 18)} Ouvir o resultado</button>
          <button class="btn btn--link" data-act="refazer">Responder de novo</button>
        </div>
        <div class="trace" style="justify-content:flex-start">
          <span class="chip chip--iface">I20</span>
          <span class="chip chip--ca">14.5.4 · 17.9</span>
          <span class="chip chip--norm">Res. CVM 30/2021 · art. 2º</span>
        </div>
      </div>`;
    }

    const respondidas = Object.keys(su.answers).length;
    const q = SUIT_QUESTIONS[respondidas];

    return `
    <div class="cust" style="text-align:left;max-width:760px">
      <div class="cust__task">${ico('user', 16)} Só para você</div>
      <h1 class="cust__title">Quatro perguntas sobre o seu dinheiro</h1>
      <p class="cust__sub" style="text-align:left">Não existe resposta certa ou errada. Serve para o banco não oferecer algo que não combina com você. Se não quiser responder, pode dizer que não quer.</p>

      <div class="inline mb-16" style="justify-content:flex-start">
        <button class="audiobtn" data-audio="suit">${ico('speaker', 18)} Ouvir a pergunta</button>
        <span class="badge badge--neutral">pergunta ${respondidas + 1} de ${SUIT_QUESTIONS.length}</span>
      </div>

      <div class="card">
        <div class="card__body">
          <div class="h3">${q.ask}</div>
          <div class="choices mt-16">
            ${q.opts.map(([texto, pts]) => `
              <button class="choice" data-q="${q.id}" data-pts="${pts}">
                <span class="choice__ic">${ico('check', 20)}</span>
                <span><span class="choice__t">${texto}</span></span>
              </button>`).join('')}
          </div>
        </div>
      </div>

      <button class="btn btn--link mt-16" data-act="recusar">Não quero responder agora</button>

      <div class="trace" style="justify-content:flex-start">
        <span class="chip chip--iface">I20</span>
        <span class="chip chip--ca">14.5.4 · 17.9</span>
        <span class="chip chip--norm">Res. CVM 30/2021</span>
      </div>
    </div>`;
  },
  bind(root) {
    const su = S.inv.suitability;

    const respondidas = Object.keys(su.answers).length;
    const q = SUIT_QUESTIONS[respondidas];
    if (q) {
      ligarAudio(root.querySelector('[data-audio="suit"]'),
        `${q.ask} As opções são: ${q.opts.map(([t], i) => `Opção ${i + 1}: ${t}.`).join(' ')} Toque na que combina mais com você.`,
        'I20', `Pergunta ${q.id} do perfil de investidor lida em voz alta`);
    }
    if (su.profile) {
      const p = SUIT_PROFILES[su.profile];
      ligarAudio(root.querySelector('[data-audio="perfil"]'),
        `Seu perfil é ${p.label}. ${p.plain} Isto vale por vinte e quatro meses. Se quiser aplicar em algo diferente do seu perfil, o banco avisa por escrito e você decide.`,
        'I20', 'Resultado do perfil de investidor lido em voz alta');
    }

    root.querySelectorAll('[data-q]').forEach(b => b.onclick = () => {
      su.answers[b.dataset.q] = Number(b.dataset.pts);
      audit('I20', `Resposta registrada em ${b.dataset.q} do questionário de suitability`);
      /* Fechou as quatro: calcula o perfil pela soma. */
      if (Object.keys(su.answers).length === SUIT_QUESTIONS.length) {
        const total = Object.values(su.answers).reduce((a, b2) => a + b2, 0);
        su.profile = Object.keys(SUIT_PROFILES).find(k => {
          const [lo, hi] = SUIT_PROFILES[k].faixa;
          return total >= lo && total <= hi;
        }) || 'CONSERVADOR';
        const d = new Date(); d.setMonth(d.getMonth() + 24);
        su.completedAt = new Date().toLocaleDateString('pt-BR');
        su.expiresAt = d.toLocaleDateString('pt-BR');
        audit('I20', `Perfil de investidor definido: ${SUIT_PROFILES[su.profile].label} · ${total} pontos · validade até ${su.expiresAt}`);
      }
      render();
    });

    const rec = root.querySelector('[data-act="recusar"]');
    if (rec) rec.onclick = () => {
      su.refused = true; su.answers = {}; su.profile = null;
      audit('I20', 'Titular recusou responder o suitability: recusa registrada, oferta de investimento bloqueada');
      render();
    };
    const ret = root.querySelector('[data-act="retomar"]');
    if (ret) ret.onclick = () => { su.refused = false; audit('I20', 'Titular optou por responder o suitability'); render(); };
    const rf = root.querySelector('[data-act="refazer"]');
    if (rf) rf.onclick = () => {
      su.answers = {}; su.profile = null; su.completedAt = null;
      audit('I20', 'Questionário de perfil reiniciado a pedido da titular');
      render();
    };
  },
  onNext() {
    const su = S.inv.suitability;
    if (!su.profile && !su.refused) audit('I20', 'Perfil de investidor não concluído: oferta de investimento permanece bloqueada');
  },
};

/* ---------------------------------------------------------------- S14
   Simulação — trabalho de balcão, modo atendente. Mostra bruto, IR,
   IOF e taxa de administração antes de qualquer decisão.               */
SCREENS.s14 = {
  title: 'Simulação de CDB, RDB e fundos',
  hint: 'S14 · a simulação mostra <b>o valor líquido</b>, com IR, IOF e taxa de administração descontados. Produto fora do perfil continua visível, com alerta.',
  nextLabel: 'Levar ao cliente',
  render() {
    const su = S.inv.suitability;
    const sim = S.inv.simulation;
    const perfil = su.profile ? SUIT_PROFILES[su.profile] : null;

    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('money', 14)} I21 · Simulação e aplicação</div>
      <h1 class="h1">Simular investimento</h1>
      <p class="lede">A simulação é feita aqui, com a atendente. A autorização é sempre da titular, no tablet, na etapa seguinte.</p>

      ${!su.profile ? `
      <div class="note note--alert">
        <span class="note__ic">${ico('alert', 18)}</span>
        <div><b>Sem perfil de investidor, não há oferta.</b> <span class="muted">${su.refused
          ? 'A titular recusou o questionário. É possível simular para explicar, mas a aplicação fica bloqueada até haver perfil.'
          : 'Conclua o questionário de suitability (S13) antes de aplicar. Simular para explicar é permitido.'}</span></div>
      </div>` : `
      <div class="note note--success">
        <span class="note__ic">${ico('check', 18)}</span>
        <div><b>Perfil ${perfil.label}.</b> <span class="muted">Válido até ${su.expiresAt}. Produtos compatíveis: ${perfil.aceita.map(a => SUIT_PROFILES[a].label).join(', ')}.</span></div>
      </div>`}

      <div class="grid grid--2">
        <div>
          <div class="card card--flush">
            <div class="card__head"><span class="card__title">Produtos disponíveis</span>
              <span class="badge badge--neutral">${INV_PRODUCTS.length} produtos</span></div>
            <div class="card__body" style="padding:0">
              ${INV_PRODUCTS.map(p => {
                const fora = perfil && !perfil.aceita.includes(p.risco);
                const sel = sim && sim.produto === p.id;
                return `
                <button class="pinmethod" data-prod="${p.id}" data-active="${sel}" style="border-radius:0;border-left:none;border-right:none">
                  <span class="pinmethod__n">${p.modalidade === 'FUNDO' ? ico('chart', 14) : ico('money', 14)}</span>
                  <span style="flex:1">
                    <span class="toggle__name">${p.nome}
                      ${fora ? '<span class="badge badge--alert" style="margin-left:6px">fora do perfil</span>' : ''}
                      ${p.isento ? '<span class="badge badge--success" style="margin-left:6px">isento de IR</span>' : ''}
                    </span>
                    <span class="toggle__desc">${p.taxa}${p.unidade} · ${p.liquidez}${p.taxaAdm ? ` · taxa adm. ${p.taxaAdm}% a.a.` : ''}</span>
                    <span class="toggle__desc" style="font-style:italic">“${p.plain}”</span>
                  </span>
                </button>`;
              }).join('')}
            </div>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card__title mb-16">Parâmetros da simulação</div>
            <div class="grid">
              <div class="field">
                <label class="field__label" for="sim-valor">Valor a aplicar</label>
                <input class="field__input" id="sim-valor" inputmode="decimal" value="${sim ? sim.valor : ''}" placeholder="ex.: 2000">
              </div>
              <div class="field">
                <label class="field__label" for="sim-prazo">Prazo em dias</label>
                <select class="field__select" id="sim-prazo">
                  ${[30, 90, 180, 360, 720, 1080].map(d =>
                    `<option value="${d}" ${sim && sim.prazo === d ? 'selected' : ''}>${d} dias${d === 30 ? ' (mínimo)' : ''}</option>`).join('')}
                </select>
              </div>
              <button class="btn btn--cta" data-act="simular">${ico('chart', 18)} Calcular</button>
            </div>
          </div>

          ${sim ? `
          <div class="card">
            <div class="card__head">
              <span class="card__title">Resultado</span>
              <span class="badge badge--${sim.foraPerfil ? 'alert' : 'success'}">${sim.foraPerfil ? 'fora do perfil' : 'compatível'}</span>
            </div>
            <div class="card__body">
              <div class="rows">
                <div class="row"><span class="row__k">Produto</span><span class="row__v">${sim.nome}</span></div>
                <div class="row"><span class="row__k">Aplicado</span><span class="row__v">${money(sim.valor)}</span></div>
                <div class="row"><span class="row__k">Prazo</span><span class="row__v">${sim.prazo} dias</span></div>
                <div class="row"><span class="row__k">Rendimento bruto</span><span class="row__v">${money(sim.rendimento)}</span></div>
                <div class="row"><span class="row__k">Imposto de renda (${(sim.aliqIr * 100).toFixed(1)}%)</span><span class="row__v">${sim.ir ? '− ' + money(sim.ir) : 'isento'}</span></div>
                ${sim.iof ? `<div class="row"><span class="row__k">IOF (resgate antes de 30 dias)</span><span class="row__v">− ${money(sim.iof)}</span></div>` : ''}
                ${sim.adm ? `<div class="row"><span class="row__k">Taxa de administração</span><span class="row__v">− ${money(sim.adm)}</span></div>` : ''}
                <div class="row"><span class="row__k"><b>Você recebe no fim</b></span><span class="row__v row__v--lg">${money(sim.liquido)}</span></div>
              </div>
              ${sim.foraPerfil ? `
              <div class="note note--alert mt-16">
                <span class="note__ic">${ico('alert', 18)}</span>
                <div><b>Este produto não combina com o perfil declarado.</b> <span class="muted">A titular pode aplicar, mas o alerta é lido em voz alta para ela e registrado por escrito. Nunca se omite.</span></div>
              </div>` : ''}
              ${!sim.fgc ? `
              <div class="note note--info mt-16">
                <span class="note__ic">${ico('info', 18)}</span>
                <div><b>Sem garantia do FGC.</b> <span class="muted">Fundos não têm a proteção de até R$ 250 mil por CPF que o CDB e a LCA têm.</span></div>
              </div>` : ''}
            </div>
          </div>` : ''}
        </div>
      </div>

      <div class="trace">
        <span class="chip chip--iface">I21</span>
        <span class="chip chip--ca">2.1.1 · 2.1.15 · 14.5.1 · 15.31.2</span>
        <span class="chip chip--norm">Res. CVM 30/2021 · IN RFB 1.585/2015</span>
      </div>
    </div>`;
  },
  bind(root) {
    let prodSel = S.inv.simulation ? S.inv.simulation.produto : null;

    root.querySelectorAll('[data-prod]').forEach(b => b.onclick = () => {
      prodSel = b.dataset.prod;
      root.querySelectorAll('[data-prod]').forEach(x => x.dataset.active = String(x.dataset.prod === prodSel));
      audit('I21', `Produto ${INV_PRODUCTS.find(p => p.id === prodSel).nome} selecionado para simulação`);
    });

    const sim = root.querySelector('[data-act="simular"]');
    if (sim) sim.onclick = () => {
      const p = INV_PRODUCTS.find(x => x.id === prodSel);
      if (!p) { audit('I21', 'Simulação solicitada sem produto selecionado'); return; }
      const valorRaw = root.querySelector('#sim-valor').value;
      const valor = Number(String(valorRaw).replace(/\./g, '').replace(',', '.')) || 0;
      const prazo = Number(root.querySelector('#sim-prazo').value);
      if (valor <= 0) { audit('I21', 'Simulação solicitada sem valor válido'); return; }

      /* Rendimento aproximado: o objetivo é mostrar a mecânica de IR, IOF e
         taxa de administração, não precisão de mesa. */
      const taxaAno = p.modalidade === 'POS' ? 0.1065 * (p.taxa / 100)
                    : p.unidade.includes('IPCA') ? (p.taxa + 4.2) / 100
                    : p.taxa / 100;
      const bruto = valor * Math.pow(1 + taxaAno, prazo / 365);
      const rendimento = bruto - valor;
      const aliqIr = p.isento ? 0 : irRendaFixa(prazo);
      const ir = rendimento * aliqIr;
      const iof = rendimento * iofDias(prazo) * 0.3;
      const adm = p.taxaAdm ? valor * (p.taxaAdm / 100) * (prazo / 365) : 0;
      const perfil = S.inv.suitability.profile;

      S.inv.simulation = {
        produto: p.id, nome: p.nome, modalidade: p.modalidade, valor, prazo,
        rendimento, aliqIr, ir, iof, adm, fgc: p.fgc,
        liquido: bruto - ir - iof - adm,
        foraPerfil: !!perfil && !SUIT_PROFILES[perfil].aceita.includes(p.risco),
      };
      audit('I21', `Simulação de ${p.nome} · ${money(valor)} por ${prazo} dias · líquido ${money(S.inv.simulation.liquido)}`);
      render();
    };
  },
  onNext() {
    if (!S.inv.simulation) audit('I21', 'Etapa de simulação concluída sem simulação registrada');
  },
};
