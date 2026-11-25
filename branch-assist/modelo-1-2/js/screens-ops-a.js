/* =========================================================================
   TELAS — Poupança, transferências SPB, DDA, agendamentos e comprovantes
   -------------------------------------------------------------------------
   1.2.3   Movimentação de poupança: debitar, creditar, estornar ..... S21
   15.2.9  Débito e crédito em poupança ............................. S21
   14.7.7  Transferências entre contas BASA e TED ................... S21
   15.5.1  CC para outra instituição (SPB) .......................... S21
   15.5.2  Poupança para outra instituição (SPB) .................... S21
   15.5.3  Entre contas com titulares comuns ........................ S21
   15.5.4  Entre mesmos titulares ................................... S21
   8.13    Adesão e cancelamento do DDA ............................. S22
   8.14    Boletos DDA: pagar, agendar ou contestar ................. S22
   14.7.5  DDA: aderir, cancelar, gerenciar boletos ................. S22
   1.2.4   Agendar lançamento e transferência, cancelar ............. S23
   14.7.2  Agendamento, cancelamento e consulta .................... S23
   15.32.1 Comprovantes de saque, depósito, transferência, pagamento  S24
   15.32.2 Impressão e envio digital por e-mail .................... S24
   15.32.3 Consulta de comprovantes passados ....................... S24
   15.32.4 Acesso a comprovantes anteriores ........................ S24
   15.32.5 Consulta de tarifas aplicadas ........................... S24
   ======================================================================= */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- S21
   Poupança e transferências. Movimentar dinheiro é decisão da titular,
   então a autorização acontece no modo cliente.                        */
