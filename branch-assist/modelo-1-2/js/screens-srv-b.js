/* ============================================================================
   Branch Assist — Servicing assistido · S07 a S12
   ========================================================================== */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- S07 */
SCREENS.s07 = {
  title: 'Contestação de compra e fraude',
  hint: 'S07 · escopo ampliado do atendimento. Contestação de compra é <b>trabalho de equipe</b>, não fila de atendente: o SLA é do caso, não do balcão.',
  nextLabel: 'Registrar e encaminhar',
  render() {
    const f = S.srv.fraud || { stage: 'REPORT' };
    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('alert', 14)} S07 · Contestação e fraude</div>
      <h1 class="h1">Contestação de compra</h1>
      <p class="lede">A cliente conta o que aconteceu. O atendente registra, recolhe os dados e encaminha. O cartão fica bloqueado durante a análise. Isso é proteção para ela, e ela precisa entender isso.</p>

      <div class="grid grid--2">
        <div class="card">
          <div class="card__head">
            <span class="card__title">Compra contestada</span>
            <span class="badge badge--danger">não reconhecida</span>
          </div>
          <div class="card__body">
            <div class="rows">
              <div class="row"><span class="row__k">${ico('card', 16)} Estabelecimento</span><span class="row__v">loja não identificada</span></div>
              <div class="row"><span class="row__k">${ico('money', 16)} Valor</span><span class="row__v row__v--lg">${money(748.90)}</span></div>
              <div class="row"><span class="row__k">${ico('clock', 16)} Data</span><span class="row__v">23/mai/2026, 21h40</span></div>
              <div class="row"><span class="row__k">${ico('scan', 16)} Geolocalização</span><span class="row__v">fora da cidade da cliente</span></div>
              <div class="row"><span class="row__k">${ico('scale', 16)} Sinais de risco</span><span class="row__v">3 indicativos</span></div>
            </div>
            <div class="note note--danger mt-16">
              <span class="note__ic">${ico('alert', 18)}</span>
              <div><b>Enquanto durar a análise, o cartão fica bloqueado.</b> <span class="muted">A cliente precisa ouvir isso da atendente, em voz alta, e não descobrir depois. A contraprova também é alternativa, se ela preferir não aceitar o bloqueio.</span></div>
            </div>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card__title mb-16">Coleta do relato</div>
            <div class="grid">
              <div class="field">
                <label class="field__label" for="f-rel">Relato da cliente</label>
                <textarea class="field__input" id="f-rel" rows="3">Nunca fiz essa compra. Estou em casa, no horário do almoço.</textarea>
              </div>
              <div class="field">
                <label class="field__label" for="f-tipo">Classificação</label>
                <select class="field__select" id="f-tipo">
                  <option>Compra não reconhecida</option>
                  <option>Produto não recebido</option>
                  <option>Valor cobrado diferente</option>
                  <option>Assinamento não cancelada</option>
                </select>
              </div>
              <div class="field">
                <label class="field__label" for="f-contato">Contato para retorno</label>
                <input class="field__input" id="f-contato" value="sem telefone, retorno por carta ou no balcão">
                <span class="field__help">Sem celular registrado, o retorno é presencial ou por correspondência. A ausência de telefone não atrasa o caso.</span>
              </div>
            </div>
            ${blocoAutorizacao('S07', 'A contestação')}
          </div>
          <div class="card">
            <div class="card__title mb-16">Encaminhamento</div>
            <div class="rows">
              <div class="row"><span class="row__k">Fila</span><span class="row__v">Fraude (análise especializada)</span></div>
              <div class="row"><span class="row__k">SLA</span><span class="row__v">5 dias úteis para resposta</span></div>
              <div class="row"><span class="row__k">Comprovante para a cliente</span><span class="row__v">impresso no encerramento</span></div>
              <div class="row"><span class="row__k">Estorno provisório</span><span class="row__v">${f.stage === 'REPORT' ? 'a analisar' : 'realizado'}</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="trace">
        <span class="chip chip--iface">I15</span>
        <span class="chip chip--gap">escopo ampliado</span>
        <span class="chip chip--norm">Lei 8.078/1990 (CDC) · Res. CMN 4.539/2016</span>
      </div>
    </div>`;
  },
  gate() {
    return S.srv.authTx.S07 ? null : 'A contestação só é aberta com a autenticação da titular.';
  },
  onNext() {
    S.srv.fraud = { ...(S.srv.fraud || {}), stage: 'ESCALATED' };
    audit('I15', `Contestação aberta · ${uid('CSX')} · encaminhada para a fila de fraude · cartão bloqueado`);
  },
};

/* ---------------------------------------------------------------- S08 */
SCREENS.s08 = {
  title: 'Procurador e representante legal',
  hint: 'S08 · escopo ampliado do atendimento. <b>Toda movimentação em nome de terceiro exige documento legal</b> e fica com o escopo do poder declarado.',
  nextLabel: 'Concluir',
  render() {
    const r = S.srv.rep || { status: 'VERIFIED', scope: 'RECEBER_E_MOVIMENTAR', since: '2024-08-01' };
    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('users', 14)} S08 · Representação legal</div>
      <h1 class="h1">Procurador e representante legal</h1>
      <p class="lede">Representar outra pessoa em banco é atividade de risco: o sistema exige o instrumento, confere a vigência e mostra exatamente o que o procurador pode fazer.</p>

      <div class="grid grid--2">
        <div class="card">
          <div class="card__head">
            <span class="card__title">Procurador da cliente</span>
            <span class="badge badge--success">${r.status === 'VERIFIED' ? 'verificado' : 'em análise'}</span>
          </div>
          <div class="card__body">
            <div class="rows">
              <div class="row"><span class="row__k">${ico('user', 16)} Nome</span><span class="row__v">Neto da cliente</span></div>
              <div class="row"><span class="row__k">${ico('card', 16)} CPF</span><span class="row__v">${maskCpf('041.882.910-12')}</span></div>
              <div class="row"><span class="row__k">${ico('file', 16)} Instrumento</span><span class="row__v">procuração pública, 1ª via</span></div>
              <div class="row"><span class="row__k">${ico('clock', 16)} Vigência</span><span class="row__v">desde ${r.since}</span></div>
              <div class="row"><span class="row__k">${ico('key', 16)} Poder declarado</span><span class="row__v">${r.scope.replace(/_/g, ' ').toLowerCase()}</span></div>
              <div class="row"><span class="row__k">${ico('xCircle', 16)} Poder <b>não</b> incluído</span><span class="row__v">empréstimo, portabilidade de chave</span></div>
            </div>
            <div class="note note--alert mt-16">
              <span class="note__ic">${ico('alert', 18)}</span>
              <div><b>Poder nãoinclude o que não está escrito.</b> <span class="muted">Se a procuração é para receber, o procurador não pode transferir. O erro aqui é dinheiro que sai sem a pessoa presente e sem base legal.</span></div>
            </div>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card__title mb-16">Movimentação em nome de terceiro</div>
            <div class="stack">
              <div class="note note--info"><span class="note__ic">${ico('check', 18)}</span>
                <div><b>Permitida com instrumento verificado.</b> <span class="muted">Saque, transferência e pagamento de contas dentro do escopo declarado.</span></div></div>
              <div class="note note--danger"><span class="note__ic">${ico('x', 18)}</span>
                <div><b>Bloqueada sem instrumento.</b> <span class="muted">Sem procuração registrada, o pedido é recusado com protocolo e a cliente é informada do que precisa trazer.</span></div></div>
              <div class="note note--danger"><span class="note__ic">${ico('x', 18)}</span>
                <div><b>Credenciais do procurador não substituem a procuração.</b> <span class="muted">Ter senha do outro não autoriza a agir em nome de quem não deu esse poder por escrito.</span></div></div>
            </div>
          </div>
          <div class="card">
            <div class="card__title mb-16">Cliente sem capacidade plena</div>
            <div class="p tiny">Curatela, incapacidade declarada judicialmente ou idoso em situação de vulnerabilidade têm fluxo próprio, com curador ou responsável legal identificado e registrado. A relaÃ§Ã£o com o banco só nasce com esse vínculo documentado.</div>
            <div class="inline">
              <span class="badge badge--neutral">não se aplica a esta cliente</span>
            </div>
          </div>
        </div>
      </div>
      <div class="trace">
        <span class="chip chip--iface">I16</span>
        <span class="chip chip--gap">escopo ampliado</span>
        <span class="chip chip--norm">MP 2.200-2/2001 · Lei 10.741/2003</span>
      </div>
    </div>`;
  },
  onNext() { audit('I16', 'Representação legal conferida · escopo de poderes validado'); },
};

