/* ============================================================================
   Branch Assist — Servicing assistido · S00 a S06
   Escopo ampliado: atendimento a quem já é cliente, além da abertura de conta.
   O Banco pediu esse alcance; a lista final de serviços está em confirmação.
   ========================================================================== */
window.SCREENS = window.SCREENS || {};

/* Estados iniciais de S03, S05 e S06. Toda atualização parte deles, para que
   um campo não suma quando o objeto é salvo pela primeira vez. */
const PIX_PADRAO  = { key: 'CPF', phone: '(91) 98844-1207', email: '—', portability: 'PENDING' };
const MED_PADRAO  = { status: 'OPEN', value: 86.4, claim: 'COMPRA_NAO_RECONHECIDA' };
const CARD_PADRAO = { status: 'BLOCKED', reason: 'CONTESTACAO_EM_ANALISE', last4: '4417' };

/* ---------------------------------------------------------------- S00 */
SCREENS.s00 = {
  title: 'Identificação e autenticação',
  hint: 'S00 · é a reentrada no modelo de atendimento. Cliente existente, canal <b>BRANCH</b>, mesmo.device, mesmo padrão de trilha.',
  nextLabel: 'Abrir atendimento',
  render() {
    const c = S.customer;
    return `
    <div class="wrap">
      <div class="h-eyebrow">${ico('users', 14)} S00 · Abertura de atendimento</div>
      <h1 class="h1">Atendimento a cliente existente</h1>
      <p class="lede">A cliente é identificada pelo CPF. O modelo abre a visão 360º e monta o histórico de relacionamento (o mesmo que o call center consulta), sem telefone nem aplicativo.</p>

      <div class="card">
        <div class="grid grid--3">
          <div class="field span-2">
            <label class="field__label" for="s-cpf">CPF da cliente</label>
            <input class="field__input" id="s-cpf" value="${maskCpf(c.cpf)}" inputmode="numeric">
          </div>
          <div class="field">
            <label class="field__label" for="s-canal">Canal</label>
            <input class="field__input" id="s-canal" value="BRANCH (agência 0108)" readonly>
          </div>
        </div>

        <hr class="hr">

        <div class="card__title mb-16">Como a titular se autentica</div>
        <div class="choices choices--2" id="authlv">
          ${[
            ['BIOMETRIC', 'face', 'Biometria', 'Se a cliente tem biometria ativada, basta o reconhecimento.'],
            ['PIN', 'lock', 'Senha de 4 números', 'Digitada no teclado ampliado, sempre pela própria cliente.'],
            ['CARD_PIN', 'card', 'Senha do cartão', 'Para operações que exigem o cartão físico presente.'],
          ].map(([v, i, n, d]) => `
            <button class="choice" data-auth="${v}" aria-pressed="${S.srv.authLevel === v}">
              <span class="choice__ic">${ico(i, 22)}</span>
              <span><span class="choice__name">${n}</span><span class="choice__desc">${d}</span></span>
            </button>`).join('')}
        </div>
        <div class="spread mt-16">
          <p class="tiny muted mb-0">A titular se autentica agora e de novo a cada transação do atendimento, sempre pelo método escolhido. Consulta não pede senha; movimentação, contratação e alteração pedem.</p>
          ${S.srv.clientAuth.done
            ? `<span class="badge badge--success">${ico('check', 12, 3)} titular autenticada</span>`
            : `<button class="btn btn--cta" id="s00-auth" ${S.srv.authLevel ? '' : 'disabled'}>${ico('shield', 18)} Autenticar a titular</button>`}
        </div>
      </div>

      <div class="grid grid--2">
        <div class="card">
          <div class="card__title mb-16">Motivo do atendimento</div>
          <div class="rows">
            <div class="row"><span class="row__k">${ico('folder', 16)} Tipo de serviço</span><span class="row__v" id="s00-serv">${S.srv.task || '—'}</span></div>
            <div class="row"><span class="row__k">${ico('link', 16)} Abertura</span><span class="row__v">${S.visited.has('S00') ? 'nesta sessão' : 'em atendimento anterior'}</span></div>
            <div class="row"><span class="row__k">${ico('bell', 16)} Contatos registrados</span><span class="row__v">2</span></div>
          </div>
        </div>
        <div class="card">
          <div class="card__title mb-16">Serviços disponíveis nesta sessão</div>
          <div class="inline">
            <span class="chip">Saldo e extrato</span>
            <span class="chip">Comprovantes</span>
            <span class="chip">Pix</span>
            <span class="chip">Cartões</span>
            <span class="chip">Contestação</span>
            <span class="chip">Representante</span>
            <span class="chip">Renegociação</span>
            <span class="chip">Encerramento</span>
          </div>
        </div>
      </div>
    </div>`;
  },
  bind(root) {
    root.querySelectorAll('[data-auth]').forEach(b => b.onclick = () => {
      S.srv.authLevel = b.dataset.auth;
      S.srv.clientAuth = { done: false, metodo: null, em: null };
      audit('A02', `Método de autenticação da titular escolhido: ${b.dataset.auth}`);
      render();
    });
    const au = root.querySelector('#s00-auth');
    if (au) au.onclick = () => autenticarTitular('Abertura do atendimento', () => { S.srv.stepUpDone = true; render(); });
  },
  gate() {
    if (!S.srv.authLevel) return 'Escolha como a titular vai se autenticar.';
    if (!S.srv.clientAuth.done) return 'A titular precisa se autenticar antes de abrir o atendimento.';
    return null;
  },
  onNext() {
    S.srv.task = S.srv.task || 'ATENDIMENTO_GERAL';
    audit('S00', `Atendimento aberto · cliente ${maskCpf(S.customer.cpf)} · auth ${S.srv.authLevel || 'não definida'}`);
  },
};