SCREENS.s21 = {
  title: 'Poupança e transferências SPB',
  hint: 'S21 · modo cliente. A titular vê <b>tarifa, prazo e efeito no rendimento</b> antes de autorizar. Sacar antes do aniversário perde o rendimento do mês, e isso é informado à titular.',
  nextLabel: 'Confirmar operação',
  render() {
    const po = S.ops.poupanca;
    const tr = S.ops.transferencia;
    const hoje = new Date().getDate();
    const diasAniv = po.aniversario >= hoje ? po.aniversario - hoje : 30 - hoje + po.aniversario;

    if (tr && tr.done) {
      return `
      <div class="cust" style="text-align:left;max-width:760px">
        <div class="cust__task">${ico('check', 16)} Tarefa concluída</div>
        <h1 class="cust__title">Transferência feita</h1>
        <p class="cust__sub" style="text-align:left">${tr.prazo === 'na hora' ? 'O dinheiro já chegou no destino.' : 'O dinheiro chega em até um dia útil.'}</p>
        <div class="card"><div class="card__body">
          <div class="rows">
            <div class="row"><span class="row__k">Comprovante</span><span class="row__v">${tr.protocolo}</span></div>
            <div class="row"><span class="row__k">Valor</span><span class="row__v row__v--lg">${money(tr.valor)}</span></div>
            <div class="row"><span class="row__k">Para</span><span class="row__v">${tr.nomeTipo}</span></div>
            <div class="row"><span class="row__k">Tarifa</span><span class="row__v">${tr.tarifa ? money(tr.tarifa) : 'sem tarifa'}</span></div>
          </div>
        </div></div>
        <button class="audiobtn mt-16" data-audio="transf-ok">${ico('speaker', 18)} Ouvir o comprovante</button>
      </div>`;
    }

    return `
    <div class="cust" style="text-align:left;max-width:860px">
      <div class="cust__task">${ico('swap', 16)} Só para você</div>
      <h1 class="cust__title">Sua poupança e transferências</h1>
      <p class="cust__sub" style="text-align:left">Veja quanto tem guardado e para onde pode enviar dinheiro.</p>

      <div class="inline mb-16" style="justify-content:flex-start">
        <button class="audiobtn" data-audio="poup">${ico('speaker', 18)} Ouvir em voz alta</button>
      </div>

      <div class="card">
        <div class="card__head"><span class="card__title">Conta poupança ${po.conta}</span>
          <span class="badge badge--success">sem tarifa de manutenção</span></div>
        <div class="card__body">
          <div class="rows">
            <div class="row"><span class="row__k">Você tem guardado</span><span class="row__v row__v--lg">${money(po.saldo)}</span></div>
            <div class="row"><span class="row__k">Rendimento à espera do dia ${po.aniversario}</span><span class="row__v">${money(po.rendimentoPendente)}</span></div>
            <div class="row"><span class="row__k">Faltam</span><span class="row__v">${diasAniv} dias para render</span></div>
          </div>
          <div class="note note--alert mt-16">
            <span class="note__ic">${ico('alert', 18)}</span>
            <div><b>Se tirar antes do dia ${po.aniversario}, perde o rendimento do mês.</b> <span class="muted">A poupança só rende na data de aniversário. Tirando um dia antes, você perde ${money(po.rendimentoPendente)}. Se puder esperar ${diasAniv} dias, vale mais a pena.</span></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card__title mb-16">Para onde enviar</div>
        <div class="choices">
          ${TRANSF_TIPOS.map(t => `
            <button class="choice" data-ttipo="${t.id}" aria-pressed="${tr && tr.tipo === t.id}">
              <span class="choice__ic">${ico('swap', 20)}</span>
              <span style="flex:1">
                <span class="choice__t">${t.nome}</span>
                <span class="toggle__desc">“${t.plain}”</span>
                <span class="toggle__desc">${t.tarifa ? `tarifa de ${money(t.tarifa)}` : 'sem tarifa'} · chega ${t.prazo}</span>
              </span>
            </button>`).join('')}
        </div>

        ${tr && tr.tipo ? `
        <div class="grid grid--2 mt-16">
          <div class="field">
            <label class="field__label" for="tr-valor">Quanto você quer enviar</label>
            <input class="field__input" id="tr-valor" inputmode="decimal" value="${tr.valor || ''}" placeholder="ex.: 200">
          </div>
          <div class="field">
            <label class="field__label" for="tr-dest">Para quem</label>
            <input class="field__input" id="tr-dest" value="${tr.destino || ''}" placeholder="nome ou CPF">
          </div>
        </div>

        ${tr.erro ? `
        <div class="note note--danger mt-16">
          <span class="note__ic">${ico('xCircle', 18)}</span>
          <div><b>${tr.erro}</b></div>
        </div>` : ''}

        ${tr.valor > 0 && !tr.erro ? `
        <div class="card mt-16">
          <div class="card__body">
            <div class="rows">
              <div class="row"><span class="row__k">Você envia</span><span class="row__v row__v--lg">${money(tr.valor)}</span></div>
              ${tr.tarifa ? `<div class="row"><span class="row__k">Tarifa</span><span class="row__v">${money(tr.tarifa)}</span></div>` : ''}
              <div class="row"><span class="row__k"><b>Sai da sua conta</b></span><span class="row__v"><b>${money(tr.valor + tr.tarifa)}</b></span></div>
              <div class="row"><span class="row__k">Chega</span><span class="row__v">${tr.prazo}</span></div>
              ${tr.perdeRendimento ? `<div class="row"><span class="row__k">Rendimento que você perde</span><span class="row__v" style="color:var(--c-destructive-150)">${money(S.ops.poupanca.rendimentoPendente)}</span></div>` : ''}
            </div>
            <button class="btn btn--cta btn--lg btn--block mt-16" data-act="tr-confirmar">
              ${ico('check', 18)} Autorizar envio de ${money(tr.valor)}
            </button>
          </div>
        </div>` : ''}
        ` : ''}
      </div>

      <div class="trace" style="justify-content:flex-start">
        <span class="chip chip--iface">I26 · A02</span>
        <span class="chip chip--ca">1.2.3 · 15.2.9 · 14.7.7 · 15.5.1 · 15.5.2 · 15.5.3 · 15.5.4</span>
        <span class="chip chip--norm">Res. CMN 4.753/2019 · Res. BCB 1/2020</span>
      </div>
    </div>`;
  },
  bind(root) {
    const po = S.ops.poupanca;
    const tr = S.ops.transferencia;

    if (tr && tr.done) {
      ligarAudio(root.querySelector('[data-audio="transf-ok"]'),
        `Transferência concluída. Comprovante ${tr.protocolo}. Você enviou ${money(tr.valor)} para ${tr.nomeTipo}. `
        + (tr.tarifa ? `A tarifa foi de ${money(tr.tarifa)}.` : 'Não houve tarifa.'),
        'I26', 'Comprovante da transferência lido em voz alta');
      return;
    }

    ligarAudio(root.querySelector('[data-audio="poup"]'), [
      `Na sua poupança você tem ${money(po.saldo)}.`,
      `Há ${money(po.rendimentoPendente)} de rendimento esperando o dia ${po.aniversario} do mês.`,
      `Atenção: se tirar o dinheiro antes do dia ${po.aniversario}, você perde esse rendimento. A poupança só rende na data de aniversário.`,
      'Abaixo você escolhe para onde enviar dinheiro. Transferência entre contas do Banco da Amazônia não tem tarifa. Para outro banco, a tarifa é de doze reais e noventa centavos.',
    ].join(' '), 'I26', 'Situação da poupança lida em voz alta para a titular');

    root.querySelectorAll('[data-ttipo]').forEach(b => b.onclick = () => {
      const t = TRANSF_TIPOS.find(x => x.id === b.dataset.ttipo);
      S.ops.transferencia = {
        tipo: t.id, nomeTipo: t.nome, tarifa: t.tarifa, prazo: t.prazo,
        valor: 0, destino: '', perdeRendimento: t.id === 'SPB_POUP',
      };
      audit('I26', `Tipo de transferência escolhido: ${t.nome}`);
      render();
    });

    const valor = root.querySelector('#tr-valor');
    const dest = root.querySelector('#tr-dest');
    const recalcular = () => {
      const t = S.ops.transferencia;
      if (!t) return;
      t.valor = Number(String(valor.value).replace(/\./g, '').replace(',', '.')) || 0;
      t.destino = dest.value;
      /* A origem muda o saldo que limita: poupança ou conta corrente. */
      const saldo = t.tipo === 'SPB_POUP' ? po.saldo : disponivelCC();
      t.erro = null;
      if (t.valor + t.tarifa > saldo) {
        t.erro = `Você tem ${money(saldo)} disponível. Com a tarifa, esta transferência precisaria de ${money(t.valor + t.tarifa)}.`;
      }
      render();
    };
    if (valor) valor.onchange = recalcular;
    if (dest) dest.onchange = recalcular;

    const conf = root.querySelector('[data-act="tr-confirmar"]');
    if (conf) conf.onclick = comTitular('Transferência', () => {
      const t = S.ops.transferencia;
      t.done = true;
      t.protocolo = uid('CMP');
      /* Saldo, disponível e extrato fecham entre si: a origem é debitada e,
         entre contas da própria titular, a poupança é creditada. */
      if (t.tipo === 'SPB_POUP') {
        movimentarPoup(-(t.valor + t.tarifa));
        po.movimentos.push({ tipo: 'DEBITO', valor: t.valor, em: hojeISO() });
        audit('I26', `Débito em poupança de ${money(t.valor)} · rendimento do mês perdido (${money(po.rendimentoPendente)}) · informado à titular antes de autorizar`);
      } else {
        movimentarCC(-t.valor, `${t.nomeTipo} · ${t.protocolo}`, '027');
        if (t.tarifa) movimentarCC(-t.tarifa, `Tarifa · ${t.nomeTipo}`, '027');
        if (t.tipo === 'BASA_MESMO') {
          movimentarPoup(t.valor);
          po.movimentos.push({ tipo: 'CREDITO', valor: t.valor, em: hojeISO() });
        }
      }
      S.ops.comprovantes.unshift({
        id: t.protocolo, tipo: t.tarifa ? 'TED' : 'TRANSFERENCIA',
        data: hojeISO(), valor: t.valor,
        descricao: t.nomeTipo, tarifa: t.tarifa,
      });
      if (t.tarifa) {
        const tf = S.ops.tarifas.find(x => /TED/.test(x.nome));
        if (tf) { tf.qtd += 1; tf.valor += t.tarifa; }
      }
      audit('I26', `Transferência ${t.protocolo} autorizada pela titular · ${t.nomeTipo} · ${money(t.valor)}`
                 + (t.tarifa ? ` · tarifa ${money(t.tarifa)}` : ' · sem tarifa'));
      render();
    });
  },
  onNext() {
    const t = S.ops.transferencia;
    if (t && !t.done) audit('I26', 'Etapa encerrada sem autorização: nenhuma transferência realizada');
  },
};

