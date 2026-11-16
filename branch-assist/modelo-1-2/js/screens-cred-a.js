/* =========================================================================
   TELAS — Crédito (Loans) e limites (Limits)
   -------------------------------------------------------------------------
   14.3.1  Simulação e contratação de empréstimos ............... S17 · S18
   14.3.2  Acompanhar propostas de crédito e financiamento ...... S19
   14.3.8  Simuladores: pessoal, capital de giro, custeio, inv. . S17
   15.23.1 Desembolso de operações de crédito ................... S18
   15.28.1 Simulação de crédito pessoal e consignado ............ S17
   15.28.2 Contratação de empréstimo pessoal .................... S18
   8.3     Limites diários de TED, com janela noturna ........... S20
   17.15   Limite de crédito por critério de risco do BACEN ..... S20
   19.2.1  Monitoramento contínuo do limite de crédito .......... S20
   ======================================================================= */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- S17
   Simulação de crédito. Mostra CET, não só a taxa — é o número que
   permite comparar propostas, e o que a norma exige informar.          */
SCREENS.s17 = {
  title: 'Simulação de crédito e custeio',
  hint: 'S17 · a simulação mostra o <b>CET anual</b> e o total pago, não só a parcela. Consignado respeita a margem de 35%; custeio exige DAP vigente.',
  nextLabel: 'Levar ao cliente',
  render() {
    const sim = S.cred.simulation;
    const renda = S.customer.income || 1518;
    const margem = margemConsignavel(renda);

    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('bank', 14)} I23 · Simulação de crédito</div>
      <h1 class="h1">Simular crédito</h1>
      <p class="lede">Cinco linhas, da mais barata à mais cara. O custo total aparece antes de qualquer proposta seguir, porque a parcela sozinha esconde o preço do dinheiro.</p>

      <div class="grid grid--2">
        <div>
          <div class="card card--flush">
            <div class="card__head"><span class="card__title">Linhas disponíveis</span>
              <span class="badge badge--neutral">renda ${money(renda)}</span></div>
            <div class="card__body" style="padding:0">
              ${CRED_PRODUCTS.map(p => {
                const sel = sim && sim.produto === p.id;
                const trava = p.exigeDap ? 'exige DAP vigente'
                            : p.exigeProjeto ? 'exige projeto técnico'
                            : p.exigeCnpj ? 'exige CNPJ ativo'
                            : p.exigeMargem ? `margem de ${money(margem)}` : null;
                return `
                <button class="pinmethod" data-cprod="${p.id}" data-active="${sel}" style="border-radius:0;border-left:none;border-right:none">
                  <span class="pinmethod__n">${ico('money', 14)}</span>
                  <span style="flex:1">
                    <span class="toggle__name">${p.nome}
                      ${p.id.includes('AGRICOLA') || p.id === 'INVESTIMENTO' ? '<span class="badge badge--brand" style="margin-left:6px">FNO</span>' : ''}
                    </span>
                    <span class="toggle__desc">${p.taxaMes}% ao mês · até ${p.maxParcelas}x · teto ${money(p.teto)}</span>
                    <span class="toggle__desc" style="font-style:italic">“${p.plain}”</span>
                    ${trava ? `<span class="toggle__desc" style="color:var(--c-warning-150)">${ico('alert', 12)} ${trava}</span>` : ''}
                  </span>
                </button>`;
              }).join('')}
            </div>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card__title mb-16">Parâmetros</div>
            <div class="grid">
              <div class="field">
                <label class="field__label" for="cr-valor">Valor pretendido</label>
                <input class="field__input" id="cr-valor" inputmode="decimal" value="${sim ? sim.valor : ''}" placeholder="ex.: 3000">
              </div>
              <div class="field">
                <label class="field__label" for="cr-parc">Parcelas</label>
                <select class="field__select" id="cr-parc">
                  ${[6, 12, 18, 24, 36, 48, 60, 84, 120].map(n =>
                    `<option value="${n}" ${sim && sim.parcelas === n ? 'selected' : ''}>${n}x</option>`).join('')}
                </select>
              </div>
              <button class="btn btn--cta" data-act="simular-cred">${ico('chart', 18)} Calcular</button>
            </div>
          </div>

          ${sim ? `
          <div class="card">
            <div class="card__head">
              <span class="card__title">Resultado</span>
              <span class="badge badge--${sim.bloqueios.length ? 'alert' : 'success'}">${sim.bloqueios.length ? sim.bloqueios.length + ' pendência(s)' : 'sem impedimento'}</span>
            </div>
            <div class="card__body">
              <div class="rows">
                <div class="row"><span class="row__k">Linha</span><span class="row__v">${sim.nome}</span></div>
                <div class="row"><span class="row__k">Valor liberado</span><span class="row__v">${money(sim.valor)}</span></div>
                <div class="row"><span class="row__k">Parcela mensal</span><span class="row__v row__v--lg">${money(sim.parcela)}</span></div>
                <div class="row"><span class="row__k">Prazo</span><span class="row__v">${sim.parcelas}x</span></div>
                <div class="row"><span class="row__k">Taxa de juros</span><span class="row__v">${sim.taxaMes}% ao mês</span></div>
                <div class="row"><span class="row__k">IOF</span><span class="row__v">${money(sim.iof)}</span></div>
                <div class="row"><span class="row__k"><b>CET</b></span><span class="row__v"><b>${sim.cet.toFixed(1)}% ao ano</b></span></div>
                <div class="row"><span class="row__k">Total a pagar</span><span class="row__v">${money(sim.total)}</span></div>
                <div class="row"><span class="row__k">Juros embutidos</span><span class="row__v" style="color:var(--c-destructive-150)">${money(sim.total - sim.valor)}</span></div>
              </div>

              ${sim.bloqueios.map(b => `
              <div class="note note--${b.tipo} mt-16">
                <span class="note__ic">${ico(b.tipo === 'danger' ? 'xCircle' : 'alert', 18)}</span>
                <div><b>${b.titulo}</b> <span class="muted">${b.texto}</span></div>
              </div>`).join('')}

              ${sim.comprometimento > 30 ? `
              <div class="note note--alert mt-16">
                <span class="note__ic">${ico('alert', 18)}</span>
                <div><b>A parcela compromete ${sim.comprometimento.toFixed(0)}% da renda.</b> <span class="muted">Acima de 30% o crédito passa por alçada e a conversa muda: o atendimento responsável é oferecer prazo maior ou valor menor, não empurrar a operação.</span></div>
              </div>` : ''}
            </div>
          </div>` : ''}
        </div>
      </div>

      <div class="trace">
        <span class="chip chip--iface">I23</span>
        <span class="chip chip--ca">14.3.1 · 14.3.8 · 15.28.1</span>
        <span class="chip chip--norm">Res. CMN 4.881/2020 (CET) · Lei 14.431/2022 (margem)</span>
      </div>
    </div>`;
  },
  bind(root) {
    let sel = S.cred.simulation ? S.cred.simulation.produto : null;

    root.querySelectorAll('[data-cprod]').forEach(b => b.onclick = () => {
      sel = b.dataset.cprod;
      root.querySelectorAll('[data-cprod]').forEach(x => x.dataset.active = String(x.dataset.cprod === sel));
      audit('I23', `Linha ${CRED_PRODUCTS.find(p => p.id === sel).nome} selecionada para simulação`);
    });

    const btn = root.querySelector('[data-act="simular-cred"]');
    if (btn) btn.onclick = () => {
      const p = CRED_PRODUCTS.find(x => x.id === sel);
      if (!p) { audit('I23', 'Simulação de crédito sem linha selecionada'); return; }
      const valor = Number(String(root.querySelector('#cr-valor').value).replace(/\./g, '').replace(',', '.')) || 0;
      const n = Number(root.querySelector('#cr-parc').value);
      if (valor <= 0) { audit('I23', 'Simulação de crédito sem valor válido'); return; }

      const renda = S.customer.income || 1518;
      const parcela = parcelaPrice(valor, p.taxaMes, n);
      const total = parcela * n;
      /* IOF do crédito a pessoa física: 0,38% + 0,0082%/dia, limitado a 365 dias. */
      const iof = valor * (0.0038 + 0.000082 * Math.min(n * 30, 365));
      /* CET aproximado a partir da taxa mensal efetiva mais encargos. */
      const cet = (Math.pow(1 + p.taxaMes / 100, 12) - 1) * 100 + (iof / valor) * 100;
      const comprometimento = (parcela / renda) * 100;

      const bloqueios = [];
      if (n > p.maxParcelas) bloqueios.push({ tipo: 'danger', titulo: `Prazo acima do permitido nesta linha (${p.maxParcelas}x).`, texto: 'Reduza o número de parcelas para prosseguir.' });
      if (valor > p.teto) bloqueios.push({ tipo: 'danger', titulo: `Valor acima do teto da linha (${money(p.teto)}).`, texto: 'Acima disso, a operação exige outra linha e outra alçada.' });
      if (p.exigeMargem && parcela > margemConsignavel(renda)) {
        bloqueios.push({ tipo: 'danger', titulo: `Parcela acima da margem consignável de ${money(margemConsignavel(renda))}.`, texto: 'O desconto em benefício é limitado a 35% por lei. Não há exceção na agência.' });
      }
      if (p.exigeDap) bloqueios.push({ tipo: 'alert', titulo: 'Exige DAP vigente.', texto: 'A declaração de aptidão ao Pronaf precisa estar válida na data da contratação.' });
      if (p.exigeProjeto) bloqueios.push({ tipo: 'alert', titulo: 'Exige projeto técnico.', texto: 'Operação de investimento do FNO depende de projeto e parecer técnico antes do desembolso.' });
      if (p.exigeCnpj) bloqueios.push({ tipo: 'alert', titulo: 'Exige CNPJ ativo.', texto: 'Capital de giro é linha de pessoa jurídica; verifique a titularidade antes de seguir.' });

      S.cred.simulation = {
        produto: p.id, nome: p.nome, valor, parcelas: n, taxaMes: p.taxaMes,
        parcela, total, iof, cet, comprometimento, bloqueios,
        impedida: bloqueios.some(b => b.tipo === 'danger'),
      };
      audit('I23', `Simulação de ${p.nome} · ${money(valor)} em ${n}x de ${money(parcela)} · CET ${cet.toFixed(1)}% a.a.`
                 + (bloqueios.length ? ` · ${bloqueios.length} pendência(s)` : ''));
      render();
    };
  },
  onNext() {
    const s = S.cred.simulation;
    if (s && s.impedida) audit('I23', 'Simulação com impedimento levada ao cliente apenas para explicação, com contratação bloqueada');
  },
};

/* ---------------------------------------------------------------- S18
   Contratação e desembolso. A titular autoriza no tablet, com CET e
   total lidos em voz alta antes de assinar.                            */
SCREENS.s18 = {
  title: 'Contratação e desembolso',
  hint: 'S18 · modo cliente. Contratar exige o <b>CET e o total pago lidos em voz alta</b> e confirmação da titular. Simulação impedida não oferece contratação.',
  nextLabel: 'Confirmar contratação',
  render() {
    const sim = S.cred.simulation;

    if (!sim) {
      return `
      <div class="cust" style="text-align:left;max-width:760px">
        <div class="cust__task">${ico('info', 16)} Nada a contratar</div>
        <h1 class="cust__title">Não há proposta pendente</h1>
        <p class="cust__sub" style="text-align:left">A atendente ainda não montou uma simulação. Peça para ela mostrar as opções de crédito antes de você decidir.</p>
      </div>`;
    }

    if (sim.contracted) {
      const op = S.cred.disbursed[S.cred.disbursed.length - 1];
      return `
      <div class="cust" style="text-align:left;max-width:760px">
        <div class="cust__task">${ico('check', 16)} Tarefa concluída</div>
        <h1 class="cust__title">Crédito contratado</h1>
        <p class="cust__sub" style="text-align:left">O dinheiro ${op && op.liberado ? 'já está na sua conta' : 'será liberado conforme o prazo abaixo'}.</p>
        <div class="card"><div class="card__body">
          <div class="rows">
            <div class="row"><span class="row__k">Contrato</span><span class="row__v">${sim.contrato}</span></div>
            <div class="row"><span class="row__k">Valor na conta</span><span class="row__v row__v--lg">${money(sim.valor)}</span></div>
            <div class="row"><span class="row__k">Primeira parcela</span><span class="row__v">${sim.primeiraParcela}</span></div>
            <div class="row"><span class="row__k">Parcela</span><span class="row__v">${money(sim.parcela)} por ${sim.parcelas} meses</span></div>
            <div class="row"><span class="row__k">Desembolso</span><span class="row__v">${op && op.liberado ? 'liberado agora' : 'em até 1 dia útil'}</span></div>
          </div>
        </div></div>
        <div class="note note--info mt-16">
          <span class="note__ic">${ico('shield', 18)}</span>
          <div><b>Você pode desistir em 7 dias.</b> <span class="muted">É o direito de arrependimento. Devolvendo o valor nesse prazo, não paga juros.</span></div>
        </div>
        <button class="audiobtn mt-16" data-audio="contratado">${ico('speaker', 18)} Ouvir o comprovante</button>
      </div>`;
    }

    if (sim.impedida) {
      return `
      <div class="cust" style="text-align:left;max-width:760px">
        <div class="cust__task">${ico('info', 16)} Só para você</div>
        <h1 class="cust__title">Hoje não conseguimos fazer esse empréstimo</h1>
        <p class="cust__sub" style="text-align:left">Não é uma recusa por você. São regras de valor e de prazo desta linha de crédito.</p>
        ${sim.bloqueios.filter(b => b.tipo === 'danger').map(b => `
        <div class="note note--danger">
          <span class="note__ic">${ico('xCircle', 18)}</span>
          <div><b>${b.titulo}</b> <span class="muted">${b.texto}</span></div>
        </div>`).join('')}
        <div class="note note--info">
          <span class="note__ic">${ico('info', 18)}</span>
          <div><b>O que dá para fazer.</b> <span class="muted">A atendente pode simular de novo com prazo maior ou valor menor. Você não precisa decidir nada agora.</span></div>
        </div>
        <button class="audiobtn mt-16" data-audio="impedido">${ico('speaker', 18)} Ouvir a explicação</button>
      </div>`;
    }

    return `
    <div class="cust" style="text-align:left;max-width:760px">
      <div class="cust__task">${ico('bank', 16)} Só para você</div>
      <h1 class="cust__title">Você aceita este empréstimo?</h1>
      <p class="cust__sub" style="text-align:left">Confira com calma. Nada é contratado sem você autorizar.</p>

      <div class="inline mb-16" style="justify-content:flex-start">
        <button class="audiobtn" data-audio="credito">${ico('speaker', 18)} Ouvir em voz alta</button>
      </div>

      <div class="card"><div class="card__body">
        <div class="rows">
          <div class="row"><span class="row__k">Você recebe</span><span class="row__v row__v--lg">${money(sim.valor)}</span></div>
          <div class="row"><span class="row__k">Você paga por mês</span><span class="row__v row__v--lg">${money(sim.parcela)}</span></div>
          <div class="row"><span class="row__k">Durante</span><span class="row__v">${sim.parcelas} meses</span></div>
          <div class="row"><span class="row__k"><b>No fim você terá pago</b></span><span class="row__v"><b>${money(sim.total)}</b></span></div>
          <div class="row"><span class="row__k">Ou seja, de juros</span><span class="row__v" style="color:var(--c-destructive-150)">${money(sim.total - sim.valor)}</span></div>
          <div class="row"><span class="row__k">Custo total (CET)</span><span class="row__v">${sim.cet.toFixed(1)}% por ano</span></div>
        </div>
      </div></div>

      ${sim.comprometimento > 30 ? `
      <div class="note note--alert">
        <span class="note__ic">${ico('alert', 18)}</span>
        <div><b>Essa parcela é grande para a sua renda.</b> <span class="muted">Ela compromete ${sim.comprometimento.toFixed(0)}% do que você recebe por mês. Vale pensar se sobra para as outras contas.</span></div>
      </div>` : ''}

      <div class="toggle mt-16">
        <div class="toggle__txt">
          <div class="toggle__name">Entendi quanto vou pagar no total</div>
          <div class="toggle__desc">Confirmo que a atendente me explicou o valor da parcela e o total.</div>
        </div>
        <button class="switch" role="switch" aria-checked="${!!sim.ack}" data-act="cack"></button>
      </div>

      <button class="btn btn--cta btn--lg btn--block mt-16" data-act="contratar" ${sim.ack ? '' : 'disabled'}>
        ${ico('check', 18)} Aceito e autorizo o empréstimo
      </button>
      <button class="btn btn--link mt-8" data-act="cdesistir">Prefiro não fazer agora</button>

      <div class="trace" style="justify-content:flex-start">
        <span class="chip chip--iface">I23 · A02</span>
        <span class="chip chip--ca">14.3.1 · 15.23.1 · 15.28.2</span>
        <span class="chip chip--norm">Res. CMN 4.881/2020 (CET) · CDC art. 49</span>
      </div>
    </div>`;
  },
  bind(root) {
    const sim = S.cred.simulation;
    if (!sim) return;

    if (sim.contracted) {
      ligarAudio(root.querySelector('[data-audio="contratado"]'),
        `Empréstimo contratado. Contrato ${sim.contrato}. Você recebeu ${money(sim.valor)}. Vai pagar ${money(sim.parcela)} por mês, durante ${sim.parcelas} meses. A primeira parcela vence em ${sim.primeiraParcela}. Se mudar de ideia, você tem sete dias para desistir sem pagar juros.`,
        'I23', 'Comprovante da contratação lido em voz alta');
      return;
    }
    if (sim.impedida) {
      ligarAudio(root.querySelector('[data-audio="impedido"]'),
        'Hoje não conseguimos fazer este empréstimo. ' + sim.bloqueios.filter(b => b.tipo === 'danger').map(b => b.titulo + ' ' + b.texto).join(' ')
        + ' Isto não é uma recusa por causa do seu nome. A atendente pode tentar com prazo maior ou valor menor.',
        'I23', 'Motivo do impedimento lido em voz alta para a titular');
      return;
    }

    ligarAudio(root.querySelector('[data-audio="credito"]'), [
      'Confira este empréstimo.',
      `Você recebe agora ${money(sim.valor)}.`,
      `Você paga ${money(sim.parcela)} por mês, durante ${sim.parcelas} meses.`,
      `No fim, você terá pago ${money(sim.total)}.`,
      `Isso quer dizer ${money(sim.total - sim.valor)} de juros.`,
      `O custo total por ano é de ${sim.cet.toFixed(1)} por cento.`,
      sim.comprometimento > 30 ? `Atenção: esta parcela compromete ${sim.comprometimento.toFixed(0)} por cento do que você recebe por mês. Pense se sobra dinheiro para as outras contas.` : '',
      'Nada é contratado sem você autorizar. Você pode pensar e voltar outro dia.',
    ].filter(Boolean).join(' '), 'I23', 'Condições do crédito lidas em voz alta para a titular');

    const ack = root.querySelector('[data-act="cack"]');
    if (ack) ack.onclick = () => {
      sim.ack = !sim.ack;
      audit('I23', `Titular ${sim.ack ? 'confirmou' : 'retirou a confirmação de'} entendimento do total a pagar`);
      render();
    };

    const ct = root.querySelector('[data-act="contratar"]');
    if (ct) ct.onclick = comTitular('Contratação do crédito', () => {
      sim.contracted = true;
      sim.contrato = uid('CTR');
      const d = new Date(); d.setMonth(d.getMonth() + 1);
      sim.primeiraParcela = d.toLocaleDateString('pt-BR');
      /* Desembolso (15.23.1): liberação imediata só nas linhas próprias;
         FNO depende de projeto e parecer, então entra como programado. */
      const p = CRED_PRODUCTS.find(x => x.id === sim.produto);
      const liberado = !(p.exigeProjeto || p.exigeDap);
      S.cred.disbursed.push({ contrato: sim.contrato, produto: sim.produto, valor: sim.valor, liberado });
      if (liberado) movimentarCC(sim.valor, `Crédito ${sim.nome} · contrato ${sim.contrato}`, '041');
      audit('I23', `Contrato ${sim.contrato} firmado pela titular · ${sim.nome} · ${money(sim.valor)} em ${sim.parcelas}x`);
      audit('I23', liberado
        ? `Desembolso de ${money(sim.valor)} liberado em conta corrente`
        : `Desembolso de ${money(sim.valor)} programado, sujeito a projeto técnico e parecer`);
      render();
    });

    const des = root.querySelector('[data-act="cdesistir"]');
    if (des) des.onclick = () => {
      audit('I23', 'Titular optou por não contratar e a simulação foi descartada sem efeito');
      S.cred.simulation = null;
      render();
    };
  },
  onNext() {
    const s = S.cred.simulation;
    if (s && !s.contracted && !s.impedida) audit('I23', 'Etapa encerrada sem contratação: nada foi firmado');
  },
};

/* Faixa de rastreabilidade presente também nos estados vazio, impedido e concluído. */
(function () {
  const TRACE = `
      <div class="trace" style="justify-content:flex-start">
        <span class="chip chip--iface">I23 · A02</span>
        <span class="chip chip--ca">14.3.1 · 15.23.1 · 15.28.2</span>
        <span class="chip chip--norm">Res. CMN 4.881/2020 (CET) · CDC art. 49</span>
      </div>`;
  const r = SCREENS.s18.render;
  SCREENS.s18.render = function () { return garantirTrace(r.call(this), TRACE); };
})();