/* ---------------------------------------------------------------- S01 */
SCREENS.s01 = {
  title: 'Visão 360º ampliada',
  hint: 'S01 · escopo ampliado do atendimento. O modelo de visão 360º é <b>de uso exclusivo do atendente</b> e nunca é espelhado para a cliente.',
  nextLabel: 'Escolher serviço',
  render() {
    const c = S.customer;
    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('eye', 14)} S01 · Customer 360</div>
      <h1 class="h1">Visão consolidada do relacionamento</h1>
      <p class="lede">Tudo que o call center sabe, em uma tela. Dados sensíveis aparecem mascarados, e cada acesso fica na trilha de auditoria com nome do atendente.</p>

      <div class="grid grid--3">
        <div class="card">
          <div class="card__title mb-16">Relacionamento</div>
          <div class="rows">
            <div class="row"><span class="row__k">${ico('user', 16)} Nome</span><span class="row__v">${c.name.split(' ').slice(0, 2).join(' ')}</span></div>
            <div class="row"><span class="row__k">${ico('card', 16)} Contas</span><span class="row__v">2 ativas</span></div>
            <div class="row"><span class="row__k">${ico('money', 16)} Saldo consolidado</span><span class="row__v">${money(saldoCC())}</span></div>
            <div class="row"><span class="row__k">${ico('chart', 16)} Risco</span><span class="row__v">Baixo</span></div>
            <div class="row"><span class="row__k">${ico('bell', 16)} Contatos em 90 dias</span><span class="row__v">2</span></div>
          </div>
        </div>
        <div class="card">
          <div class="card__title mb-16">Cartao de crédito</div>
          <div class="rows">
            <div class="row"><span class="row__k">${ico('card', 16)} Produto</span><span class="row__v">final 4417</span></div>
            <div class="row"><span class="row__k">${ico('wallet', 16)} Limite</span><span class="row__v">${money(3200)}</span></div>
            <div class="row"><span class="row__k">${ico('money', 16)} Fatura em aberto</span><span class="row__v">${money(412.55)}</span></div>
            <div class="row"><span class="row__k">${ico('clock', 16)} Vencimento</span><span class="row__v">dia 12</span></div>
            <div class="row"><span class="row__k">${ico('lock', 16)} Status</span><span class="row__v">${ico('lock', 14)} bloqueado</span></div>
          </div>
        </div>
        <div class="card">
          <div class="card__title mb-16">Situações que restringem</div>
          <div class="stack">
            <div class="note note--danger"><span class="note__ic">${ico('gavel', 18)}</span>
              <div><b>Cartão bloqueado por suspeita.</b> <span class="muted">Origem: contestação de compra em análise (S07).</span></div></div>
            <div class="note note--alert"><span class="note__ic">${ico('users', 18)}</span>
              <div><b>Procurador com poderes vigentes.</b> <span class="muted">Consultar antes de qualquer movimentação (S08).</span></div></div>
          </div>
        </div>
      </div>

      <div class="card card--flush">
        <div class="card__head">
          <span class="card__title">O que a cliente pediu</span>
          <span class="badge badge--brand">motivo registrado</span>
        </div>
        <div class="card__body">
          <p class="p mb-0">“${S.srv.request || 'Não consigo usar o cartão queCancelaram. E também quero ver o extrato do mês passado para conferir um-benefit.'}</p>
          <div class="trace">
            <span class="chip chip--iface">I01 · I09</span>
            <span class="chip chip--gap">escopo ampliado</span>
            <span class="chip chip--norm">NFR-05 · segregação de função</span>
          </div>
        </div>
      </div>

      <div class="card__title mb-16">Serviços desta sessão</div>
      <div class="grid grid--3">
        ${[
          ['s02', 'wallet', 'Saldo e extrato', 'Cliente sozinha no tablet'],
          ['s03', 'pix', 'Chaves Pix', 'Inclui portabilidade'],
          ['s04', 'swap', 'Transferência', 'Pix e TED'],
          ['s05', 'refresh', 'Devolução e MED', 'Análise do atendente'],
          ['s06', 'card', 'Cartões', 'Senha, bloqueio, 2ª via'],
          ['s07', 'alert', 'Contestação', 'Fraude e chargeback'],
        ].map(([id, i, n, d]) => `
          <button class="choice" data-go="${id}">
            <span class="choice__ic">${ico(i, 22)}</span>
            <span><span class="choice__name">${n}</span><span class="choice__desc">${d}</span></span>
          </button>`).join('')}
      </div>
    </div>`;
  },
  bind(root) {
    root.querySelectorAll('[data-go]').forEach(b => b.onclick = () => {
      S.idx = STEPS_SRV.findIndex(s => s.id === b.dataset.go.toUpperCase());
      audit('I09', `Serviço selecionado: ${STEPS_SRV[S.idx].label}`);
      render();
    });
  },
  onNext() { audit('I09', 'Visão 360º consultada pelo atendente'); },
};

/* ---------------------------------------------------------------- S02 */
SCREENS.s02 = {
  title: 'Saldo, extrato e comprovantes',
  hint: 'S02 · modo cliente. Números grandes, poucas palavras e <b>nenhuma transação autorizada aqui</b>: este módulo é só de leitura.',
  nextLabel: 'Continuar',
  render() {
    return `
    <div class="cust" style="max-width:760px">
      <div class="cust__task">${ico('eye', 16)} Só para você · não é uma transação</div>
      <h1 class="cust__title">Seu dinheiro</h1>
      <p class="cust__sub">Aqui você só olha. Nada sai da sua conta sem você apertar o botão e confirmar com sua senha.</p>

      <div class="card" style="text-align:left">
        <div class="card__head">
          <span class="card__title">Conta corrente</span>
          <span class="badge badge--brand">${S.onb.account.number || 'final 8842'}</span>
        </div>
        <div class="card__body">
          <div class="center" style="padding:var(--sp-16) 0">
            <div class="tiny muted" style="text-transform:uppercase;letter-spacing:.06em">Saldo disponível</div>
            <div style="font-family:var(--ff-secondary);font-size:var(--fs-5xl);font-weight:var(--fw-bold);color:var(--c-verde-escuro-2)">${money(saldoCC())}</div>
          </div>
          <div class="rows">
            <div class="row"><span class="row__k">${ico('lock', 16)} Rendido até ontem</span><span class="row__v">${money(38.12)}</span></div>
            <div class="row"><span class="row__k">${ico('money', 16)} Valor bloqueado</span><span class="row__v">${money(120.00)}</span></div>
            <div class="row"><span class="row__k">${ico('swap', 16)} Entrou este mês</span><span class="row__v">${money(2151.00)}</span></div>
            <div class="row"><span class="row__k">${ico('swap', 16)} Saiu este mês</span><span class="row__v">${money(903.20)}</span></div>
          </div>
        </div>
      </div>

      <div class="card card--flush" style="text-align:left">
        <div class="card__head">
          <span class="card__title">Últimos movimentos</span>
          <div class="inline">
            <button class="btn btn--ghost" data-audio="extrato">${ico('speaker', 18)} Ouvir</button>
            <button class="btn btn--ghost" data-print="extrato">${ico('print', 18)} Imprimir</button>
          </div>
        </div>
        <div class="card__body" style="padding:0">
          <table class="table">
            <thead><tr><th>Data</th><th>Descrição</th><th style="text-align:right">Valor</th></tr></thead>
            <tbody>
              ${[
                ['24/mai', 'Aposentadoria INSS', '+ 1.518,00'],
                ['24/mai', 'Pagamento farmácia', '- 86,40'],
                ['22/mai', 'Transferência recebida', '+ 700,00'],
                ['20/mai', 'Conta de luz', '- 148,90'],
                ['18/mai', 'Supermercado', '- 232,15'],
                ['15/mai', 'Benefício do INSS', '+ 1.518,00'],
              ].map(([d, t, v]) => `
                <tr><td>${d}</td><td>${t}</td>
                <td style="text-align:right;font-weight:600;color:${v.startsWith('+') ? 'var(--tx-success)' : 'var(--tx-default)'}">${v}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="note note--info" style="text-align:left">
        <span class="note__ic">${ico('info', 18)}</span>
        <div><b>Mês fechado, sem cortes.</b> <span class="muted">Extratos de meses anteriores podem ser reimpressos pela atendente em até 5 anos, conforme regra de guarda de documentos.</span></div>
      </div>
      <div class="trace" style="justify-content:flex-start">
        <span class="chip chip--iface">I10</span>
        <span class="chip chip--ca">1.1.7 · 1.1.74.7 · 15.32.1</span>
        <span class="chip chip--norm">Res. CMN 4.753/2019 · art. 4º, XII</span>
      </div>
    </div>`;
  },
  bind(root) {
    /* Lê o extrato que está na tela, linha a linha, com os valores por extenso
       em reais — é a forma de a titular conferir sem depender de enxergar. */
    const linhas = [...root.querySelectorAll('.table tbody tr')].map(tr => {
      const [d, t, v] = [...tr.children].map(td => td.textContent.trim());
      const sinal = v.startsWith('+') ? 'entrada de' : 'saída de';
      return `${d}, ${t}, ${sinal} ${v.replace(/^[+-]\s*/, '').replace(',', ' reais e ')} centavos.`;
    });
    const saldoEl = root.querySelector('.row__v--lg') || root.querySelector('[style*="fs-5xl"]');
    const roteiro = [
      'Extrato da sua conta.',
      saldoEl ? `Saldo atual: ${saldoEl.textContent.trim()}.` : '',
      `Últimos ${linhas.length} movimentos.`,
      ...linhas,
      'Fim do extrato. Se quiser, a atendente pode imprimir esta lista para você levar.',
    ].filter(Boolean).join(' ');

    ligarAudio(root.querySelector('[data-audio="extrato"]'), roteiro, 'I10',
               'Extrato lido em voz alta para a titular');

    const pr = root.querySelector('[data-print]');
    if (pr) pr.onclick = () => audit('I10', 'Extrato impresso a pedido da cliente');
  },
  onNext() { audit('I10', 'Consulta de saldo e extrato concluída em modo cliente'); },
};

/* ---------------------------------------------------------------- S03 */
SCREENS.s03 = {
  title: 'Chaves Pix e portabilidade',
  hint: 'S03 · escopo ampliado do atendimento. Portabilidade é <b>direito da cliente</b>: recusa exige motivo registrado e a cliente sai com o protocolo.',
  nextLabel: 'Confirmar',
  render() {
    const P = { ...PIX_PADRAO, ...(S.srv.pix || {}) };
    return `
    <div class="cust" style="max-width:800px">
      <div class="cust__task">${ico('pix', 16)} Só para você</div>
      <h1 class="cust__title">Suas chaves Pix</h1>
      <p class="cust__sub">Você pode trazer sua chave de outro banco. É um direito seu, e a atendente não pode recusar sem te dar um motivo por escrito.</p>

      <div class="stack" style="text-align:left">
        ${[
          ['CPF', 'CPF', true, 'chave principal desta conta'],
          ['Telefone', P.phone, true, 'chave ativa desde mar/2026'],
          ['E-mail', P.email, false, 'chave não cadastrada'],
        ].map(([t, v, on, d]) => `
          <div class="purpose" data-granted="${on}">
            <div class="spread">
              <div style="flex:1">
                <div class="purpose__name">${t} <span class="tiny muted">· ${v}</span></div>
                <div class="tiny muted" style="margin-top:4px">${d}</div>
              </div>
              <span class="badge badge--${on ? 'success' : 'neutral'}">${on ? 'ativa' : 'inativa'}</span>
            </div>
          </div>`).join('')}
      </div>

      <div class="card" style="text-align:left">
        <div class="card__head">
          <span class="card__title">Trazer chave de outro banco</span>
          <span class="badge badge--alert">portabilidade</span>
        </div>
        <div class="card__body">
          <p class="p">Informe o CPF ou celular vinculado à chave no banco de origem. A transferência é instantânea e gratuita para você.</p>
          <div class="field">
            <label class="field__label" for="px-orig">Chave no banco de origem</label>
            <input class="field__input" id="px-orig" placeholder="CPF, celular ou e-mail" inputmode="email">
            <span class="field__help">O sistema confirma a titularidade da chave no banco de origem antes de trazer.</span>
          </div>
          <div class="note note--alert mt-16">
            <span class="note__ic">${ico('alert', 18)}</span>
            <div><b>Se a portabilidade for recusada.</b> <span class="muted">A cliente recebe o motivo por escrito e o protocolo de contestação. Recusa sem justificativa registrada não é permitida.</span></div>
          </div>
          <div class="mt-16">
            <button class="btn btn--cta btn--lg btn--block" data-px="trazer">${ico('download', 18)} Trazer minha chave</button>
          </div>
        </div>
      </div>
      <div class="trace" style="justify-content:flex-start">
        <span class="chip chip--iface">I11</span>
        <span class="chip chip--gap">escopo ampliado</span>
        <span class="chip chip--norm">Res. BCB 1/2020 · art. 6º</span>
      </div>
    </div>`;
  },
  bind(root) {
    const b = root.querySelector('[data-px]');
    if (b) b.onclick = comTitular('Portabilidade da chave Pix', () => {
      const v = root.querySelector('#px-orig').value.trim() || 'CPF 154.220.877-41';
      S.srv.pix = { ...PIX_PADRAO, ...(S.srv.pix || {}), key: 'CPF', portability: 'DONE', imported: v };
      audit('I11', `Chave Pix portada de ${v} · titularidade confirmada no banco de origem`);
      render();
    });
  },
  onNext() { audit('I11', 'Chaves Pix revisadas com a cliente'); },
};

/* ---------------------------------------------------------------- S04 */
SCREENS.s04 = {
  title: 'Transferência Pix e TED',
  hint: 'S04 · modo cliente. Autorização por <b>step-up</b> com a senha, e confirmação lida em voz alta para cliente que não lê o valor na tela.',
  nextLabel: 'Executar',
  render() {
    const a = S.srv.transfer || { to: '', value: '', method: 'PIX', confirmed: false };
    return `
    <div class="cust" style="max-width:800px">
      <div class="cust__task">${ico('swap', 16)} Só para você · transação</div>
      <h1 class="cust__title">Transferir dinheiro</h1>
      <p class="cust__sub">Confira com calma. Ao final, a atendente vai ler tudo em voz alta antes de você autorizar com a sua senha.</p>

      <div class="card" style="text-align:left">
        <div class="card__body">
          <div class="grid grid--2">
            <div class="field">
              <label class="field__label" for="tr-to">Para quem</label>
              <input class="field__input" id="tr-to" value="${a.to}" placeholder="CPF, celular ou chave">
            </div>
            <div class="field">
              <label class="field__label" for="tr-val">Quanto</label>
              <input class="field__input" id="tr-val" value="${a.value}" inputmode="decimal" placeholder="0,00">
            </div>
          </div>
          <div class="field mt-16">
            <label class="field__label">Como</label>
            <div class="inline">
              <button class="choice" data-tm="PIX" aria-pressed="${a.method === 'PIX'}" style="width:auto;flex:1"><span class="choice__ic">${ico('pix', 20)}</span><span class="choice__name">Pix</span><span class="choice__desc">chega na hora</span></button>
              <button class="choice" data-tm="TED" aria-pressed="${a.method === 'TED'}" style="width:auto;flex:1"><span class="choice__ic">${ico('bank', 20)}</span><span class="choice__name">TED</span><span class="choice__desc">dia seguinte</span></button>
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="text-align:left">
        <div class="card__head">
          <span class="card__title">Resumo para confirmação</span>
          <span class="badge badge--brand">será lido em voz alta</span>
        </div>
        <div class="card__body">
          <div class="rows">
            <div class="row"><span class="row__k">Destinatário</span><span class="row__v">${a.to || '—'}</span></div>
            <div class="row"><span class="row__k">Valor</span><span class="row__v row__v--lg">${a.value ? money(a.value) : '—'}</span></div>
            <div class="row"><span class="row__k">Forma</span><span class="row__v">${a.method === 'PIX' ? 'Pix (instantâneo)' : 'TED (próximo dia útil)'}</span></div>
            <div class="row"><span class="row__k">Tarifa</span><span class="row__v">gratuita para pessoa física</span></div>
            <div class="row"><span class="row__k">Saldos após</span><span class="row__v">${a.value ? money(saldoCC() - Number(a.value)) : '—'}</span></div>
          </div>
          <div class="note note--info mt-16">
            <span class="note__ic">${ico('speaker', 18)}</span>
            <div><b>Confirmação falada.</b> <span class="muted">Destinatário, valor e saldo restante são lidos em voz alta. Para cliente com baixa visão, isso é o que garante consentimento informado: o valor nunca depende só da leitura da tela.</span></div>
          </div>
          ${a.to && a.value ? blocoAutorizacao('S04', 'A transferência') : ''}
        </div>
      </div>
      <div class="trace" style="justify-content:flex-start">
        <span class="chip chip--iface">I12</span>
        <span class="chip chip--ca">14.7.7 · 15.5.1 · 15.5.3</span>
        <span class="chip chip--norm">Res. BCB 1/2020 · LGPD art. 8º</span>
      </div>
    </div>`;
  },
  bind(root) {
    const to = root.querySelector('#tr-to'), val = root.querySelector('#tr-val');
    const save = () => { S.srv.authTx.S04 = false; S.srv.transfer = { ...(S.srv.transfer || {}), to: to.value, value: val.value.replace(/\D/g, ''), method: (S.srv.transfer || {}).method || 'PIX' }; render(); };
    to.oninput = save; val.oninput = save;
    root.querySelectorAll('[data-tm]').forEach(b => b.onclick = () => { S.srv.transfer = { ...(S.srv.transfer || {}), method: b.dataset.tm }; render(); });
  },
  gate() {
    const a = S.srv.transfer || {};
    return a.to && a.value && !S.srv.authTx.S04 ? 'Falta a titular autorizar a transferência com a senha.' : null;
  },
  onNext() {
    const a = S.srv.transfer || {};
    if (a.to && a.value) {
      audit('A02', `Transferência ${a.method} de ${money(a.value)} para ${a.to} autorizada pela titular com step-up`);
      audit('I12', 'Comprovante de transferência emitido e entregue à cliente');
    }
  },
};

/* ---------------------------------------------------------------- S05 */
SCREENS.s05 = {
  title: 'Devolução Pix e MED',
  hint: 'S05 · escopo ampliado do atendimento. <b>MED</b> (Mecanismo Especial de Devolução) tem prazo, protocolo e é irreversível: exige leitura explícita das consequências.',
  nextLabel: 'Encerrar análise',
  render() {
    const m = { ...MED_PADRAO, ...(S.srv.med || {}) };
    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('refresh', 14)} S05 · MED e devoluções</div>
      <h1 class="h1">Devolução de valor contestado</h1>
      <p class="lede">O MED é a ferramenta do Banco Central para devolver dinheiro em caso de recebimento irregular. A devolução é <b>irreversível</b> e só pode ser feita com autorização explícita e registrada.</p>

      <div class="grid grid--2">
        <div class="card">
          <div class="card__head">
            <span class="card__title">Reclamação em aberto</span>
            <span class="badge badge--alert">${m.claim.replace(/_/g, ' ').toLowerCase()}</span>
          </div>
          <div class="card__body">
            <div class="rows">
              <div class="row"><span class="row__k">Valor</span><span class="row__v row__v--lg">${money(m.value)}</span></div>
              <div class="row"><span class="row__k">Recebedor original</span><span class="row__v">comercio não identificado</span></div>
              <div class="row"><span class="row__k">Data do Pix</span><span class="row__v">22/mai/2026</span></div>
              <div class="row"><span class="row__k">Prazo para devolução</span><span class="row__v">até 10 dias corridos</span></div>
              <div class="row"><span class="row__k">Protocolo MED</span><span class="row__v">${uid('MED')}</span></div>
            </div>
            <div class="note note--danger mt-16">
              <span class="note__ic">${ico('alert', 18)}</span>
              <div><b>A devolução tira o dinheiro de um terceiro.</b> <span class="muted">Se a transação contestada for legítima, o valor volta para a cliente e a instituição de destino abre contestação própria. Isso é explicado antes da autorização, não depois.</span></div>
            </div>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card__title mb-16">Fluxo de tratamento</div>
            <div class="stack">
              <div class="note note--info"><span class="note__ic">${ico('search', 18)}</span><div><b>1. Recolher a contestação</b><br><span class="muted">com relato da cliente e protocolo de abertura.</span></div></div>
              <div class="note note--info"><span class="note__ic">${ico('file', 18)}</span><div><b>2. Registrar a devolução no MED</b><br><span class="muted">com o identificador do Pix original.</span></div></div>
              <div class="note note--info"><span class="note__ic">${ico('gavel', 18)}</span><div><b>3. Notificar o recebedor</b><br><span class="muted">com a execuÃ§Ã£o do valor devolvido.</span></div></div>
              <div class="note note--alert"><span class="note__ic">${ico('scale', 18)}</span><div><b>4. Análise de compliance</b><br><span class="muted">recorrência vira caso de fraude, não de reclamação.</span></div></div>
            </div>
          </div>
          <div class="card">
            <div class="card__title mb-16">Autorização</div>
            <div class="stack">
              <div class="toggle mt-0">
                <div class="toggle__txt"><div class="toggle__name">Ciente de que a devolução é definitiva</div>
                <div class="toggle__desc">A cliente confirma que entende o efeito sobre o recebedor.</div></div>
                <button class="switch" role="switch" aria-checked="${!!S.srv.medAck}" data-flag="medAck"></button>
              </div>
              <button class="btn btn--danger btn--block" data-med="confirm" ${S.srv.medAck ? '' : 'disabled'}>
                ${ico('refresh', 18)} Autorizar devolução de ${money(m.value)}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="trace">
        <span class="chip chip--iface">I13</span>
        <span class="chip chip--gap">escopo ampliado</span>
        <span class="chip chip--norm">Res. BCB 1/2020 · Res. BCB 103/2021 (MED)</span>
      </div>
    </div>`;
  },
  bind(root) {
    const b = root.querySelector('[data-med]');
    if (b) b.onclick = comTitular('Pedido de devolução pelo MED', () => {
      S.srv.med = { ...MED_PADRAO, ...(S.srv.med || {}), status: 'RETURNED' };
      audit('I13', `Devolução MED de ${money(S.srv.med.value || 0)} registrada · irreversível · recebedor notificado`);
      render();
    });
  },
  onNext() { audit('I13', 'Análise de devolução concluída'); },
};

/* ---------------------------------------------------------------- S06 */
SCREENS.s06 = {
  title: 'Cartões: senha, bloqueio e 2ª via',
  hint: 'S06 · modo cliente para senha e desbloqueio. <b>Motivo do bloqueio é sempre exibido</b>: cartão nunca some da vista da cliente sem explicação.',
  nextLabel: 'Continuar',
  render() {
    const c = { ...CARD_PADRAO, ...(S.srv.card || {}) };
    return `
    <div class="cust" style="max-width:800px">
      <div class="cust__task">${ico('card', 16)} Só para você</div>
      <h1 class="cust__title">Seu cartão</h1>
      <p class="cust__sub">O cartão de crédito termina em ${c.last4}. Ele está bloqueado, e o motivo está escrito logo abaixo.</p>

      <div class="card" style="text-align:left">
        <div class="spread">
          <div class="inline">
            <span class="choice__ic">${ico('card', 26)}</span>
            <div>
              <div style="font-weight:var(--fw-semibold)">Crédito · final ${c.last4}</div>
              <div class="tiny muted">limite ${money(3200)} · fatura ${money(412.55)} · vence dia 12</div>
            </div>
          </div>
          <span class="badge badge--danger">${c.status === 'BLOCKED' ? 'bloqueado' : 'ativo'}</span>
        </div>
        <hr class="hr">
        <div class="note note--danger">
          <span class="note__ic">${ico('alert', 18)}</span>
          <div><b>Motivo do bloqueio.</b> <span class="muted">${c.reason === 'CONTESTACAO_EM_ANALISE' ? 'Uma compra foi contestada e está em análise. O bloqueio é uma proteção para você.' : 'Solicitado por você no atendimento anterior.'} <strong>Este cartão é seu</strong>, e o atendente pode liberá-lo se não houver contestação aberta.</span></div>
        </div>
        <div class="rows">
          <div class="row"><span class="row__k">${ico('shield', 16)} Compras online</span><span class="row__v">bloqueadas até liberar</span></div>
          <div class="row"><span class="row__k">${ico('refresh', 16)} Saque</span><span class="row__v">bloqueado</span></div>
          <div class="row"><span class="row__k">${ico('print', 16)} 2ª via</span><span class="row__v">gratuita em internet para cliente pessoa fÃ­sica</span></div>
        </div>
      </div>

      <div class="grid grid--2" style="text-align:left">
        <button class="btn btn--outline btn--lg btn--block" data-card="unblock">${ico('check', 18)} Desbloquear cartão</button>
        <button class="btn btn--outline btn--lg btn--block" data-card="second">${ico('print', 18)} Pedir 2ª via</button>
      </div>

      <div class="note note--info mt-16" style="text-align:left">
        <span class="note__ic">${ico('info', 18)}</span>
        <div><b>Senha do cartão é sua.</b> <span class="muted">Se você já esqueceu, não é problema: o atendente emite uma senha provisória e você troca na primeira compra.</span></div>
      </div>
      <div class="trace" style="justify-content:flex-start">
        <span class="chip chip--iface">I14</span>
        <span class="chip chip--ca">14.4.2 · 15.27.3 · 15.27.6</span>
        <span class="chip chip--norm">Res. CMN 4.753/2019</span>
      </div>
    </div>`;
  },
  bind(root) {
    root.querySelectorAll('[data-card]').forEach(b => b.onclick = comTitular('Serviço no cartão', () => {
      if (b.dataset.card === 'unblock') {
        S.srv.card = { ...CARD_PADRAO, ...(S.srv.card || {}), status: 'ACTIVE' };
        audit('I14', 'Cartão de crédito desbloqueado a pedido da cliente');
      } else {
        audit('I14', 'Segunda via de cartão solicitada, isenta de tarifa para cliente pessoa física');
      }
      render();
    }));
  },
  onNext() { audit('I14', 'Atendimento de cartão concluído'); },
};
