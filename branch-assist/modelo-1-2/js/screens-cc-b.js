/* =========================================================================
   TELAS — Conta corrente (parte 2)
   -------------------------------------------------------------------------
   1.1.8    Adiantamento a depositante ............................. S27
   15.4.1   Liberação de cheque especial ........................... S27
   15.4.2   Cancelamento de cheque especial ........................ S27
   1.1.4    Manutenção de parâmetros: incluir, alterar, excluir .... S28
   1.1.10   Bloqueio e desbloqueio de saldo (admin. ou judicial) ... S28
   1.2.9    Bloquear e desbloquear saldos .......................... S28
   1.2.1    Poupança: incluir, alterar, bloquear, cancelar, reativar S28
   15.2.2   Alteração cadastral de conta corrente .................. S28
   15.2.3   Cancelamento de conta corrente ......................... S28
   ======================================================================= */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- S27
   Cheque especial e adiantamento. Crédito rotativo é caro: a titular
   precisa ver o custo mensal antes de contratar, no tablet.            */
SCREENS.s27 = {
  title: 'Cheque especial e adiantamento',
  hint: 'S27 · modo cliente. Cheque especial só é contratado com o <b>custo mensal dito em voz alta</b>. Cancelar é direito e vale na hora, se não houver saldo usado.',
  nextLabel: 'Confirmar escolha',
  render() {
    const ch = S.cc.chequeEspecial;
    const ad = S.cc.adiantamento;
    const renda = S.customer.income || 1518;
    const limiteSugerido = Math.floor(renda * 0.5);

    return `
    <div class="cust" style="text-align:left;max-width:820px">
      <div class="cust__task">${ico('wallet', 16)} Só para você</div>
      <h1 class="cust__title">Cheque especial</h1>
      <p class="cust__sub" style="text-align:left">É um dinheiro emprestado que fica disponível na conta. Só custa se você usar. Mas, quando usa, é o crédito mais caro que existe.</p>

      <div class="inline mb-16" style="justify-content:flex-start">
        <button class="audiobtn" data-audio="cheque">${ico('speaker', 18)} Ouvir em voz alta</button>
      </div>

      ${ch.contratado ? `
      <div class="card">
        <div class="card__head"><span class="card__title">Você tem cheque especial</span>
          <span class="badge badge--${ch.usado > 0 ? 'alert' : 'success'}">${ch.usado > 0 ? 'em uso' : 'disponível, sem uso'}</span></div>
        <div class="card__body">
          <div class="rows">
            <div class="row"><span class="row__k">Limite contratado</span><span class="row__v row__v--lg">${money(ch.limite)}</span></div>
            <div class="row"><span class="row__k">Você está usando</span><span class="row__v">${money(ch.usado)}</span></div>
            <div class="row"><span class="row__k">Juro se usar tudo por 30 dias</span><span class="row__v" style="color:var(--c-destructive-150)">${money(ch.limite * ch.taxaMes / 100)}</span></div>
            <div class="row"><span class="row__k">Contratado em</span><span class="row__v">${ch.contratadoEm}</span></div>
          </div>
          ${ch.usado > 0 ? `
          <div class="note note--alert mt-16">
            <span class="note__ic">${ico('alert', 18)}</span>
            <div><b>Você está usando ${money(ch.usado)} do cheque especial.</b> <span class="muted">Isso custa cerca de ${money(ch.usado * ch.taxaMes / 100)} por mês. Se puder, vale trocar por um empréstimo comum, que é bem mais barato.</span></div>
          </div>
          <div class="note note--info mt-8">
            <span class="note__ic">${ico('info', 18)}</span>
            <div><b>Não é possível cancelar com saldo em uso.</b> <span class="muted">Primeiro é preciso cobrir o valor usado. A atendente pode simular a troca por um empréstimo parcelado.</span></div>
          </div>` : `
          <button class="btn btn--outline btn--lg btn--block mt-16" data-act="ch-cancelar">
            ${ico('x', 18)} Não quero mais o cheque especial</button>
          <div class="tiny muted mt-8">Cancelar vale na hora e não tem custo. Você pode pedir de novo depois.</div>`}
        </div>
      </div>
      ` : `
      <div class="card">
        <div class="card__body">
          <div class="rows">
            <div class="row"><span class="row__k">Limite que você pode ter</span><span class="row__v row__v--lg">${money(limiteSugerido)}</span></div>
            <div class="row"><span class="row__k">Juro por mês</span><span class="row__v">${ch.taxaMes}%</span></div>
            <div class="row"><span class="row__k">Se usar ${money(limiteSugerido)} por 30 dias, paga</span><span class="row__v" style="color:var(--c-destructive-150)">${money(limiteSugerido * ch.taxaMes / 100)} de juros</span></div>
            <div class="row"><span class="row__k">Em um ano, isso daria</span><span class="row__v" style="color:var(--c-destructive-150)">${((Math.pow(1 + ch.taxaMes / 100, 12) - 1) * 100).toFixed(0)}% do valor</span></div>
          </div>

          <div class="note note--alert mt-16">
            <span class="note__ic">${ico('alert', 18)}</span>
            <div><b>É o crédito mais caro do banco.</b> <span class="muted">Muita gente contrata "por garantia" e acaba usando sem perceber, porque o dinheiro parece que é da conta. Se você tem certeza de que precisa, um empréstimo parcelado custa bem menos.</span></div>
          </div>

          <div class="note note--info mt-8">
            <span class="note__ic">${ico('shield', 18)}</span>
            <div><b>Você não precisa decidir agora.</b> <span class="muted">Contratar não é obrigatório para nada, e não ter cheque especial não atrapalha sua conta em nada.</span></div>
          </div>

          <div class="toggle mt-16">
            <div class="toggle__txt">
              <div class="toggle__name">Entendi que é caro e que só pago se usar</div>
              <div class="toggle__desc">Confirmo que a atendente me explicou o custo.</div>
            </div>
            <button class="switch" role="switch" aria-checked="${!!ch.ack}" data-act="ch-ack"></button>
          </div>
          <button class="btn btn--cta btn--lg btn--block mt-16" data-act="ch-contratar" ${ch.ack ? '' : 'disabled'}>
            ${ico('check', 18)} Quero contratar ${money(limiteSugerido)}</button>
          <button class="btn btn--link mt-8" data-act="ch-nao">Não quero, obrigada</button>
        </div>
      </div>`}

      <div class="card">
        <div class="card__head"><span class="card__title">Adiantamento a depositante</span>
          <span class="badge badge--neutral">outro produto</span></div>
        <div class="card__body">
          <p class="p">É diferente do cheque especial: serve quando você depositou um cheque que ainda não foi compensado e precisa do dinheiro antes.</p>
          ${ad.depositoBase ? `
          <div class="rows">
            <div class="row"><span class="row__k">Depósito não compensado</span><span class="row__v">${money(ad.depositoBase)}</span></div>
            <div class="row"><span class="row__k">Pode ser adiantado</span><span class="row__v row__v--lg">${money(ad.disponivel)}</span></div>
            <div class="row"><span class="row__k">Custo</span><span class="row__v">${money(ad.disponivel * 0.02)} (2% sobre o adiantado)</span></div>
          </div>
          ${ad.solicitado ? `
          <div class="note note--success mt-16">
            <span class="note__ic">${ico('check', 18)}</span>
            <div><b>Adiantamento de ${money(ad.solicitado)} liberado.</b> <span class="muted">O valor entra na conta com histórico 072. Quando o cheque compensar, o adiantamento é baixado automaticamente.</span></div>
          </div>` : `
          <button class="btn btn--outline mt-16" data-act="ad-pedir">${ico('money', 18)} Pedir adiantamento de ${money(ad.disponivel)}</button>`}
          ` : `
          <div class="note note--info">
            <span class="note__ic">${ico('info', 18)}</span>
            <div><b>Você não tem depósito aguardando compensação.</b> <span class="muted">Sem isso, não há o que adiantar. Este produto não é um empréstimo: é a liberação antecipada de um dinheiro que já é seu.</span></div>
          </div>
          <button class="btn btn--ghost mt-16" data-act="ad-simular">${ico('refresh', 16)} Simular com um depósito de R$ 500</button>`}
        </div>
      </div>

      <div class="trace" style="justify-content:flex-start">
        <span class="chip chip--iface">I32 · A02</span>
        <span class="chip chip--ca">1.1.8 · 15.4.1 · 15.4.2</span>
        <span class="chip chip--norm">Res. CMN 4.765/2019 (cheque especial) · Res. CMN 3.919/2010 (adiantamento)</span>
      </div>
    </div>`;
  },
  bind(root) {
    const ch = S.cc.chequeEspecial;
    const ad = S.cc.adiantamento;
    const renda = S.customer.income || 1518;
    const limiteSugerido = Math.floor(renda * 0.5);

    ligarAudio(root.querySelector('[data-audio="cheque"]'), ch.contratado ? [
      `Você tem cheque especial de ${money(ch.limite)}.`,
      ch.usado > 0
        ? `Você está usando ${money(ch.usado)}, e isso custa cerca de ${money(ch.usado * ch.taxaMes / 100)} por mês. Para cancelar, primeiro é preciso cobrir esse valor.`
        : 'Você não está usando nada, então não está pagando juros. Se quiser, pode cancelar agora mesmo, sem custo.',
    ].join(' ') : [
      'Cheque especial.',
      'É um dinheiro emprestado que fica disponível na sua conta. Você só paga se usar.',
      `O limite que você pode ter é de ${money(limiteSugerido)}.`,
      `O juro é de ${ch.taxaMes} por cento por mês.`,
      `Se você usar ${money(limiteSugerido)} durante trinta dias, vai pagar ${money(limiteSugerido * ch.taxaMes / 100)} só de juros.`,
      'Atenção: este é o crédito mais caro do banco. Muita gente contrata por garantia e acaba usando sem perceber, porque o dinheiro parece ser da conta.',
      'Se você tem certeza de que precisa de dinheiro, um empréstimo parcelado custa bem menos. Você não precisa decidir agora, e não ter cheque especial não atrapalha sua conta.',
    ].join(' '), 'I32', 'Condições do cheque especial lidas em voz alta para a titular');

    const ack = root.querySelector('[data-act="ch-ack"]');
    if (ack) ack.onclick = () => {
      ch.ack = !ch.ack;
      audit('I32', `Titular ${ch.ack ? 'confirmou' : 'retirou a confirmação de'} entendimento do custo do cheque especial`);
      render();
    };

    const ct = root.querySelector('[data-act="ch-contratar"]');
    if (ct) ct.onclick = comTitular('Contratação do cheque especial', () => {
      ch.contratado = true;
      ch.limite = limiteSugerido;
      ch.contratadoEm = new Date().toLocaleDateString('pt-BR');
      audit('I32', `Cheque especial liberado a pedido da titular · limite ${money(ch.limite)} · taxa ${ch.taxaMes}% ao mês · custo explicado e confirmado`);
      render();
    });

    const nao = root.querySelector('[data-act="ch-nao"]');
    if (nao) nao.onclick = () => {
      audit('I32', 'Titular recusou o cheque especial: recusa registrada, nenhum limite contratado');
      render();
    };

    const canc = root.querySelector('[data-act="ch-cancelar"]');
    if (canc) canc.onclick = comTitular('Cancelamento do cheque especial', () => {
      if (ch.usado > 0) {
        audit('I32', 'Cancelamento de cheque especial bloqueado: há saldo em uso');
        return;
      }
      ch.contratado = false; ch.limite = 0; ch.ack = false;
      audit('I32', 'Cheque especial cancelado a pedido da titular · vigência imediata · sem custo');
      render();
    });

    const sim = root.querySelector('[data-act="ad-simular"]');
    if (sim) sim.onclick = () => {
      ad.depositoBase = 500;
      /* Adianta-se até 70% do depósito não compensado. */
      ad.disponivel = Math.floor(500 * 0.7);
      audit('I32', `Adiantamento a depositante simulado sobre depósito de ${money(500)} · disponível ${money(ad.disponivel)}`);
      render();
    };

    const pedir = root.querySelector('[data-act="ad-pedir"]');
    if (pedir) pedir.onclick = comTitular('Adiantamento a depositante', () => {
      ad.solicitado = ad.disponivel;
      const l = movimentarCC(ad.disponivel, 'Adiantamento a depositante', '072');
      if (l) l.estornavel = false;
      audit('I32', `Adiantamento a depositante de ${money(ad.disponivel)} liberado · histórico 072 · baixa automática na compensação`);
      render();
    });
  },
  onNext() {
    const ch = S.cc.chequeEspecial;
    if (!ch.contratado) audit('I32', 'Atendimento encerrado sem contratação de cheque especial');
  },
};

