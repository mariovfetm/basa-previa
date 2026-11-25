/* =========================================================================
   TELAS — Investimentos (parte 2): autorização e posição
   S15 · aplicação autorizada pela titular (modo cliente)
   S16 · posição consolidada, resgate, vencimento e renovação
   ======================================================================= */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- S15
   Aplicar é decisão da titular: vai para o modo cliente, com valor,
   prazo e alerta de perfil lidos em voz alta antes de autorizar.       */
SCREENS.s15 = {
  title: 'Aplicação e autorização da titular',
  hint: 'S15 · modo cliente. Aplicar exige <b>autorização da titular no tablet</b>, com o valor e o prazo lidos em voz alta. Sem simulação, a tela não oferece o botão.',
  nextLabel: 'Confirmar aplicação',
  render() {
    const sim = S.inv.simulation;
    const su = S.inv.suitability;

    if (!sim) {
      return `
      <div class="cust" style="text-align:left;max-width:760px">
        <div class="cust__task">${ico('info', 16)} Nada a autorizar</div>
        <h1 class="cust__title">Não há aplicação pendente</h1>
        <p class="cust__sub" style="text-align:left">A atendente ainda não montou uma simulação para você. Peça para ela mostrar as opções antes de decidir.</p>
      </div>`;
    }

    if (sim.applied) {
      return `
      <div class="cust" style="text-align:left;max-width:760px">
        <div class="cust__task">${ico('check', 16)} Tarefa concluída</div>
        <h1 class="cust__title">Aplicação feita</h1>
        <p class="cust__sub" style="text-align:left">Seu dinheiro já está aplicado. O comprovante fica guardado e a atendente pode imprimir para você levar.</p>
        <div class="card">
          <div class="card__body">
            <div class="rows">
              <div class="row"><span class="row__k">Protocolo</span><span class="row__v">${sim.protocolo}</span></div>
              <div class="row"><span class="row__k">Produto</span><span class="row__v">${sim.nome}</span></div>
              <div class="row"><span class="row__k">Valor aplicado</span><span class="row__v row__v--lg">${money(sim.valor)}</span></div>
              <div class="row"><span class="row__k">Prazo</span><span class="row__v">${sim.prazo} dias</span></div>
              <div class="row"><span class="row__k">Previsão de receber</span><span class="row__v">${money(sim.liquido)}</span></div>
            </div>
          </div>
        </div>
        <button class="audiobtn mt-16" data-audio="feito">${ico('speaker', 18)} Ouvir o comprovante</button>
      </div>`;
    }

    const bloqueado = !su.profile;

    return `
    <div class="cust" style="text-align:left;max-width:760px">
      <div class="cust__task">${ico('money', 16)} Só para você</div>
      <h1 class="cust__title">Você autoriza esta aplicação?</h1>
      <p class="cust__sub" style="text-align:left">Confira os números abaixo. Nada é aplicado sem você tocar em autorizar.</p>

      <div class="inline mb-16" style="justify-content:flex-start">
        <button class="audiobtn" data-audio="aplicar">${ico('speaker', 18)} Ouvir em voz alta</button>
      </div>

      <div class="card">
        <div class="card__body">
          <div class="rows">
            <div class="row"><span class="row__k">Onde vai ser aplicado</span><span class="row__v">${sim.nome}</span></div>
            <div class="row"><span class="row__k">Quanto você aplica</span><span class="row__v row__v--lg">${money(sim.valor)}</span></div>
            <div class="row"><span class="row__k">Por quanto tempo</span><span class="row__v">${sim.prazo} dias</span></div>
            <div class="row"><span class="row__k">Quanto deve receber</span><span class="row__v">${money(sim.liquido)}</span></div>
            <div class="row"><span class="row__k">Já com imposto descontado</span><span class="row__v">${sim.ir ? money(sim.ir) : 'isento de imposto'}</span></div>
          </div>
        </div>
      </div>

      ${sim.foraPerfil ? `
      <div class="note note--alert">
        <span class="note__ic">${ico('alert', 18)}</span>
        <div><b>Atenção: isto não combina com o seu perfil.</b> <span class="muted">Você respondeu que prefere não correr risco, e esta aplicação pode variar mais do que isso. Você pode aplicar mesmo assim. A escolha é sua e fica registrada.</span></div>
      </div>` : ''}

      ${!sim.fgc ? `
      <div class="note note--info">
        <span class="note__ic">${ico('info', 18)}</span>
        <div><b>Este produto não tem a garantia do FGC.</b> <span class="muted">Diferente do CDB, aqui não existe a proteção automática de até 250 mil reais.</span></div>
      </div>` : ''}

      ${bloqueado ? `
      <div class="note note--danger">
        <span class="note__ic">${ico('xCircle', 18)}</span>
        <div><b>Ainda não podemos aplicar.</b> <span class="muted">Falta responder as perguntas sobre o seu perfil. Isso protege você de receber uma oferta que não combina com o seu caso.</span></div>
      </div>` : `
      <div class="toggle mt-16">
        <div class="toggle__txt">
          <div class="toggle__name">Entendi o valor, o prazo e o imposto</div>
          <div class="toggle__desc">Confirmo que a atendente me explicou e que eu concordo.</div>
        </div>
        <button class="switch" role="switch" aria-checked="${!!sim.ack}" data-act="ack"></button>
      </div>
      ${sim.erro ? `<div class="note note--danger mt-16" role="alert"><span class="note__ic">${ico('xCircle', 18)}</span><div><b>${sim.erro}</b></div></div>` : ''}
      <button class="btn btn--cta btn--lg btn--block mt-16" data-act="autorizar" ${sim.ack ? '' : 'disabled'}>
        ${ico('check', 18)} Autorizar aplicação de ${money(sim.valor)}
      </button>
      <button class="btn btn--link mt-8" data-act="desistir">Prefiro não aplicar agora</button>`}

      <div class="trace" style="justify-content:flex-start">
        <span class="chip chip--iface">I21 · A02</span>
        <span class="chip chip--ca">14.5.1 · 15.31.2 · 17.9</span>
        <span class="chip chip--norm">Res. CVM 30/2021 · art. 3º</span>
      </div>
    </div>`;
  },
  bind(root) {
    const sim = S.inv.simulation;
    if (!sim) return;

    if (sim.applied) {
      ligarAudio(root.querySelector('[data-audio="feito"]'),
        `Aplicação concluída. Protocolo ${sim.protocolo}. Você aplicou ${money(sim.valor)} em ${sim.nome}, pelo prazo de ${sim.prazo} dias. A previsão é receber ${money(sim.liquido)}.`,
        'I21', 'Comprovante da aplicação lido em voz alta');
      return;
    }

    ligarAudio(root.querySelector('[data-audio="aplicar"]'), [
      'Confira esta aplicação.',
      `Produto: ${sim.nome}.`,
      `Valor que você aplica: ${money(sim.valor)}.`,
      `Prazo: ${sim.prazo} dias.`,
      `Previsão de receber no fim: ${money(sim.liquido)}, já com o imposto descontado.`,
      sim.foraPerfil ? 'Atenção: esta aplicação não combina com o perfil que você declarou. Ela pode variar mais do que você disse aceitar. Você pode aplicar mesmo assim, mas é bom saber disso antes.' : '',
      !sim.fgc ? 'Este produto não tem a garantia do fundo garantidor de crédito.' : '',
      'Nada é aplicado sem você autorizar.',
    ].filter(Boolean).join(' '), 'I21', 'Termos da aplicação lidos em voz alta para a titular');

    const ack = root.querySelector('[data-act="ack"]');
    if (ack) ack.onclick = () => {
      sim.ack = !sim.ack;
      audit('I21', `Titular ${sim.ack ? 'confirmou' : 'retirou a confirmação de'} entendimento do valor, prazo e imposto`);
      render();
    };

    const aut = root.querySelector('[data-act="autorizar"]');
    if (aut) aut.onclick = comTitular('Autorização da aplicação', () => {
      /* O dinheiro sai da conta corrente: sem saldo disponível, não aplica. */
      if (sim.valor > disponivelCC()) {
        sim.erro = `Você tem ${money(disponivelCC())} disponível na conta corrente. Para aplicar ${money(sim.valor)}, peça à atendente para simular um valor menor.`;
        audit('I21', `Aplicação não autorizada · saldo disponível insuficiente (${money(disponivelCC())})`);
        render(); return;
      }
      sim.erro = null;
      sim.applied = true;
      sim.protocolo = uid('APL');
      movimentarCC(-sim.valor, `Aplicação ${sim.nome} · ${sim.protocolo}`, '027');
      /* A aplicação entra na posição consolidada, que S16 consulta. */
      S.inv.positions.push({
        id: sim.protocolo, produto: sim.modalidade === 'FUNDO' ? 'FUNDO' : 'CDB',
        modalidade: sim.modalidade, indexador: sim.modalidade === 'POS' ? 'CDI' : '—',
        taxa: 0, valor: sim.valor, aplicadoEm: hojeISO(),
        vencimento: emDias(sim.prazo),
        bruto: sim.valor, liquidez: sim.prazo <= 30 ? 'NO_VENCIMENTO' : 'DIARIA',
        tarifa: sim.adm || 0, nome: sim.nome,
      });
      audit('I21', `Aplicação ${sim.protocolo} autorizada pela titular · ${sim.nome} · ${money(sim.valor)} · ${sim.prazo} dias`
                 + (sim.foraPerfil ? ' · ALERTA de desenquadramento de perfil aceito e registrado' : ''));
      render();
    });

    const des = root.querySelector('[data-act="desistir"]');
    if (des) des.onclick = () => {
      audit('I21', 'Titular optou por não aplicar e a simulação foi descartada sem efeito');
      S.inv.simulation = null;
      render();
    };
  },
  onNext() {
    const sim = S.inv.simulation;
    if (sim && !sim.applied) audit('I21', 'Etapa encerrada sem autorização da titular: nada foi aplicado');
  },
};

