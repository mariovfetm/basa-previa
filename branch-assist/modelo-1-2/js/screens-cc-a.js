/* =========================================================================
   TELAS — Conta corrente e poupança (parte 1)
   -------------------------------------------------------------------------
   1.1.3     Consulta parametrizada de dados da conta ............... S25
   1.1.6     Interface de consulta de saldos ........................ S25
   1.1.7     Extrato por quantidade de dias e por período ........... S25
   1.1.11    Identificar contas paralisadas ......................... S25
   1.1.74.7  Extratos por período ................................... S25
   1.1.74.12 Extratos e saldos de todas as contas ................... S25
   1.1.74.14 Consultar informações gerenciais ....................... S25
   1.1.74.15 Saldo na data de abertura .............................. S25
   1.1.74.16 Saldo na data informada ................................ S25
   15.14.1   Consulta de conta corrente com cartão .................. S25
   15.14.2   Consulta de conta corrente sem cartão .................. S25
   15.15.1   Consulta de conta poupança ............................. S25
   15.15.2   Consulta de conta poupança com cartão .................. S25
   1.1.9     Gestão de históricos: incluir, alterar, inativar ....... S26
   1.1.74.17 Lançamentos — consultar ................................ S26
   1.1.12    Débito, crédito, transferência, estorno ................ S26
   1.1.13    Interfaces dessas funcionalidades ...................... S26
   15.14.11  Estorno de transação ................................... S26
   ======================================================================= */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- S25
   Consulta parametrizada. Um atendente precisa ver todas as contas do
   cliente, o saldo em qualquer data e identificar conta paralisada.    */