/* ---------------------------------------------------------------- S22
   DDA: adesão, cancelamento e gestão de boletos.                       */
SCREENS.s22 = {
  title: 'DDA e boletos',
  hint: 'S22 · aderir ao DDA faz os boletos chegarem direto na conta. <b>Contestar é direito do cliente</b> e suspende a cobrança enquanto apura.',
  nextLabel: 'Concluir gestão',
  render() {
    const d = S.ops.dda;
    const aPagar = d.boletos.filter(b => b.status === 'A_PAGAR');
    const total = aPagar.reduce((a, b) => a + b.valor, 0);

    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('file', 14)} I27 · Débito Direto Autorizado</div>
      <h1 class="h1">DDA e boletos da cliente</h1>
      <p class="lede">Com o DDA, os boletos no CPF da cliente chegam direto aqui, sem papel e sem risco de boleto falso.</p>

      <div class="card">
        <div class="card__head">
          <span class="card__title">Adesão ao DDA</span>
          <span class="badge badge--${d.adherido ? 'success' : 'neutral'}">${d.adherido ? 'aderido' : 'não aderido'}</span>
        </div>
        <div class="card__body">
          ${d.adherido ? `
          <div class="note note--success">
            <span class="note__ic">${ico('check', 18)}</span>
            <div><b>Aderido em ${d.adesaoEm}.</b> <span class="muted">Os boletos emitidos no CPF da cliente aparecem automaticamente. Ela é avisada pelo canal que escolheu.</span></div>
          </div>
          <button class="btn btn--outline mt-16" data-act="dda-cancelar">${ico('x', 16)} Cancelar adesão</button>
          <div class="tiny muted mt-8">Cancelar não apaga boletos já recebidos, e a cliente volta a receber boleto em papel.</div>
          ` : `
          <div class="note note--info">
            <span class="note__ic">${ico('shield', 18)}</span>
            <div><b>Por que vale aderir.</b> <span class="muted">Boleto falso é um dos golpes mais comuns. No DDA, o boleto chega pelo banco, com o valor que o cedente registrou, e não dá para alterá-lo no meio do caminho.</span></div>
          </div>
          <button class="btn btn--cta mt-16" data-act="dda-aderir">${ico('check', 16)} Registrar adesão ao DDA</button>
          <div class="tiny muted mt-8">A adesão é um pedido da cliente e fica registrada com data e hora.</div>
          `}
        </div>
      </div>

      ${d.adherido ? `
      <div class="grid grid--3 mb-16">
        <div class="card"><div class="tiny muted">A pagar</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold)">${aPagar.length}</div>
          <div class="tiny muted">${money(total)}</div></div>
        <div class="card"><div class="tiny muted">Contestados</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:var(--c-warning-150)">${d.boletos.filter(b => b.status === 'CONTESTADO').length}</div>
          <div class="tiny muted">cobrança suspensa</div></div>
        <div class="card"><div class="tiny muted">Pagos ou agendados</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:var(--tx-success)">${d.boletos.filter(b => ['PAGO', 'AGENDADO'].includes(b.status)).length}</div></div>
      </div>

      ${d.boletos.map(b => {
        const dias = Math.round((parseISO(b.vence) - new Date()) / 864e5);
        const est = { A_PAGAR: ['info', 'a pagar'], PAGO: ['success', 'pago'],
                      AGENDADO: ['info', 'agendado'], CONTESTADO: ['alert', 'contestado'] }[b.status] || ['neutral', b.status];
        return `
        <div class="card">
          <div class="card__head">
            <span class="card__title">${b.cedente}</span>
            <span class="badge badge--${est[0]}">${est[1]}</span>
          </div>
          <div class="card__body">
            <div class="grid grid--2">
              <div class="rows">
                <div class="row"><span class="row__k">Valor</span><span class="row__v row__v--lg">${money(b.valor)}</span></div>
                <div class="row"><span class="row__k">Vence</span><span class="row__v">${parseISO(b.vence).toLocaleDateString('pt-BR')}
                  ${dias >= 0 ? `<span class="tiny muted">(em ${dias} dias)</span>` : '<span class="tiny" style="color:var(--c-destructive-150)">(vencido)</span>'}</span></div>
                <div class="row"><span class="row__k">Linha digitável</span><span class="row__v"><code>${b.linha}</code></span></div>
              </div>
              <div>
                ${b.status === 'A_PAGAR' ? `
                <div class="inline" style="flex-wrap:wrap">
                  <button class="btn btn--cta" data-bpagar="${b.id}">${ico('money', 16)} Pagar agora</button>
                  <button class="btn btn--outline" data-bagendar="${b.id}">${ico('clock', 16)} Agendar</button>
                  <button class="btn btn--ghost" data-bcontestar="${b.id}">${ico('alert', 16)} Contestar</button>
                </div>
                <div class="tiny muted mt-8">Pagar exige autorização da titular no tablet. Agendar e contestar são registros da agência.</div>
                ` : b.status === 'CONTESTADO' ? `
                <div class="note note--alert">
                  <span class="note__ic">${ico('alert', 18)}</span>
                  <div><b>Cobrança suspensa.</b> <span class="muted">${b.motivo}. O cedente foi notificado e tem 10 dias para responder. A cliente não precisa pagar enquanto isso.</span></div>
                </div>` : `
                <div class="note note--success">
                  <span class="note__ic">${ico('check', 18)}</span>
                  <div><b>${b.status === 'PAGO' ? 'Pago' : 'Agendado'}.</b> <span class="muted">Comprovante disponível em S24.</span></div>
                </div>`}
              </div>
            </div>
          </div>
        </div>`;
      }).join('')}
      ` : ''}

      <div class="trace">
        <span class="chip chip--iface">I27</span>
        <span class="chip chip--ca">8.13 · 8.14 · 14.7.5</span>
        <span class="chip chip--norm">Manual DDA Febraban</span>
      </div>
    </div>`;
  },
  bind(root) {
    const d = S.ops.dda;

    const ad = root.querySelector('[data-act="dda-aderir"]');
    if (ad) ad.onclick = comTitular('Adesão ao DDA', () => {
      d.adherido = true;
      d.adesaoEm = new Date().toLocaleDateString('pt-BR');
      audit('I27', 'Adesão ao DDA registrada a pedido da titular, e os boletos no CPF passam a chegar pelo banco');
      render();
    });
    const ca = root.querySelector('[data-act="dda-cancelar"]');
    if (ca) ca.onclick = comTitular('Cancelamento do DDA', () => {
      d.adherido = false;
      audit('I27', 'Adesão ao DDA cancelada a pedido da titular, que volta a receber boleto em papel');
      render();
    });

    root.querySelectorAll('[data-bpagar]').forEach(b => b.onclick = comTitular('Pagamento do boleto', () => {
      const bo = d.boletos.find(x => x.id === b.dataset.bpagar);
      if (bo.valor > disponivelCC()) {
        audit('I27', `Pagamento do boleto ${bo.id} não realizado · saldo disponível insuficiente (${money(disponivelCC())})`);
        render(); return;
      }
      S.srv.pendingApproval = { tipo: 'BOLETO', id: bo.id, valor: bo.valor };
      bo.status = 'PAGO';
      movimentarCC(-bo.valor, `Pagamento de boleto · ${bo.cedente}`, '027');
      audit('I27', `Boleto ${bo.id} (${bo.cedente}, ${money(bo.valor)}) pago a pedido da titular presente · débito em conta corrente`);
      S.ops.comprovantes.unshift({
        id: uid('CMP'), tipo: 'PAGAMENTO', data: hojeISO(),
        valor: bo.valor, descricao: `Boleto ${bo.cedente}`, tarifa: 0,
      });
      render();
    }));
    root.querySelectorAll('[data-bagendar]').forEach(b => b.onclick = comTitular('Agendamento do boleto', () => {
      const bo = d.boletos.find(x => x.id === b.dataset.bagendar);
      bo.status = 'AGENDADO';
      S.ops.agendamentos.push({
        id: uid('AGD'), tipo: 'PAGAMENTO', descricao: `Boleto ${bo.cedente}`,
        valor: bo.valor, quando: bo.vence, status: 'AGENDADO', repete: false,
      });
      audit('I27', `Boleto ${bo.id} agendado para ${parseISO(bo.vence).toLocaleDateString('pt-BR')} · ${money(bo.valor)}`);
      render();
    }));
    root.querySelectorAll('[data-bcontestar]').forEach(b => b.onclick = comTitular('Contestação do boleto', () => {
      const bo = d.boletos.find(x => x.id === b.dataset.bcontestar);
      bo.status = 'CONTESTADO';
      bo.motivo = 'Cliente não reconhece a cobrança';
      audit('I27', `Boleto ${bo.id} contestado · cobrança suspensa · cedente notificado com prazo de 10 dias`);
      render();
    }));
  },
  onNext() {
    const venc = S.ops.dda.boletos.filter(b => b.status === 'A_PAGAR' && parseISO(b.vence) < new Date());
    if (venc.length) audit('I27', `${venc.length} boleto(s) vencido(s) sem tratamento: cliente orientada`);
  },
};