/* ---------------------------------------------------------------- S09 */
SCREENS.s09 = {
  title: 'Bloqueio judicial e restrições',
  hint: 'S09 · escopo ampliado do atendimento. Bloqueio judicial <b>não pode ser digo nem desfeito pelo atendente</b>. O que ele pode é informar e encaminhar.',
  nextLabel: 'Concluir',
  render() {
    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('gavel', 14)} S09 · Bloqueio judicial</div>
      <h1 class="h1">Restrições e ordens judiciais</h1>
      <p class="lede">Bloqueio judicial é uma ordem da Justiça, e a agência apenas cumpre. Nenhuma tela deste modelo oferece botão de desbloqueio, e isso é proposital.</p>

      <div class="grid grid--2">
        <div class="card">
          <div class="card__head">
            <span class="card__title">Bloqueios vigentes</span>
            <span class="badge badge--danger">2 ativos</span>
          </div>
          <div class="card__body" style="padding:0">
            <table class="table">
              <thead><tr><th>Origem</th><th>Alcance</th><th>Situação</th></tr></thead>
              <tbody>
                <tr><td>Judicial (2ª Vara Cível)</td><td>Conta corrente 8842</td><td><span class="badge badge--danger">bloqueada</span></td></tr>
                <tr><td>Reclamação de cartão</td><td>Cartão de crédito</td><td><span class="badge badge--alert">em análise</span></td></tr>
                <tr><td>Bloqueio BACEN (SVS)</td><td>nenhum</td><td><span class="badge badge--success">livre</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div class="card">
            <div class="card__title mb-16">O que o modelo permite</div>
            <div class="stack">
              <div class="note note--success"><span class="note__ic">${ico('check', 18)}</span><div><b>Informar</b> a cliente que existe bloqueio, com origem e alcance.</div></div>
              <div class="note note--success"><span class="note__ic">${ico('check', 18)}</span><div><b>Encaminhar</b> para o jurídico com protocolo e os dados da ordem.</div></div>
              <div class="note note--success"><span class="note__ic">${ico('check', 18)}</span><div><b>Oferecer alternativa</b>: conta em outro banco, se a cliente quiser.</div></div>
              <div class="note note--danger"><span class="note__ic">${ico('x', 18)}</span><div><b>Não desbloquear.</b> <span class="muted">Nenhum perfil de atendente, nem supervisor, tem essa função no sistema.</span></div></div>
            </div>
          </div>
          <div class="note note--info">
            <span class="note__ic">${ico('info', 18)}</span>
            <div><b>Terceiro bloqueado não vira cliente perdido.</b> <span class="muted">Quando o bloqueio é de terceiro, a oferta de outra instituição é real e feita com transparência de custos, sem esconder a tarifa para depois.</span></div>
          </div>
        </div>
      </div>
      <div class="trace">
        <span class="chip chip--iface">I17</span>
        <span class="chip chip--gap">escopo ampliado</span>
        <span class="chip chip--norm">CPC art. 854 (bloqueio judicial)</span>
      </div>
    </div>`;
  },
  onNext() { audit('I17', 'Restrições verificadas e cliente informada · encaminhamento ao jurídico registrado'); },
};

/* ---------------------------------------------------------------- S10 */
SCREENS.s10 = {
  title: 'Motor de alçadas e exceções',
  hint: 'S10 · escopo ampliado do atendimento. <b>Alçada é o que impede o atendente de fechar o que não pode.</b> Sem isso, tudo é tarde na prática.',
  nextLabel: 'Simular decisão',
  render() {
    const d = S.srv.decision || null;
    const cases = [
      ['Conta com PEP identificado', 'Aprovação de supervisor + Compliance', 'alert'],
      ['Limite acima de R$ 5.000', 'Aprovação de supervisor', 'info'],
      ['Contestação acima de R$ 500', 'Fraude (análise especializada)', 'alert'],
      ['Desbloqueio de conta com sinal de fraude', 'Compliance (proibido no balcão)', 'danger'],
      ['Conta de terceiro menor de 16 anos', 'Supervisor + responsável legal', 'danger'],
    ];
    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('scale', 14)} S10 · Alçadas e exceções</div>
      <h1 class="h1">Quem pode decidir o quê</h1>
      <p class="lede">Cada exceção do modelo tem um dono, um limite e um destino. O que não cabe no perfil do atendente é escalado, nunca improvisado.</p>

      <div class="card card--flush">
        <div class="card__head">
          <span class="card__title">Matriz de alçadas</span>
          <span class="badge badge--neutral">perfil: gerente de relacionamento</span>
        </div>
        <div class="card__body" style="padding:0">
          <table class="table">
            <thead><tr><th>Situação</th><th>Quem decide</th><th>Prazo</th><th>Encaminhamento</th></tr></thead>
            <tbody>
              ${cases.map(([s, w, p]) => `
                <tr>
                  <td>${s}</td><td>${w}</td><td>${p === 'danger' ? 'não se aplica' : '24 h'}</td>
                  <td><span class="badge badge--${p}">${p === 'danger' ? 'negado no balcão' : 'fila specialty'}</span></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <span class="card__title">Simular escalonamento</span>
          <span class="badge badge--brand">demonstração</span>
        </div>
        <div class="card__body">
          <div class="grid grid--3">
            <button class="btn btn--outline" data-dec="approve">Supervisor aprova</button>
            <button class="btn btn--outline" data-dec="pending">Fica na fila</button>
            <button class="btn btn--outline" data-dec="deny">Negado no balcão</button>
          </div>
          <div class="mt-16">
            ${d ? `
            <div class="note note--${d.tone}">
              <span class="note__ic">${ico(d.icon, 18)}</span>
              <div><b>${d.title}</b><br><span class="muted">${d.body}</span></div>
            </div>` : '<p class="tiny muted">Nenhuma decisão simulada ainda.</p>'}
          </div>
        </div>
      </div>
      <div class="trace">
        <span class="chip chip--iface">I18</span>
        <span class="chip chip--gap">escopo ampliado</span>
        <span class="chip chip--norm">NFR-05 · segregação de função</span>
      </div>
    </div>`;
  },
  bind(root) {
    root.querySelectorAll('[data-dec]').forEach(b => b.onclick = () => {
      const v = b.dataset.dec;
      S.srv.decision = {
        approve: { tone: 'success', icon: 'checkCircle', title: 'Aprovado pelo supervisor', body: 'O processo segue com o status atualizado e a cliente recebe o protocolo do banco.' },
        pending: { tone: 'alert', icon: 'clock', title: 'Encaminhado para a fila especializada', body: 'A cliente sai com protocolo e prazo. Nada some da papelada enquanto ela espera.' },
        deny:   { tone: 'danger', icon: 'xCircle', title: 'Negado no balcão', body: 'A cliente recebe o motivo por escrito e o canal para recorrer. A conta não é fechada como se nada tivesse acontecido.' },
      }[v];
      audit('I18', `Escalonamento simulado: ${v}`);
      render();
    });
  },
  onNext() { audit('I18', 'Matriz de alçadas revisada no atendimento'); },
};

/* ---------------------------------------------------------------- S11 */
SCREENS.s11 = {
  title: 'Renegociação e crédito assistido',
  hint: 'S11 · escopo ampliado do atendimento. Renegociação para cliente idoso e de baixa renda é <b>de abrangência limitada e prazo curto</b> e não funciona como produto de crédito livre.',
  nextLabel: 'Avançar',
  render() {
    const r = S.srv.reneg || { mode: 'REQUERIMENTO' };
    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('money', 14)} S11 · Renegociação</div>
      <h1 class="h1">Renegociação de dívida</h1>
      <p class="lede">Ofertas de renegociação no atendimento presencial têm regras apertadas: só quando existe incapacidade de pagamento comprovada, com prazo curto e sem custo para a cliente.</p>

      <div class="grid grid--2">
        <div class="card">
          <div class="card__title mb-16">Situação da cliente</div>
          <div class="rows">
            <div class="row"><span class="row__k">${ico('money', 16)} Dívida consolidada</span><span class="row__v">${money(3184.70)}</span></div>
            <div class="row"><span class="row__k">${ico('user', 16)} Renda informada</span><span class="row__v">${money(S.customer.income || 1518)}</span></div>
            <div class="row"><span class="row__k">${ico('chart', 16)} Comprometimento</span><span class="row__v">acima de 30% da renda</span></div>
            <div class="row"><span class="row__k">${ico('flag', 16)} Faixa etária</span><span class="row__v">acima de 60 anos, com direito a condição especial</span></div>
            <div class="row"><span class="row__k">${ico('list', 16)} Portabilidade jÃ¡ negativada?</span><span class="row__v">${r.mode === 'NEGATIVADO' ? 'sim' : 'não'}</span></div>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card__head">
              <span class="card__title">Condições disponíveis</span>
              <span class="badge badge--brand">sem custo</span>
            </div>
            <div class="card__body">
              <div class="stack">
                <div class="note note--success"><span class="note__ic">${ico('clock', 18)}</span>
                  <div><b>Prazo estendido</b><br><span class="muted">até 180 dias para cliente com incapacidade comprovada.</span></div></div>
                <div class="note note--success"><span class="note__ic">${ico('money', 18)}</span>
                  <div><b>Parcelamento sem juros</b><br><span class="muted">até 72 parcelas para pessoa física.</span></div></div>
                <div class="note note--success"><span class="note__ic">${ico('users', 18)}</span>
                  <div><b>Ausência de registro por risco</b><br><span class="muted">quando a causa é externa e verificável, como internação ou morte do provedor.</span></div></div>
              </div>
            </div>
          </div>
          <div class="note note--danger">
            <span class="note__ic">${ico('xCircle', 18)}</span>
            <div><b>O que não pode ser oferecido aqui.</b> <span class="muted">Crédito livre, reclassificação de risco do consumidor, ou qualquer condição que envolva custo não informado. A renegociação é direito de proteção, não venda.</span></div>
          </div>
        </div>
      </div>
      <div class="trace">
        <span class="chip chip--iface">I19</span>
        <span class="chip chip--gap">escopo ampliado</span>
        <span class="chip chip--norm">Lei 8.078/1990 (CDC) · Lei 10.741/2003 (Estatuto da Pessoa Idosa)</span>
      </div>
    </div>`;
  },
  onNext() { audit('I19', 'Opções de renegociação apresentadas à cliente, sem custo'); },
};