SCREENS.s25 = {
  title: 'Consulta de contas e extrato',
  hint: 'S25 · todas as contas do CPF, saldo em qualquer data e extrato por dias ou por período. <b>Conta paralisada aparece na lista, sinalizada</b>.',
  nextLabel: 'Ver lançamentos',
  render() {
    const cc = S.cc;
    const conta = cc.contas.find(c => c.id === cc.contaSel) || cc.contas[0];
    const f = cc.filtro;
    const lanc = cc.lancamentos.filter(l => {
      if (!l.ativo) return false;
      const dias = Math.round((new Date() - parseISO(l.data)) / 864e5);
      if (dias > f.dias) return false;
      if (f.tipo !== 'TODOS' && l.tipo !== f.tipo) return false;
      return true;
    });
    const creditos = lanc.filter(l => l.tipo === 'C').reduce((a, l) => a + l.valor, 0);
    const debitos = lanc.filter(l => l.tipo === 'D').reduce((a, l) => a + Math.abs(l.valor), 0);
    const paralisadas = cc.contas.filter(c => c.situacao === 'PARALISADA');

    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('search', 14)} I30 · Consulta parametrizada</div>
      <h1 class="h1">Contas da cliente</h1>
      <p class="lede">Todas as contas no CPF, com saldo, situação e extrato por período. O saldo bloqueado aparece separado do disponível.</p>

      ${paralisadas.length ? `
      <div class="note note--alert">
        <span class="note__ic">${ico('alert', 18)}</span>
        <div><b>${paralisadas.length} conta paralisada.</b> <span class="muted">${paralisadas[0].motivoParalisia}. Conta paralisada não aceita movimentação, mas continua existindo. A cliente tem direito de saber e de reativar ou encerrar.</span></div>
      </div>` : ''}

      <div class="card card--flush">
        <div class="card__head"><span class="card__title">Contas no CPF ${maskCpf(S.customer.cpf)}</span>
          <span class="badge badge--neutral">${cc.contas.length} contas</span></div>
        <div class="card__body" style="padding:0">
          <table class="table">
            <thead><tr><th>Conta</th><th>Tipo</th><th>Situação</th><th>Cartão</th><th>Saldo</th><th>Bloqueado</th><th>Disponível</th><th></th></tr></thead>
            <tbody>
              ${cc.contas.map(c => `
              <tr${c.id === conta.id ? ' style="background:var(--c-verde-light)"' : ''}>
                <td><b>${c.id}</b><div class="tiny muted">aberta em ${parseISO(c.abertaEm).toLocaleDateString('pt-BR')}</div></td>
                <td>${c.tipo === 'CORRENTE' ? 'corrente' : 'poupança'}</td>
                <td><span class="badge badge--${c.situacao === 'ATIVA' ? 'success' : 'alert'}">${c.situacao === 'ATIVA' ? 'ativa' : 'paralisada'}</span></td>
                <td>${c.temCartao ? `<span class="badge badge--info">com cartão</span>` : '<span class="tiny muted">sem cartão</span>'}</td>
                <td><b>${money(c.saldo)}</b></td>
                <td>${c.bloqueado ? `<span style="color:var(--c-destructive-150)">${money(c.bloqueado)}</span>` : '—'}</td>
                <td><b>${money(c.saldo - c.bloqueado)}</b></td>
                <td><button class="btn btn--outline" data-conta="${c.id}">${ico('search', 14)} Abrir</button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid grid--2">
        <div>
          <div class="card">
            <div class="card__title mb-16">Filtro do extrato</div>
            <div class="grid grid--2">
              <div class="field">
                <label class="field__label" for="ex-dias">Últimos dias</label>
                <select class="field__select" id="ex-dias">
                  ${[7, 15, 30, 60, 90, 180].map(d => `<option value="${d}" ${f.dias === d ? 'selected' : ''}>${d} dias</option>`).join('')}
                </select>
              </div>
              <div class="field">
                <label class="field__label" for="ex-tipo">Tipo</label>
                <select class="field__select" id="ex-tipo">
                  <option value="TODOS" ${f.tipo === 'TODOS' ? 'selected' : ''}>todos</option>
                  <option value="C" ${f.tipo === 'C' ? 'selected' : ''}>só entradas</option>
                  <option value="D" ${f.tipo === 'D' ? 'selected' : ''}>só saídas</option>
                </select>
              </div>
            </div>
            <div class="field mt-16">
              <label class="field__label" for="ex-data">Saldo em uma data específica</label>
              <input class="field__input" id="ex-data" type="date" value="${f.dataRef || ''}">
              <span class="field__help">Usado para consulta de saldo retroativo em conferência e contestação.</span>
            </div>
            <button class="btn btn--cta mt-16" data-act="ex-aplicar">${ico('search', 18)} Aplicar filtro</button>
          </div>

          <div class="card">
            <div class="card__title mb-16">Informações gerenciais</div>
            <div class="rows">
              <div class="row"><span class="row__k">Saldo na abertura</span><span class="row__v">${money(conta.saldoAbertura)}</span></div>
              ${f.dataRef ? `
              <div class="row"><span class="row__k">Saldo em ${parseISO(f.dataRef).toLocaleDateString('pt-BR')}</span><span class="row__v">${money(cc.saldoNaData || 0)}</span></div>` : ''}
              <div class="row"><span class="row__k">Entradas no período</span><span class="row__v" style="color:var(--tx-success)">${money(creditos)}</span></div>
              <div class="row"><span class="row__k">Saídas no período</span><span class="row__v" style="color:var(--c-destructive-150)">${money(debitos)}</span></div>
              <div class="row"><span class="row__k">Média mensal de entradas</span><span class="row__v">${money(creditos / Math.max(1, f.dias / 30))}</span></div>
              <div class="row"><span class="row__k">Lançamentos no período</span><span class="row__v">${lanc.length}</span></div>
              <div class="row"><span class="row__k">Tempo de relacionamento</span><span class="row__v">${Math.floor((new Date() - parseISO(conta.abertaEm)) / 864e5 / 365)} anos</span></div>
            </div>
          </div>
        </div>

        <div>
          <div class="card card--flush">
            <div class="card__head">
              <span class="card__title">Extrato · ${conta.id}</span>
              <div class="inline">
                <button class="btn btn--ghost" data-audio="extrato-cc">${ico('speaker', 18)} Ouvir</button>
                <button class="btn btn--ghost" data-act="ex-imprimir">${ico('print', 18)} Imprimir</button>
              </div>
            </div>
            <div class="card__body" style="padding:0">
              ${lanc.length ? `
              <table class="table">
                <thead><tr><th>Data</th><th>Histórico</th><th>Descrição</th><th style="text-align:right">Valor</th></tr></thead>
                <tbody>
                  ${lanc.map(l => `
                  <tr>
                    <td>${parseISO(l.data).toLocaleDateString('pt-BR')}</td>
                    <td><code>${l.hist}</code></td>
                    <td>${l.desc}</td>
                    <td style="text-align:right;font-weight:600;color:${l.tipo === 'C' ? 'var(--tx-success)' : 'var(--tx-default)'}">
                      ${l.tipo === 'C' ? '+ ' : '− '}${money(Math.abs(l.valor))}</td>
                  </tr>`).join('')}
                </tbody>
              </table>` : `
              <div style="padding:var(--sp-24)">
                <div class="note note--info">
                  <span class="note__ic">${ico('info', 18)}</span>
                  <div><b>Nenhum lançamento no filtro escolhido.</b> <span class="muted">Amplie o período ou mude o tipo.</span></div>
                </div>
              </div>`}
            </div>
          </div>
        </div>
      </div>

      <div class="trace">
        <span class="chip chip--iface">I30</span>
        <span class="chip chip--ca">1.1.3 · 1.1.6 · 1.1.7 · 1.1.11 · 1.1.74.7 · 1.1.74.12 · 1.1.74.14 · 1.1.74.15 · 1.1.74.16 · 15.14.1 · 15.14.2 · 15.15.1 · 15.15.2</span>
        <span class="chip chip--norm">Res. CMN 4.753/2019 · Circ. BCB 3.978/2020</span>
      </div>
    </div>`;
  },
  bind(root) {
    const cc = S.cc;
    const conta = cc.contas.find(c => c.id === cc.contaSel) || cc.contas[0];

    root.querySelectorAll('[data-conta]').forEach(b => b.onclick = () => {
      cc.contaSel = b.dataset.conta;
      const c = cc.contas.find(x => x.id === cc.contaSel);
      audit('I30', `Conta ${c.id} (${c.tipo === 'CORRENTE' ? 'corrente' : 'poupança'}) aberta para consulta`
                 + (c.situacao === 'PARALISADA' ? ' · conta PARALISADA, sem movimentação permitida' : ''));
      render();
    });

    const ap = root.querySelector('[data-act="ex-aplicar"]');
    if (ap) ap.onclick = () => {
      cc.filtro.dias = Number(root.querySelector('#ex-dias').value);
      cc.filtro.tipo = root.querySelector('#ex-tipo').value;
      const dr = root.querySelector('#ex-data').value;
      cc.filtro.dataRef = dr || null;
      if (dr) {
        /* Saldo retroativo: parte do saldo atual e desfaz os lançamentos
           posteriores à data pedida. Só é coerente porque
           saldoInicioPeriodo + lançamentos ativos = saldo atual. */
        const posteriores = cc.lancamentos
          .filter(l => l.ativo && parseISO(l.data) > parseISO(dr))
          .reduce((a, l) => a + l.valor, 0);
        cc.saldoNaData = conta.saldo - posteriores;
        audit('I30', `Saldo em ${parseISO(dr).toLocaleDateString('pt-BR')} consultado: ${money(cc.saldoNaData)}`
                   + (cc.saldoNaData < 0 ? ' · conta estava negativa nessa data' : ''));
      }
      audit('I30', `Extrato filtrado · últimos ${cc.filtro.dias} dias · ${cc.filtro.tipo === 'TODOS' ? 'todos os lançamentos' : cc.filtro.tipo === 'C' ? 'somente entradas' : 'somente saídas'}`);
      render();
    };

    const pr = root.querySelector('[data-act="ex-imprimir"]');
    if (pr) pr.onclick = () => {
      audit('I30', `Extrato de ${conta.id} impresso · ${cc.filtro.dias} dias · isento (2 por mês)`);
      pr.innerHTML = `${ico('check', 18)} Impresso`;
      pr.disabled = true;
    };

    const lanc = cc.lancamentos.filter(l => l.ativo &&
      Math.round((new Date() - parseISO(l.data)) / 864e5) <= cc.filtro.dias);
    ligarAudio(root.querySelector('[data-audio="extrato-cc"]'), [
      `Extrato da conta ${conta.tipo === 'CORRENTE' ? 'corrente' : 'poupança'}.`,
      `Saldo: ${money(conta.saldo)}.`,
      conta.bloqueado ? `Atenção: ${money(conta.bloqueado)} estão bloqueados por ordem judicial, então o disponível é ${money(conta.saldo - conta.bloqueado)}.` : '',
      `${lanc.length} lançamentos nos últimos ${cc.filtro.dias} dias.`,
      ...lanc.map(l => `${parseISO(l.data).toLocaleDateString('pt-BR')}, ${l.desc}, ${l.tipo === 'C' ? 'entrada' : 'saída'} de ${money(Math.abs(l.valor))}.`),
    ].filter(Boolean).join(' '), 'I30', 'Extrato de conta corrente lido em voz alta');
  },
  onNext() {
    const p = S.cc.contas.filter(c => c.situacao === 'PARALISADA');
    if (p.length) audit('I30', `${p.length} conta paralisada identificada e cliente orientada sobre reativação ou encerramento`);
  },
};

/* ---------------------------------------------------------------- S26
   Lançamentos e estorno. Lançamento não se apaga: inativa-se, com
   motivo e responsável. É o que permite auditar depois.                */
SCREENS.s26 = {
  title: 'Lançamentos e estorno',
  hint: 'S26 · lançamento <b>nunca é apagado</b>: é inativado com motivo e autor. Estorno gera lançamento novo em contrapartida, preservando o histórico.',
  nextLabel: 'Concluir lançamentos',
  render() {
    const cc = S.cc;
    const todos = cc.lancamentos;
    const ativos = todos.filter(l => l.ativo);
    const inativos = todos.filter(l => !l.ativo);

    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('list', 14)} I31 · Lançamentos</div>
      <h1 class="h1">Lançamentos da conta</h1>
      <p class="lede">Incluir, consultar, alterar e inativar, com código de histórico padronizado. Estorno cria contrapartida e preserva o original.</p>

      <div class="grid grid--3 mb-16">
        <div class="card"><div class="tiny muted">Lançamentos ativos</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold)">${ativos.length}</div></div>
        <div class="card"><div class="tiny muted">Inativados</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:var(--tx-secondary)">${inativos.length}</div>
          <div class="tiny muted">preservados para auditoria</div></div>
        <div class="card"><div class="tiny muted">Estornos no período</div>
          <div style="font-family:var(--ff-secondary);font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:var(--c-warning-150)">${cc.estornos.length}</div></div>
      </div>

      <div class="card card--flush">
        <div class="card__head"><span class="card__title">Histórico completo</span>
          <span class="badge badge--neutral">inclui inativados</span></div>
        <div class="card__body" style="padding:0">
          <table class="table">
            <thead><tr><th>Lançamento</th><th>Data</th><th>Hist.</th><th>Descrição</th><th style="text-align:right">Valor</th><th>Situação</th><th></th></tr></thead>
            <tbody>
              ${todos.map(l => `
              <tr${!l.ativo ? ' style="opacity:.55"' : ''}>
                <td><code>${l.id}</code></td>
                <td>${parseISO(l.data).toLocaleDateString('pt-BR')}</td>
                <td><code>${l.hist}</code></td>
                <td>${l.desc}
                  ${!l.ativo && l.inativadoPor ? `<div class="tiny muted">inativado: ${l.inativadoPor}</div>` : ''}</td>
                <td style="text-align:right;font-weight:600;color:${l.tipo === 'C' ? 'var(--tx-success)' : 'var(--tx-default)'}">
                  ${l.tipo === 'C' ? '+ ' : '− '}${money(Math.abs(l.valor))}</td>
                <td><span class="badge badge--${l.ativo ? 'success' : 'neutral'}">${l.ativo ? 'ativo' : 'inativado'}</span></td>
                <td>
                  ${l.ativo ? `
                  <div class="inline">
                    ${l.estornavel ? `<button class="btn btn--outline" data-estorno="${l.id}">${ico('refresh', 14)} Estornar</button>` : ''}
                    <button class="btn btn--ghost" data-inativar="${l.id}">${ico('x', 14)} Inativar</button>
                  </div>` : '<span class="tiny muted">sem ação</span>'}
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      ${cc.estornoPreparo ? `
      <div class="card">
        <div class="card__head">
          <span class="card__title">Estorno de ${cc.estornoPreparo.id}</span>
          <span class="badge badge--alert">requer alçada</span>
        </div>
        <div class="card__body">
          <div class="grid grid--2">
            <div class="rows">
              <div class="row"><span class="row__k">Lançamento original</span><span class="row__v">${cc.estornoPreparo.desc}</span></div>
              <div class="row"><span class="row__k">Valor a estornar</span><span class="row__v row__v--lg">${money(Math.abs(cc.estornoPreparo.valor))}</span></div>
              <div class="row"><span class="row__k">Contrapartida</span><span class="row__v">histórico 099 · ajuste ou estorno</span></div>
            </div>
            <div>
              <div class="field">
                <label class="field__label" for="est-motivo">Motivo do estorno</label>
                <select class="field__select" id="est-motivo">
                  <option value="DUPLICIDADE">Lançamento em duplicidade</option>
                  <option value="VALOR_INCORRETO">Valor incorreto</option>
                  <option value="NAO_RECONHECIDO">Cliente não reconhece</option>
                  <option value="ERRO_OPERACIONAL">Erro operacional da agência</option>
                </select>
              </div>
              <div class="note note--alert mt-16">
                <span class="note__ic">${ico('alert', 18)}</span>
                <div><b>Estorno preserva o original.</b> <span class="muted">Cria um lançamento novo em contrapartida. O original continua no extrato, e a cliente vê as duas linhas. É assim que se prova o que aconteceu.</span></div>
              </div>
              <button class="btn btn--danger btn--block mt-16" data-act="est-confirmar">${ico('refresh', 18)} Confirmar estorno</button>
              <button class="btn btn--link mt-8" data-act="est-cancelar">Cancelar</button>
            </div>
          </div>
        </div>
      </div>` : ''}

      <div class="card">
        <div class="card__title mb-16">Incluir lançamento manual</div>
        <div class="grid grid--3">
          <div class="field">
            <label class="field__label" for="ln-hist">Histórico</label>
            <select class="field__select" id="ln-hist">
              ${HISTORICOS.map(h => `<option value="${h.cod}">${h.cod} · ${h.nome}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label class="field__label" for="ln-desc">Descrição</label>
            <input class="field__input" id="ln-desc" placeholder="ex.: depósito em espécie">
          </div>
          <div class="field">
            <label class="field__label" for="ln-valor">Valor</label>
            <input class="field__input" id="ln-valor" inputmode="decimal" placeholder="use − para débito">
          </div>
        </div>
        <button class="btn btn--cta mt-16" data-act="ln-incluir">${ico('plus', 18)} Incluir lançamento</button>
        <div class="tiny muted mt-8">Todo lançamento manual registra a matrícula de quem incluiu e exige alçada de conferência.</div>
      </div>

      <div class="trace">
        <span class="chip chip--iface">I31</span>
        <span class="chip chip--ca">1.1.9 · 1.1.12 · 1.1.13 · 1.1.74.17 · 15.14.11</span>
        <span class="chip chip--norm">Circ. BCB 3.978/2020 · Res. CMN 4.753/2019</span>
      </div>
    </div>`;
  },
  bind(root) {
    const cc = S.cc;

    root.querySelectorAll('[data-estorno]').forEach(b => b.onclick = () => {
      const l = cc.lancamentos.find(x => x.id === b.dataset.estorno);
      cc.estornoPreparo = l;
      audit('I31', `Estorno de ${l.id} iniciado · ${l.desc} · ${money(Math.abs(l.valor))} · pendente de alçada`);
      render();
    });

    root.querySelectorAll('[data-inativar]').forEach(b => b.onclick = () => {
      const l = cc.lancamentos.find(x => x.id === b.dataset.inativar);
      l.ativo = false;
      l.inativadoPor = 'Inativado pela agência 0108 a pedido de conferência';
      audit('I31', `Lançamento ${l.id} inativado (não excluído) · ${l.desc} · trilha preservada`);
      render();
    });

    const conf = root.querySelector('[data-act="est-confirmar"]');
    if (conf) conf.onclick = () => {
      const l = cc.estornoPreparo;
      const motivo = root.querySelector('#est-motivo').value;
      const MOT = { DUPLICIDADE: 'lançamento em duplicidade', VALOR_INCORRETO: 'valor incorreto',
                    NAO_RECONHECIDO: 'cliente não reconhece', ERRO_OPERACIONAL: 'erro operacional da agência' };
      /* Contrapartida: valor invertido, histórico 099, referência ao original. */
      const novo = {
        id: uid('LAN'), data: hojeISO(), hist: '099',
        desc: `Estorno de ${l.id} · ${MOT[motivo]}`, valor: -l.valor,
        tipo: l.valor < 0 ? 'C' : 'D', ativo: true, estornavel: false,
      };
      cc.lancamentos.unshift(novo);
      cc.estornos.push({ original: l.id, contrapartida: novo.id, motivo });
      l.estornavel = false;
      /* Os lançamentos são da conta corrente: o estorno volta para ela,
         qualquer que seja a conta aberta na consulta. */
      const conta = contaCC();
      if (conta) conta.saldo = Math.round((conta.saldo - l.valor) * 100) / 100;
      cc.estornoPreparo = null;
      audit('I31', `Estorno concluído · ${l.id} estornado por ${novo.id} · motivo: ${MOT[motivo]} · original preservado no extrato`);
      render();
    };
    const canc = root.querySelector('[data-act="est-cancelar"]');
    if (canc) canc.onclick = () => {
      audit('I31', `Estorno de ${cc.estornoPreparo.id} cancelado antes da efetivação`);
      cc.estornoPreparo = null;
      render();
    };

    const inc = root.querySelector('[data-act="ln-incluir"]');
    if (inc) inc.onclick = () => {
      const hist = root.querySelector('#ln-hist').value;
      const desc = root.querySelector('#ln-desc').value.trim();
      const valor = Number(String(root.querySelector('#ln-valor').value).replace(/\./g, '').replace(',', '.')) || 0;
      if (!desc || valor === 0) { audit('I31', 'Lançamento manual não incluído: faltou descrição ou valor'); return; }
      const novo = {
        id: uid('LAN'), data: hojeISO(), hist,
        desc, valor, tipo: valor < 0 ? 'D' : 'C', ativo: true, estornavel: true,
      };
      cc.lancamentos.unshift(novo);
      const conta = contaCC();
      if (conta) conta.saldo = Math.round((conta.saldo + valor) * 100) / 100;
      audit('I31', `Lançamento manual ${novo.id} incluído · histórico ${hist} · ${desc} · ${money(valor)} · matrícula ${S.session.operatorId}`);
      render();
    };
  },
  onNext() {
    if (S.cc.estornos.length) audit('I31', `${S.cc.estornos.length} estorno(s) no atendimento, todos com contrapartida e motivo registrados`);
  },
};