/* Faixa de rastreabilidade presente também nos estados vazio e concluído. */
(function () {
  const TRACE = `
      <div class="trace" style="justify-content:flex-start">
        <span class="chip chip--iface">I21 · A02</span>
        <span class="chip chip--ca">14.5.1 · 15.31.2 · 17.9</span>
        <span class="chip chip--norm">Res. CVM 30/2021 · art. 3º</span>
      </div>`;
  const r = SCREENS.s15.render;
  SCREENS.s15.render = function () { return garantirTrace(r.call(this), TRACE); };
})();

/* ---------------------------------------------------------------- S16
   Posição consolidada, resgate com penalidade, vencimento e renovação. */
SCREENS.s16 = {
  title: 'Posição, resgate e vencimentos',
  hint: 'S16 · extrato consolidado, resgate com <b>penalidade e imposto calculados antes</b> de confirmar, e escolha do que fazer no vencimento.',
  nextLabel: 'Concluir atendimento',
  render() {
    const pos = S.inv.positions;
    const total = pos.reduce((a, p) => a + p.bruto, 0);
    const res = S.inv.resgate;
    const hoje = new Date();

    /* Requisito 2.1.8: vencimentos próximos viram alerta visível. */
    const vencendo = pos.filter(p => {
      if (!p.vencimento) return false;
      const dias = Math.round((parseISO(p.vencimento) - hoje) / 864e5);
      return dias >= 0 && dias <= 60;
    });

    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('chart', 14)} I22 · Posição e resgate</div>
      <h1 class="h1">Investimentos da cliente</h1>
      <p class="lede">Saldo consolidado, extrato por aplicação e resgate. A penalidade e o imposto aparecem sempre antes da confirmação.</p>

      <div class="grid grid--3 mb-16">
        <div class="card"><div class="tiny muted">Saldo consolidado</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:var(--c-verde-escuro-2)">${money(total)}</div>
          <div class="tiny muted">${pos.length} aplicaç${pos.length === 1 ? 'ão' : 'ões'}</div></div>
        <div class="card"><div class="tiny muted">Rendimento acumulado</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:var(--tx-success)">${money(pos.reduce((a, p) => a + (p.bruto - p.valor), 0))}</div>
          <div class="tiny muted">desde a aplicação</div></div>
        <div class="card"><div class="tiny muted">Vencendo em 60 dias</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:${vencendo.length ? 'var(--c-warning-150)' : 'var(--tx-secondary)'}">${vencendo.length}</div>
          <div class="tiny muted">${vencendo.length ? 'exigem decisão' : 'nada a decidir'}</div></div>
      </div>

      ${vencendo.length ? `
      <div class="note note--alert">
        <span class="note__ic">${ico('alert', 18)}</span>
        <div><b>${vencendo.length} aplicação vencendo.</b> <span class="muted">A cliente precisa escolher: renovar, resgatar para a conta ou reinvestir. Sem escolha, o padrão do contrato é resgate para a conta corrente, e a cliente é informada disso.</span></div>
      </div>` : ''}

      <div class="card card--flush">
        <div class="card__head"><span class="card__title">Extrato de aplicações</span>
          <button class="btn btn--ghost" data-audio="posicao">${ico('speaker', 18)} Ouvir</button></div>
        <div class="card__body" style="padding:0">
          <table class="table">
            <thead><tr><th>Aplicação</th><th>Modalidade</th><th>Aplicado</th><th>Hoje</th><th>Vencimento</th><th>No vencimento</th><th></th></tr></thead>
            <tbody>
              ${pos.map(p => {
                const dias = p.vencimento ? Math.round((parseISO(p.vencimento) - hoje) / 864e5) : null;
                const esc = S.inv.renovacao[p.id];
                return `
                <tr>
                  <td><b>${p.nome || p.produto}</b><div class="tiny muted">${p.id}</div></td>
                  <td>${({ PRE: 'pré-fixado', POS: 'pós-fixado', HIBRIDO: 'híbrido', POUP: 'poupança', FUNDO: 'fundo' })[p.modalidade] || p.modalidade}
                      ${p.indexador !== '—' ? `<div class="tiny muted">${p.indexador}</div>` : ''}</td>
                  <td>${money(p.valor)}<div class="tiny muted">${parseISO(p.aplicadoEm).toLocaleDateString('pt-BR')}</div></td>
                  <td><b>${money(p.bruto)}</b><div class="tiny" style="color:var(--tx-success)">+ ${money(p.bruto - p.valor)}</div></td>
                  <td>${p.vencimento ? parseISO(p.vencimento).toLocaleDateString('pt-BR') : 'sem prazo'}
                      ${dias !== null && dias <= 60 && dias >= 0 ? `<div class="tiny" style="color:var(--c-warning-150)">em ${dias} dias</div>` : ''}</td>
                  <td>
                    <select class="field__select" data-renov="${p.id}" style="min-width:150px">
                      <option value="" ${!esc ? 'selected' : ''}>a definir</option>
                      <option value="AUTOMATICA" ${esc === 'AUTOMATICA' ? 'selected' : ''}>renovar igual</option>
                      <option value="RESGATE" ${esc === 'RESGATE' ? 'selected' : ''}>resgatar p/ conta</option>
                      <option value="REINVESTIR" ${esc === 'REINVESTIR' ? 'selected' : ''}>reinvestir</option>
                    </select>
                  </td>
                  <td><button class="btn btn--outline" data-resg="${p.id}">${ico('swap', 16)} Resgatar</button></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      ${res ? `
      <div class="card">
        <div class="card__head">
          <span class="card__title">Resgate solicitado · ${res.id}</span>
          <span class="badge badge--${res.penalidade || res.iof ? 'alert' : 'success'}">${res.penalidade || res.iof ? 'com desconto' : 'sem penalidade'}</span>
        </div>
        <div class="card__body">
          <div class="grid grid--2">
            <div class="rows">
              <div class="row"><span class="row__k">Valor bruto hoje</span><span class="row__v">${money(res.bruto)}</span></div>
              <div class="row"><span class="row__k">Rendimento</span><span class="row__v">${money(res.rendimento)}</span></div>
              <div class="row"><span class="row__k">Imposto de renda (${(res.aliqIr * 100).toFixed(1)}%)</span><span class="row__v">− ${money(res.ir)}</span></div>
              ${res.iof ? `<div class="row"><span class="row__k">IOF (menos de 30 dias)</span><span class="row__v">− ${money(res.iof)}</span></div>` : ''}
              ${res.penalidade ? `<div class="row"><span class="row__k">Penalidade contratual</span><span class="row__v">− ${money(res.penalidade)}</span></div>` : ''}
              <div class="row"><span class="row__k"><b>Vai para a conta</b></span><span class="row__v row__v--lg">${money(res.liquido)}</span></div>
            </div>
            <div>
              ${res.bloqueado ? `
              <div class="note note--danger">
                <span class="note__ic">${ico('xCircle', 18)}</span>
                <div><b>Este produto não permite resgate antecipado.</b> <span class="muted">RDB e LCA ficam presos até o vencimento. Não existe exceção operacional na agência, e informar isso é o atendimento correto.</span></div>
              </div>` : `
              <div class="note note--alert">
                <span class="note__ic">${ico('alert', 18)}</span>
                <div><b>Resgatar agora custa ${money(res.custoTotal)}.</b> <span class="muted">Se esperar até o vencimento, a cliente recebe mais. A comparação precisa ser dita em voz alta antes de confirmar.</span></div>
              </div>
              <div class="field mt-16">
                <label class="field__label">Creditar em</label>
                <select class="field__select" id="resg-destino">
                  <option value="CC">Conta corrente</option>
                  <option value="POUP">Conta poupança</option>
                </select>
              </div>
              <button class="btn btn--danger btn--block mt-16" data-act="confirmar-resgate">
                ${ico('swap', 18)} Levar ao cliente para autorizar</button>`}
              <button class="btn btn--link mt-8" data-act="cancelar-resgate">Cancelar o resgate</button>
            </div>
          </div>
        </div>
      </div>` : ''}

      <div class="trace">
        <span class="chip chip--iface">I22</span>
        <span class="chip chip--ca">2.1.8 · 2.1.9 · 2.1.10 · 2.1.15 · 14.5.2 · 14.5.3 · 15.31.1 · 15.31.3</span>
        <span class="chip chip--norm">IN RFB 1.585/2015 · Res. CMN 4.753/2019</span>
      </div>
    </div>`;
  },
  bind(root) {
    const hoje = new Date();

    ligarAudio(root.querySelector('[data-audio="posicao"]'), [
      'Seus investimentos.',
      `Total aplicado hoje: ${money(S.inv.positions.reduce((a, p) => a + p.bruto, 0))}.`,
      ...S.inv.positions.map(p => `${p.nome || p.produto}: aplicou ${money(p.valor)}, hoje tem ${money(p.bruto)}`
        + (p.vencimento ? `, vence em ${parseISO(p.vencimento).toLocaleDateString('pt-BR')}.` : ', sem prazo de vencimento.')),
    ].join(' '), 'I22', 'Posição de investimentos lida em voz alta');

    root.querySelectorAll('[data-renov]').forEach(s => s.onchange = (e) => {
      const id = s.dataset.renov, v = e.target.value;
      if (v) {
        S.inv.renovacao[id] = v;
        const rot = { AUTOMATICA: 'renovação automática nas mesmas condições', RESGATE: 'resgate para a conta no vencimento', REINVESTIR: 'reinvestimento em outro produto' }[v];
        audit('I22', `Aplicação ${id}: definido ${rot} no vencimento`);
      } else {
        delete S.inv.renovacao[id];
        audit('I22', `Aplicação ${id}: decisão de vencimento removida`);
      }
    });

    root.querySelectorAll('[data-resg]').forEach(b => b.onclick = () => {
      const p = S.inv.positions.find(x => x.id === b.dataset.resg);
      if (!p) return;
      const dias = Math.round((hoje - parseISO(p.aplicadoEm)) / 864e5);
      const rendimento = p.bruto - p.valor;
      const aliqIr = p.modalidade === 'POUP' ? 0 : irRendaFixa(dias);
      const ir = rendimento * aliqIr;
      const iof = rendimento * iofDias(dias) * 0.3;
      /* RDB e LCA não admitem resgate antecipado: a tela informa em vez de
         oferecer um caminho que não existe. */
      const bloqueado = /RDB|LCA/i.test(p.nome || '') && p.vencimento && parseISO(p.vencimento) > hoje;
      const penalidade = (!bloqueado && p.liquidez === 'NO_VENCIMENTO' && p.vencimento && parseISO(p.vencimento) > hoje)
        ? rendimento * 0.2 : 0;
      S.inv.resgate = {
        id: p.id, bruto: p.bruto, rendimento, aliqIr, ir, iof, penalidade, bloqueado,
        custoTotal: ir + iof + penalidade,
        liquido: p.bruto - ir - iof - penalidade,
      };
      audit('I22', `Resgate simulado de ${p.id} · ${dias} dias aplicados · custo ${money(ir + iof + penalidade)}`
                 + (bloqueado ? ' · BLOQUEADO: produto sem resgate antecipado' : ''));
      render();
    });

    const conf = root.querySelector('[data-act="confirmar-resgate"]');
    if (conf) conf.onclick = comTitular('Resgate da aplicação', () => {
      const r = S.inv.resgate;
      const destino = root.querySelector('#resg-destino').value === 'POUP' ? 'conta poupança' : 'conta corrente';
      audit('I22', `Resgate de ${r.id} encaminhado para autorização da titular · ${money(r.liquido)} na ${destino}`);
      S.srv.pendingApproval = { tipo: 'RESGATE', id: r.id, valor: r.liquido };
      render();
    });
    const canc = root.querySelector('[data-act="cancelar-resgate"]');
    if (canc) canc.onclick = () => {
      audit('I22', `Resgate de ${S.inv.resgate.id} cancelado antes da autorização`);
      S.inv.resgate = null;
      render();
    };
  },
  onNext() {
    const pendentes = S.inv.positions.filter(p => {
      if (!p.vencimento) return false;
      const d = Math.round((parseISO(p.vencimento) - new Date()) / 864e5);
      return d >= 0 && d <= 60 && !S.inv.renovacao[p.id];
    });
    if (pendentes.length) {
      audit('I22', `${pendentes.length} aplicação com vencimento próximo sem decisão registrada, e a cliente será notificada`);
      S.inv.alerts = pendentes.map(p => p.id);
    }
  },
};