/* ---------------------------------------------------------------- S12 */
SCREENS.s12 = {
  title: 'Formalização e encerramento',
  hint: 'S12 · encerramento com a mesma disciplina do onboarding: protocolo, comprovantes, pendências com dono e <b>trilha completa</b>.',
  nextLabel: 'Encerrar atendimento',
  render() {
    return `
    <div class="wrap wrap--wide">
      <div class="h-eyebrow">${ico('checkCircle', 14)} A03 · I07 · I06 · Encerramento do atendimento</div>
      <h1 class="h1">Fechar o atendimento</h1>
      <p class="lede">O modelo não termina quando o assunto acaba. Ele termina quando a cliente tem o protocolo, o comprovante e sabe quem responder se algo faltar.</p>

      <div class="grid grid--2">
        <div class="card">
          <div class="card__head">
            <span class="card__title">Documentos entregues</span>
            <span class="badge badge--success">impressos</span>
          </div>
          <div class="card__body">
            <div class="stack">
              ${[
                'Protocolo de atendimento',
                'Comprovante de contestação e bloqueio de cartão',
                'Comprovante de portabilidade de chave Pix',
                'Termo de renegociação, se houver',
              ].map(t => `
                <div class="toggle">
                  <div class="toggle__txt"><div class="toggle__name">${t}</div></div>
                  <button class="btn btn--ghost" data-print2="${t}">${ico('print', 18)} Imprimir</button>
                </div>`).join('')}
            </div>
          </div>
        </div>
        <div>
          <div class="card">
            <div class="card__title mb-16">Pendências que continuam vivas</div>
            <div class="stack">
              <div class="note note--alert"><span class="note__ic">${ico('clock', 18)}</span>
                <div><b>Contestação em análise de fraude</b><br><span class="muted">SLA de 5 dias úteis · fila de fraude</span></div></div>
              <div class="note note--alert"><span class="note__ic">${ico('gavel', 18)}</span>
                <div><b>Bloqueio judicial vigente</b><br><span class="muted">protocolo com o jurídico</span></div></div>
            </div>
            <div class="note note--info mt-16">
              <span class="note__ic">${ico('info', 18)}</span>
              <div><b>Pendência não é cancelamento.</b> <span class="muted">A cliente pode ser atendida de novo para qualquer um desses assuntos, e a trilha anterior continua disponível para quem for consultar depois.</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card card--flush">
        <div class="card__head">
          <span class="card__title">Trilha de auditoria do atendimento</span>
          <span class="badge badge--neutral">${S.audit.length} eventos</span>
        </div>
        <div class="card__body">
          <table class="table">
            <thead><tr><th>Horário</th><th>Interface</th><th>Evento</th><th>Modo</th></tr></thead>
            <tbody>
              ${S.audit.slice(0, 14).map(e => `
                <tr><td>${e.t}</td><td><code>${e.iface}</code></td><td>${e.msg}</td>
                <td>${e.ctx.deviceMode === 'CUSTOMER_MODE' ? '<span class="badge badge--brand">cliente</span>' : '<span class="badge badge--neutral">funcionário</span>'}</td></tr>`).join('')
                || '<tr><td colspan="4" class="muted">Nenhum evento registrado.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      <div class="trace">
        <span class="chip chip--iface">A03 · I07 · I06</span>
        <span class="chip chip--ca">15.32.1 · 15.32.2</span>
        <span class="chip chip--norm">NFR-17 · trilha de auditoria</span>
      </div>
    </div>`;
  },
  bind(root) {
    root.querySelectorAll('[data-print2]').forEach(b => b.onclick = () => audit('A03', `Comprovante impresso: ${b.dataset.print2}`));
  },
  onNext() {
    S.session.outcome = 'COMPLETED';
    audit('A03', 'Atendimento de servicing encerrado · comprovantes emitidos');
  },
};
