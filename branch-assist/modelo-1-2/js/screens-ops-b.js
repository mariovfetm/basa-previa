/* =========================================================================
   TELAS — Agendamentos (1.2.4 · 14.7.2) e comprovantes/tarifas (15.32.x)
   ======================================================================= */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- S23
   Agendamentos. Cancelar é sempre possível até a véspera — e o cliente
   precisa saber disso, senão vira reclamação.                          */
SCREENS.s23 = {
  title: 'Agendamentos e cancelamentos',
  hint: 'S23 · agendamento pode ser <b>cancelado até a véspera</b>, sem custo. Saldo insuficiente na data não gera multa: a operação apenas não acontece e a cliente é avisada.',
  nextLabel: 'Concluir agendamentos',
  render() {
    const ag = S.ops.agendamentos;
    const ativos = ag.filter(a => a.status === 'AGENDADO');
    const total = ativos.reduce((a, b) => a + b.valor, 0);

    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('clock', 14)} I28 · Agendamentos</div>
      <h1 class="h1">Pagamentos e transferências agendados</h1>
      <p class="lede">O que está marcado para sair da conta, quando sai e o que acontece se faltar saldo no dia.</p>

      <div class="grid grid--3 mb-16">
        <div class="card"><div class="tiny muted">Agendamentos ativos</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold)">${ativos.length}</div></div>
        <div class="card"><div class="tiny muted">Total comprometido</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold)">${money(total)}</div></div>
        <div class="card"><div class="tiny muted">Saldo disponível hoje</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:${saldoCC() >= total ? 'var(--tx-success)' : 'var(--c-destructive-150)'}">${money(saldoCC())}</div>
          <div class="tiny muted">${saldoCC() >= total ? 'cobre os agendamentos' : 'não cobre tudo'}</div></div>
      </div>

      ${total > saldoCC() ? `
      <div class="note note--alert">
        <span class="note__ic">${ico('alert', 18)}</span>
        <div><b>Os agendamentos somam mais do que o saldo.</b> <span class="muted">Se faltar dinheiro na data, a operação não acontece e a cliente é avisada. Não há multa do banco. O boleto, porém, pode ter juros do cedente, e isso precisa ser explicado.</span></div>
      </div>` : ''}

      <div class="card card--flush">
        <div class="card__head"><span class="card__title">Agenda da cliente</span>
          <button class="btn btn--ghost" data-audio="agenda">${ico('speaker', 18)} Ouvir</button></div>
        <div class="card__body" style="padding:0">
          <table class="table">
            <thead><tr><th>Quando</th><th>O que é</th><th>Valor</th><th>Repete</th><th>Situação</th><th></th></tr></thead>
            <tbody>
              ${ag.map(a => {
                const dias = Math.round((parseISO(a.quando) - new Date()) / 864e5);
                const podeCancelar = a.status === 'AGENDADO' && dias >= 1;
                return `
                <tr>
                  <td>${parseISO(a.quando).toLocaleDateString('pt-BR')}
                    ${dias >= 0 ? `<div class="tiny muted">em ${dias} dia${dias === 1 ? '' : 's'}</div>` : ''}</td>
                  <td><b>${a.descricao}</b><div class="tiny muted">${a.id} · ${a.tipo === 'TRANSFERENCIA' ? 'transferência' : 'pagamento'}</div></td>
                  <td><b>${money(a.valor)}</b></td>
                  <td>${a.repete ? 'todo mês' : 'uma vez'}</td>
                  <td><span class="badge badge--${a.status === 'AGENDADO' ? 'info' : a.status === 'CANCELADO' ? 'neutral' : 'success'}">${a.status === 'AGENDADO' ? 'agendado' : a.status === 'CANCELADO' ? 'cancelado' : 'executado'}</span></td>
                  <td>${podeCancelar
                    ? `<button class="btn btn--outline" data-agcancel="${a.id}">${ico('x', 16)} Cancelar</button>`
                    : a.status === 'AGENDADO'
                      ? '<span class="tiny muted">sai hoje, não dá para cancelar</span>'
                      : ''}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card__title mb-16">Novo agendamento</div>
        <div class="grid grid--3">
          <div class="field">
            <label class="field__label" for="ag-desc">O que é</label>
            <input class="field__input" id="ag-desc" placeholder="ex.: conta de água">
          </div>
          <div class="field">
            <label class="field__label" for="ag-valor">Valor</label>
            <input class="field__input" id="ag-valor" inputmode="decimal" placeholder="ex.: 80">
          </div>
          <div class="field">
            <label class="field__label" for="ag-data">Data</label>
            <input class="field__input" id="ag-data" type="date">
          </div>
        </div>
        <div class="toggle mt-16">
          <div class="toggle__txt">
            <div class="toggle__name">Repetir todo mês</div>
            <div class="toggle__desc">A cliente pode cancelar quando quiser, sem custo.</div>
          </div>
          <button class="switch" role="switch" aria-checked="false" data-act="ag-repete"></button>
        </div>
        <button class="btn btn--cta mt-16" data-act="ag-criar">${ico('plus', 18)} Agendar</button>
      </div>

      <div class="trace">
        <span class="chip chip--iface">I28</span>
        <span class="chip chip--ca">1.2.4 · 14.7.2</span>
        <span class="chip chip--norm">Res. CMN 4.753/2019 · art. 4º</span>
      </div>
    </div>`;
  },
  bind(root) {
    const ag = S.ops.agendamentos;
    let repete = false;

    ligarAudio(root.querySelector('[data-audio="agenda"]'), [
      'Seus pagamentos agendados.',
      ...ag.filter(a => a.status === 'AGENDADO').map(a =>
        `${a.descricao}: ${money(a.valor)} no dia ${parseISO(a.quando).toLocaleDateString('pt-BR')}${a.repete ? ', todo mês' : ''}.`),
      'Você pode cancelar qualquer um deles até o dia anterior, sem pagar nada.',
    ].join(' '), 'I28', 'Agenda de pagamentos lida em voz alta');

    root.querySelectorAll('[data-agcancel]').forEach(b => b.onclick = comTitular('Cancelamento do agendamento', () => {
      const a = ag.find(x => x.id === b.dataset.agcancel);
      a.status = 'CANCELADO';
      audit('I28', `Agendamento ${a.id} cancelado a pedido da titular · ${a.descricao} · ${money(a.valor)} · sem custo`);
      render();
    }));

    const sw = root.querySelector('[data-act="ag-repete"]');
    if (sw) sw.onclick = () => {
      repete = !repete;
      sw.setAttribute('aria-checked', String(repete));
    };

    const criar = root.querySelector('[data-act="ag-criar"]');
    if (criar) criar.onclick = comTitular('Novo agendamento', () => {
      const desc = root.querySelector('#ag-desc').value.trim();
      const valor = Number(String(root.querySelector('#ag-valor').value).replace(/\./g, '').replace(',', '.')) || 0;
      const data = root.querySelector('#ag-data').value;
      if (!desc || valor <= 0 || !data) {
        audit('I28', 'Agendamento não criado: faltou descrição, valor ou data');
        return;
      }
      const novo = { id: uid('AGD'), tipo: 'PAGAMENTO', descricao: desc, valor, quando: data, status: 'AGENDADO', repete };
      ag.push(novo);
      audit('I28', `Agendamento ${novo.id} criado · ${desc} · ${money(valor)} para ${parseISO(data).toLocaleDateString('pt-BR')}`
                 + (repete ? ' · repete todo mês' : ''));
      render();
    });
  },
  onNext() {
    const ativos = S.ops.agendamentos.filter(a => a.status === 'AGENDADO');
    const total = ativos.reduce((a, b) => a + b.valor, 0);
    if (total > saldoCC()) audit('I28', `Agendamentos (${money(total)}) excedem o saldo e a cliente foi orientada sobre o risco de não execução`);
  },
};

/* ---------------------------------------------------------------- S24
   Comprovantes e tarifas. A consulta de tarifas é o que permite ao
   cliente saber quanto a conta custou — e cobrar isenção a que tem direito. */
SCREENS.s24 = {
  title: 'Comprovantes e tarifas',
  hint: 'S24 · comprovante de até 5 anos, impresso ou por e-mail. A <b>lista de tarifas mostra as isenções</b>: o cliente precisa saber o que já tem direito de graça.',
  nextLabel: 'Encerrar atendimento',
  render() {
    const cs = S.ops.comprovantes;
    const tf = S.ops.tarifas;
    const pagas = tf.reduce((a, t) => a + t.valor, 0);
    const economizadas = tf.filter(t => t.isento).length;
    const TIPOS = { TRANSFERENCIA: 'Transferência', TED: 'TED', PAGAMENTO: 'Pagamento', SAQUE: 'Saque', DEPOSITO: 'Depósito' };

    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('print', 14)} I29 · Comprovantes e tarifas</div>
      <h1 class="h1">Comprovantes e o que a conta custou</h1>
      <p class="lede">Segunda via de qualquer operação dos últimos 5 anos, e a lista de tarifas do período com as isenções aplicadas.</p>

      <div class="grid grid--2">
        <div>
          <div class="card card--flush">
            <div class="card__head"><span class="card__title">Comprovantes</span>
              <span class="badge badge--neutral">${cs.length} operações</span></div>
            <div class="card__body" style="padding:0">
              <table class="table">
                <thead><tr><th>Data</th><th>Operação</th><th>Valor</th><th>Tarifa</th><th></th></tr></thead>
                <tbody>
                  ${cs.map(c => `
                  <tr>
                    <td>${parseISO(c.data).toLocaleDateString('pt-BR')}</td>
                    <td><b>${TIPOS[c.tipo] || c.tipo}</b><div class="tiny muted">${c.descricao}</div></td>
                    <td><b>${money(c.valor)}</b></td>
                    <td>${c.tarifa ? money(c.tarifa) : '<span class="tiny muted">isento</span>'}</td>
                    <td>
                      <div class="inline">
                        <button class="btn btn--ghost" data-cimp="${c.id}">${ico('print', 14)} Imprimir</button>
                        <button class="btn btn--ghost" data-cmail="${c.id}">${ico('envelope', 14)} E-mail</button>
                      </div>
                    </td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div class="note note--info mt-16">
            <span class="note__ic">${ico('info', 18)}</span>
            <div><b>Guarda de 5 anos.</b> <span class="muted">Qualquer operação desse período pode ser reimpressa na agência, sem custo. A cliente não precisa guardar papel.</span></div>
          </div>
        </div>

        <div>
          <div class="card card--flush">
            <div class="card__head"><span class="card__title">Tarifas do período</span>
              <span class="badge badge--${pagas > 0 ? 'alert' : 'success'}">${pagas > 0 ? money(pagas) + ' pagos' : 'nada pago'}</span></div>
            <div class="card__body" style="padding:0">
              <table class="table">
                <thead><tr><th>Serviço</th><th>Usos</th><th>Cobrado</th></tr></thead>
                <tbody>
                  ${tf.map(t => `
                  <tr>
                    <td><b>${t.nome}</b>${t.obs ? `<div class="tiny muted">${t.obs}</div>` : ''}</td>
                    <td>${t.qtd}</td>
                    <td>${t.isento
                      ? '<span class="badge badge--success">isento</span>'
                      : `<b>${money(t.valor)}</b>`}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card mt-16">
            <div class="card__body">
              <div class="rows">
                <div class="row"><span class="row__k">Total pago em tarifas</span><span class="row__v row__v--lg">${money(pagas)}</span></div>
                <div class="row"><span class="row__k">Serviços isentos usados</span><span class="row__v">${economizadas} de ${tf.length}</span></div>
              </div>
              <div class="note note--success mt-16">
                <span class="note__ic">${ico('shield', 18)}</span>
                <div><b>A conta simplificada não tem tarifa de manutenção.</b> <span class="muted">Pix, 4 saques e 2 extratos por mês também são gratuitos por norma. Dizer isso é parte do atendimento, porque muita gente paga por não saber.</span></div>
              </div>
              <button class="audiobtn mt-16" data-audio="tarifas">${ico('speaker', 18)} Ouvir as tarifas</button>
            </div>
          </div>
        </div>
      </div>

      <div class="trace">
        <span class="chip chip--iface">I29</span>
        <span class="chip chip--ca">15.32.1 · 15.32.2 · 15.32.3 · 15.32.4 · 15.32.5</span>
        <span class="chip chip--norm">Res. CMN 3.919/2010 (tarifas) · Res. CMN 4.196/2013</span>
      </div>
    </div>`;
  },
  bind(root) {
    const tf = S.ops.tarifas;
    const pagas = tf.reduce((a, t) => a + t.valor, 0);

    ligarAudio(root.querySelector('[data-audio="tarifas"]'), [
      'O que a sua conta custou neste período.',
      pagas > 0 ? `Você pagou ${money(pagas)} em tarifas.` : 'Você não pagou nenhuma tarifa neste período.',
      ...tf.map(t => t.isento
        ? `${t.nome}: ${t.qtd} ${t.qtd === 1 ? 'uso' : 'usos'}, sem cobrança.`
        : `${t.nome}: ${t.qtd} ${t.qtd === 1 ? 'uso' : 'usos'}, ${money(t.valor)}.`),
      'A conta simplificada não tem tarifa de manutenção. Pix é gratuito. Você tem direito a quatro saques e dois extratos por mês sem pagar nada.',
    ].join(' '), 'I29', 'Tarifas do período lidas em voz alta para a titular');

    root.querySelectorAll('[data-cimp]').forEach(b => b.onclick = () => {
      const c = S.ops.comprovantes.find(x => x.id === b.dataset.cimp);
      audit('I29', `Comprovante ${c.id} impresso a pedido da titular · ${c.descricao} · ${money(c.valor)}`);
      b.innerHTML = `${ico('check', 14)} Impresso`;
      b.disabled = true;
    });
    root.querySelectorAll('[data-cmail]').forEach(b => b.onclick = () => {
      const c = S.ops.comprovantes.find(x => x.id === b.dataset.cmail);
      const email = S.customer.email || 'e-mail cadastrado';
      audit('I29', `Comprovante ${c.id} enviado para ${email} a pedido da titular`);
      b.innerHTML = `${ico('check', 14)} Enviado`;
      b.disabled = true;
    });
  },
  onNext() {
    const pagas = S.ops.tarifas.reduce((a, t) => a + t.valor, 0);
    audit('I29', `Atendimento encerrado · ${S.ops.comprovantes.length} comprovantes disponíveis · ${money(pagas)} em tarifas no período`);
  },
};