/* ---------------------------------------------------------------- S28
   Parâmetros, bloqueios e manutenção cadastral.                        */
SCREENS.s28 = {
  title: 'Parâmetros, bloqueios e cadastro',
  hint: 'S28 · parâmetros da conta, bloqueio de saldo e manutenção cadastral. <b>Bloqueio judicial não é desfeito pela agência</b>; administrativo, sim, com registro.',
  nextLabel: 'Concluir manutenção',
  render() {
    const cc = S.cc;
    const conta = cc.contas.find(c => c.id === cc.contaSel) || cc.contas[0];
    const pr = conta.parametros || {};

    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('key', 14)} I33 · Parâmetros e manutenção</div>
      <h1 class="h1">Manutenção da conta ${conta.id}</h1>
      <p class="lede">Parâmetros operacionais, bloqueio de saldo e situação cadastral. Toda alteração fica com autor, data e motivo.</p>

      <div class="grid grid--2">
        <div>
          <div class="card card--flush">
            <div class="card__head"><span class="card__title">Parâmetros da conta</span>
              <span class="badge badge--neutral">${Object.keys(pr).length} parâmetros</span></div>
            <div class="card__body" style="padding:0">
              <table class="table">
                <thead><tr><th>Parâmetro</th><th>Valor</th><th></th></tr></thead>
                <tbody>
                  ${Object.entries(pr).map(([k, v]) => {
                    const NOMES = {
                      limiteSaque: 'Limite de saque diário', extratoEmail: 'Extrato por e-mail',
                      tarifaPacote: 'Pacote de tarifas', avisoSaldoBaixo: 'Aviso de saldo baixo',
                      cestaServicos: 'Cesta de serviços', aniversario: 'Dia de aniversário',
                    };
                    return `
                    <tr>
                      <td><b>${NOMES[k] || k}</b><div class="tiny muted"><code>${k}</code></div></td>
                      <td>${typeof v === 'boolean'
                        ? `<span class="badge badge--${v ? 'success' : 'neutral'}">${v ? 'ativo' : 'inativo'}</span>`
                        : typeof v === 'number' && k === 'limiteSaque' ? money(v) : v}</td>
                      <td>
                        <div class="inline">
                          ${typeof v === 'boolean'
                            ? `<button class="btn btn--ghost" data-ptoggle="${k}">${ico('refresh', 14)} Alternar</button>`
                            : `<button class="btn btn--ghost" data-pedit="${k}">${ico('pen', 14)} Alterar</button>`}
                          <button class="btn btn--ghost" data-pdel="${k}">${ico('x', 14)} Excluir</button>
                        </div>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card__title mb-16">Incluir parâmetro</div>
            <div class="grid grid--2">
              <div class="field">
                <label class="field__label" for="pn-nome">Parâmetro</label>
                <select class="field__select" id="pn-nome">
                  <option value="limiteSaque">Limite de saque diário</option>
                  <option value="avisoSaldoBaixo">Aviso de saldo baixo</option>
                  <option value="extratoEmail">Extrato por e-mail</option>
                  <option value="cestaServicos">Cesta de serviços</option>
                </select>
              </div>
              <div class="field">
                <label class="field__label" for="pn-valor">Valor</label>
                <input class="field__input" id="pn-valor" placeholder="número, texto ou sim/não">
              </div>
            </div>
            <button class="btn btn--cta mt-16" data-act="pn-incluir">${ico('plus', 18)} Incluir</button>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card__head"><span class="card__title">Bloqueio de saldo</span>
              <span class="badge badge--${conta.bloqueado ? 'danger' : 'success'}">${conta.bloqueado ? money(conta.bloqueado) + ' bloqueado' : 'sem bloqueio'}</span></div>
            <div class="card__body">
              <div class="rows">
                <div class="row"><span class="row__k">Saldo total</span><span class="row__v">${money(conta.saldo)}</span></div>
                <div class="row"><span class="row__k">Bloqueado</span><span class="row__v">${money(conta.bloqueado)}</span></div>
                <div class="row"><span class="row__k">Disponível</span><span class="row__v row__v--lg">${money(conta.saldo - conta.bloqueado)}</span></div>
              </div>

              ${conta.bloqueado ? `
              <div class="note note--danger mt-16">
                <span class="note__ic">${ico('gavel', 18)}</span>
                <div><b>Bloqueio judicial de ${money(conta.bloqueado)}.</b> <span class="muted">Ordem da 2ª Vara Cível. A agência não desfaz bloqueio judicial, nem com pedido da cliente. O caminho é o processo, e informar isso é o atendimento correto.</span></div>
              </div>` : ''}

              <div class="field mt-16">
                <label class="field__label" for="bl-valor">Bloqueio administrativo</label>
                <input class="field__input" id="bl-valor" inputmode="decimal" placeholder="valor a bloquear">
                <span class="field__help">Usado em apuração de fraude ou conferência. Diferente do judicial, pode ser desfeito pela agência com registro.</span>
              </div>
              <div class="inline mt-8">
                <button class="btn btn--danger" data-act="bl-aplicar">${ico('lock', 16)} Bloquear</button>
                ${conta.bloqueioAdmin ? `<button class="btn btn--outline" data-act="bl-liberar">${ico('key', 16)} Liberar administrativo</button>` : ''}
              </div>
              ${conta.bloqueioAdmin ? `
              <div class="note note--alert mt-16">
                <span class="note__ic">${ico('alert', 18)}</span>
                <div><b>Bloqueio administrativo de ${money(conta.bloqueioAdmin)}.</b> <span class="muted">Aplicado pela agência. Pode ser liberado aqui, com motivo registrado.</span></div>
              </div>` : ''}
            </div>
          </div>

          <div class="card">
            <div class="card__head"><span class="card__title">Situação cadastral</span>
              <span class="badge badge--${conta.situacao === 'ATIVA' ? 'success' : 'alert'}">${conta.situacao === 'ATIVA' ? 'ativa' : 'paralisada'}</span></div>
            <div class="card__body">
              ${conta.situacao === 'PARALISADA' ? `
              <div class="note note--alert">
                <span class="note__ic">${ico('alert', 18)}</span>
                <div><b>${conta.motivoParalisia}.</b> <span class="muted">Conta paralisada não movimenta. A cliente pode reativar na hora ou pedir encerramento.</span></div>
              </div>
              <button class="btn btn--cta mt-16" data-act="reativar">${ico('power', 16)} Reativar conta</button>
              ` : `
              <div class="rows">
                <div class="row"><span class="row__k">Aberta em</span><span class="row__v">${parseISO(conta.abertaEm).toLocaleDateString('pt-BR')}</span></div>
                <div class="row"><span class="row__k">Tipo</span><span class="row__v">${conta.tipo === 'CORRENTE' ? 'conta corrente' : 'poupança'}</span></div>
              </div>
              <button class="btn btn--outline mt-16" data-act="alt-cadastral">${ico('pen', 16)} Alteração cadastral</button>
              `}

              <button class="btn btn--danger btn--block mt-8" data-act="encerrar"
                ${conta.saldo > 0 || conta.bloqueado ? 'disabled' : ''}>
                ${ico('xCircle', 16)} Encerrar a conta</button>
              ${conta.saldo > 0 || conta.bloqueado ? `
              <div class="note note--info mt-8">
                <span class="note__ic">${ico('info', 18)}</span>
                <div><b>Não é possível encerrar agora.</b> <span class="muted">${conta.bloqueado ? 'Há saldo bloqueado judicialmente.' : `Há ${money(conta.saldo)} na conta.`} O saldo precisa ser sacado ou transferido primeiro, porque o banco não fica com o dinheiro do cliente.</span></div>
              </div>` : ''}
              ${conta.encerramentoPedido ? `
              <div class="note note--success mt-16">
                <span class="note__ic">${ico('check', 18)}</span>
                <div><b>Encerramento protocolado.</b> <span class="muted">Protocolo ${conta.encerramentoPedido}. A conta é encerrada em até 30 dias e a cliente recebe o comprovante.</span></div>
              </div>` : ''}
            </div>
          </div>
        </div>
      </div>

      <div class="trace">
        <span class="chip chip--iface">I33</span>
        <span class="chip chip--ca">1.1.4 · 1.1.10 · 1.2.1 · 1.2.9 · 15.2.2 · 15.2.3</span>
        <span class="chip chip--norm">Res. CMN 4.753/2019 · CPC art. 854 (bloqueio judicial)</span>
      </div>
    </div>`;
  },
  bind(root) {
    const cc = S.cc;
    const conta = cc.contas.find(c => c.id === cc.contaSel) || cc.contas[0];

    root.querySelectorAll('[data-ptoggle]').forEach(b => b.onclick = () => {
      const k = b.dataset.ptoggle;
      conta.parametros[k] = !conta.parametros[k];
      audit('I33', `Parâmetro ${k} alterado para ${conta.parametros[k] ? 'ativo' : 'inativo'} na conta ${conta.id}`);
      render();
    });
    root.querySelectorAll('[data-pedit]').forEach(b => b.onclick = () => {
      const k = b.dataset.pedit;
      const atual = conta.parametros[k];
      /* Incremento simples: o objetivo é demonstrar o CRUD, não editar livre. */
      conta.parametros[k] = typeof atual === 'number' ? atual + 100 : atual;
      audit('I33', `Parâmetro ${k} alterado de ${atual} para ${conta.parametros[k]} na conta ${conta.id}`);
      render();
    });
    root.querySelectorAll('[data-pdel]').forEach(b => b.onclick = () => {
      const k = b.dataset.pdel;
      delete conta.parametros[k];
      audit('I33', `Parâmetro ${k} excluído da conta ${conta.id} · matrícula ${S.session.operatorId}`);
      render();
    });

    const inc = root.querySelector('[data-act="pn-incluir"]');
    if (inc) inc.onclick = () => {
      const k = root.querySelector('#pn-nome').value;
      const raw = root.querySelector('#pn-valor').value.trim();
      if (!raw) { audit('I33', 'Inclusão de parâmetro sem valor informado'); return; }
      let v = raw;
      if (/^(sim|s|true|ativo)$/i.test(raw)) v = true;
      else if (/^(nao|não|n|false|inativo)$/i.test(raw)) v = false;
      else if (!isNaN(Number(raw.replace(',', '.')))) v = Number(raw.replace(',', '.'));
      conta.parametros[k] = v;
      audit('I33', `Parâmetro ${k} incluído com valor ${v} na conta ${conta.id}`);
      render();
    };

    const bl = root.querySelector('[data-act="bl-aplicar"]');
    if (bl) bl.onclick = () => {
      const v = Number(String(root.querySelector('#bl-valor').value).replace(/\./g, '').replace(',', '.')) || 0;
      if (v <= 0) { audit('I33', 'Bloqueio administrativo sem valor válido'); return; }
      if (v > conta.saldo - conta.bloqueado) {
        audit('I33', `Bloqueio de ${money(v)} recusado por exceder o saldo disponível de ${money(conta.saldo - conta.bloqueado)}`);
        return;
      }
      conta.bloqueioAdmin = (conta.bloqueioAdmin || 0) + v;
      conta.bloqueado += v;
      audit('I33', `Bloqueio administrativo de ${money(v)} aplicado na conta ${conta.id} · autor ${S.session.operatorId} · motivo: apuração`);
      render();
    };

    const lib = root.querySelector('[data-act="bl-liberar"]');
    if (lib) lib.onclick = () => {
      const v = conta.bloqueioAdmin || 0;
      conta.bloqueado -= v;
      conta.bloqueioAdmin = 0;
      audit('I33', `Bloqueio administrativo de ${money(v)} liberado na conta ${conta.id} · judicial permanece intocado`);
      render();
    };

    const rt = root.querySelector('[data-act="reativar"]');
    if (rt) rt.onclick = comTitular('Reativação da conta', () => {
      conta.situacao = 'ATIVA';
      conta.motivoParalisia = null;
      audit('I33', `Conta ${conta.id} reativada a pedido da titular · voltou a movimentar`);
      render();
    });

    const alt = root.querySelector('[data-act="alt-cadastral"]');
    if (alt) alt.onclick = comTitular('Alteração cadastral', () => {
      audit('I33', `Alteração cadastral registrada na conta ${conta.id} · dados conferidos com documento apresentado`);
      alt.innerHTML = `${ico('check', 16)} Alteração registrada`;
      alt.disabled = true;
    });

    const enc = root.querySelector('[data-act="encerrar"]');
    if (enc) enc.onclick = comTitular('Encerramento da conta', () => {
      conta.encerramentoPedido = uid('ENC');
      conta.situacao = 'EM_ENCERRAMENTO';
      audit('I33', `Encerramento da conta ${conta.id} protocolado · ${conta.encerramentoPedido} · prazo de 30 dias · comprovante à titular`);
      render();
    });
  },
  onNext() {
    const c = S.cc.contas.find(x => x.id === S.cc.contaSel);
    if (c && c.bloqueado) audit('I33', `Conta ${c.id} encerra o atendimento com ${money(c.bloqueado)} bloqueado`);
  },
};
