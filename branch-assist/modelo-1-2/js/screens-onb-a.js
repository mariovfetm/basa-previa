/* ============================================================================
   Branch Assist — Onboarding assistido · E00 a E04
   ========================================================================== */
window.SCREENS = window.SCREENS || {};

/* ---------------------------------------------------------------- E00 */
SCREENS.e00 = {
  title: 'Autenticação do funcionário',
  hint: 'I00 · a autenticação do atendente é a <b>mesma</b> usada ao voltar de qualquer tarefa de cliente.',
  nextLabel: 'Iniciar sessão',
  render() {
    return `
    <div class="wrap">
      <div class="h-eyebrow">${ico('lock', 14)} I00 · Autenticação de funcionário</div>
      <h1 class="h1">Identifique-se para iniciar o atendimento</h1>
      <p class="lede">O tablet só abre a sessão de atendimento depois que o atendente se autentica. A sessão fica vinculada ao ponto de atendimento e ao dispositivo gerenciado.</p>

      <div class="grid grid--2">
        <div class="card">
          <div class="grid">
            <div class="field">
              <label class="field__label" for="op-mat">Matrícula</label>
              <input class="field__input" id="op-mat" value="${S.session.operatorId}" readonly>
              <span class="field__help">Identificador corporativo do Banco da Amazônia.</span>
            </div>
            <div class="field">
              <label class="field__label" for="op-pin">PIN do atendente</label>
              <input class="field__input" id="op-pin" type="password" inputmode="numeric" maxlength="6" value="••••••" aria-describedby="op-pin-help">
              <span class="field__help" id="op-pin-help">Credencial de 6 dígitos. O número de tentativas é limitado e auditado.</span>
            </div>
            <div class="field">
              <label class="field__label" for="op-perfil">Perfil de acesso</label>
              <select class="field__select" id="op-perfil">
                ${Object.entries(PERFIS_ACESSO).map(([k, p]) => `<option value="${k}" ${S.session.operatorProfile === k ? 'selected' : ''}>${p.nome}</option>`).join('')}
              </select>
              <span class="field__help">O Branch Assist atende em agência, em correspondente bancário e com agente de microcrédito. As alçadas de cada perfil ainda estão em definição com o Banco.</span>
            </div>
            <div class="field">
              <label class="field__label" for="op-alcada">Alçada</label>
              <select class="field__select" id="op-alcada">
                <option value="nao" ${S.session.approvalAuthority ? '' : 'selected'}>Sem alçada de aprovação</option>
                <option value="sim" ${S.session.approvalAuthority ? 'selected' : ''}>Com alçada de aprovação</option>
              </select>
              <span class="field__help">Define as exceções que o atendente encerra sozinho (I18). A criação da conta sempre passa pela aprovação de um supervisor.</span>
            </div>
          </div>
          <div class="note note--info mt-16">
            <span class="note__ic">${ico('tablet', 18)}</span>
            <div><b>Dispositivo gerenciado (MDM).</b> <span class="muted">Tablet <code>${S.session.deviceId}</code> · matrícula de enrollment <code>${S.session.deviceEnrollmentId}</code>. Fora de MDM o fluxo é bloqueado.</span></div>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card__title mb-16">O que este controle garante</div>
            <div class="rows">
              <div class="row"><span class="row__k">${ico('user', 16)} Quem operou</span><span class="row__v">employeeId + perfil</span></div>
              <div class="row"><span class="row__k">${ico('bank', 16)} Onde</span><span class="row__v">branchId + servicePointId</span></div>
              <div class="row"><span class="row__k">${ico('shield', 16)} Em qual dispositivo</span><span class="row__v">deviceId + atestado</span></div>
              <div class="row"><span class="row__k">${ico('link', 16)} Sessão</span><span class="row__v">sessionId único</span></div>
              <div class="row"><span class="row__k">${ico('folder', 16)} Como</span><span class="row__v">servicingChannel</span></div>
            </div>
            <div class="trace">
              <span class="chip chip--iface">I00</span>
              <span class="chip chip--ca">17.3</span>
              <span class="chip chip--norm">NFR-17 · auditoria</span>
            </div>
          </div>
          <div class="note note--control">
            <span class="note__ic">${ico('info', 18)}</span>
            <div><b>Mesma credencial, três lugares.</b> <span style="color:#ffffffc2">Autenticação de funcionário na abertura, na volta de cada tarefa da cliente e depois de 5 min de inatividade (12,5 min com tempo estendido), quando o tablet volta sozinho à tela de bloqueio.</span></div>
          </div>
        </div>
      </div>
    </div>`;
  },
  bind(root) {
    const perfil = root.querySelector('#op-perfil'), alcada = root.querySelector('#op-alcada');
    perfil.onchange = () => { S.session.operatorProfile = perfil.value; pintarOperador(); };
    alcada.onchange = () => { S.session.approvalAuthority = alcada.value === 'sim'; };
  },
  onNext() {
    S.session.sessionId = uid('SES');
    S.session.customerPresenceConfirmed = true;
    audit('I00', `Funcionário autenticado · ${PERFIS_ACESSO[S.session.operatorProfile].nome} · ${S.session.approvalAuthority ? 'com' : 'sem'} alçada · sessão ${S.session.sessionId}`);
  },
};

/* ---------------------------------------------------------------- E01 */
SCREENS.e01 = {
  title: 'Abertura da sessão assistida',
  hint: 'A01 · a sessão carrega canal, ponto, dispositivo, <b>perfil de acessibilidade</b> e a presença do cliente. Tudo isso vira registro de auditoria.',
  nextLabel: 'Confirmar sessão',
  render() {
    const rel = [
      ['Filho(a)', 'FILHO'], ['Neto(a)/Neta', 'GRANDCHILD'],
      ['Cônjuge ou companheiro(a)', 'SPOUSE'], ['Irmão(ã)', 'SIBLING'],
      ['Tutor legal', 'LEGAL_GUARDIAN'], ['Outro', 'OTHER'],
    ];
    return `
    <div class="wrap">
      <div class="h-eyebrow">${ico('folder', 14)} A01 · AssistedSession</div>
      <h1 class="h1">Abrir a sessão de atendimento</h1>
      <p class="lede">A sessão define quem pode fazer o quê. O canal <code>BRANCH</code> é o que libera a esteira de abertura de conta; atendente em outro canal não consegue executar este fluxo.</p>

      <div class="card">
        <div class="card__head">
          <span class="card__title">Parâmetros da sessão</span>
          <span class="badge badge--brand">${S.session.servicingChannel}</span>
        </div>
        <div class="card__body">
          <div class="grid grid--3">
            <div class="field">
              <label class="field__label" for="s-chan">Canal de atendimento</label>
              <select class="field__select" id="s-chan">
                <option selected>BRANCH (agência física)</option>
                <option>REMOTE (atendimento remoto)</option>
              </select>
            </div>
            <div class="field">
              <label class="field__label" for="s-point">Ponto de atendimento</label>
              <input class="field__input" id="s-point" value="${S.session.servicePointId}">
            </div>
            <div class="field">
              <label class="field__label" for="s-assist">Nível de assistência</label>
              <select class="field__select" id="s-assist">
                <option>ACCOMPANY (cliente acompanhada)</option>
                <option>ASSISTED (cliente com necessidade de apoio do atendente)</option>
              </select>
            </div>
          </div>

          <hr class="hr">

          <div class="card__title mb-16">Perfil de acessibilidade da sessão</div>
          <p class="tiny muted mb-16">A confirmação de presença acontece aqui. O perfil pode ser ajustado a qualquer momento, inclusive com o pedido da cliente na hora, e vale para todas as telas seguintes.</p>
          <div class="toggle" data-toggle="fontScale">
            <div class="toggle__txt"><div class="toggle__name">Fonte ampliada</div>
            <div class="toggle__desc">Escala tipográfica de 1,0× para 1,5×. Mínimo exigido para cliente com baixa visão.</div></div>
            <button class="switch" role="switch" aria-checked="${S.a11y.fontScale > 1}" data-a11y="fontScale"></button>
          </div>
          <div class="toggle" data-toggle="highContrast">
            <div class="toggle__txt"><div class="toggle__name">Alto contraste</div>
            <div class="toggle__desc">Texto preto sobre branco puro, contraste 21:1. Alvo mínimo de 7:1 (NFR-18).</div></div>
            <button class="switch" role="switch" aria-checked="${S.a11y.highContrast}" data-a11y="highContrast"></button>
          </div>
          <div class="toggle" data-toggle="audioGuidance">
            <div class="toggle__txt"><div class="toggle__name">Guia por áudio</div>
            <div class="toggle__desc">Leitura em voz alta no fone, sem alto-falante, para não expor dados da cliente na fila da agência.</div></div>
            <button class="switch" role="switch" aria-checked="${S.a11y.audioGuidance}" data-a11y="audioGuidance"></button>
          </div>
          <div class="toggle" data-toggle="extendedTimeouts">
            <div class="toggle__txt"><div class="toggle__name">Tempo estendido</div>
            <div class="toggle__desc">Multiplica todos os timeouts por 2,5×. Nunca desliga o timeout: a sessão expira de qualquer forma.</div></div>
            <button class="switch" role="switch" aria-checked="${S.a11y.extendedTimeouts}" data-a11y="extendedTimeouts"></button>
          </div>
          <div class="toggle" data-toggle="simplifiedLanguage">
            <div class="toggle__txt"><div class="toggle__name">Linguagem simples</div>
            <div class="toggle__desc">Troca termos técnicos por linguagem direta, com leitura em voz alta de cada pergunta.</div></div>
            <button class="switch" role="switch" aria-checked="${S.a11y.simplifiedLanguage}" data-a11y="simplifiedLanguage"></button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <span class="card__title">Acompanhante</span>
          <span class="badge ${S.companion.present ? 'badge--alert' : 'badge--neutral'}">${S.companion.present ? 'Presente' : 'Ausente'}</span>
        </div>
        <div class="card__body">
          <div class="toggle mt-0">
            <div class="toggle__txt"><div class="toggle__name">Cliente vem acompanhada</div>
            <div class="toggle__desc">Enquanto houver acompanhante, as ações sensíveis exigem a entrega do tablet à própria cliente.</div></div>
            <button class="switch" role="switch" aria-checked="${S.companion.present}" data-flag="companion"></button>
          </div>
          ${S.companion.present ? `
          <div class="grid grid--2 mt-16">
            <div class="field">
              <label class="field__label" for="c-rel">Relação declarada</label>
              <select class="field__select" id="c-rel">
                ${rel.map(([t, v]) => `<option value="${v}" ${S.companion.declaredRelationship === v ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label class="field__label" for="c-id">Acompanhante identificado</label>
              <input class="field__input" id="c-id" value="${S.companion.identified ? 'Documento conferido' : 'Pendente'}" readonly>
              <span class="field__help">Identificação do acompanhante é recomendada, não obrigatória. Nenhum poder de assinatura é atribuído a ele.</span>
            </div>
          </div>` : ''}
          <div class="note note--alert mt-16">
            <span class="note__ic">${ico('users', 18)}</span>
            <div><b>Acompanhante não é representante.</b> <span class="muted">O vínculo com o banco é registrado com o nome e o CPF de cada pessoa que participa do atendimento. O acompanhante não assina nem responde pela conta.</span></div>
          </div>
        </div>
      </div>
    </div>`;
  },
  bind(root) {
    const rel = root.querySelector('#c-rel');
    if (rel) rel.onchange = e => { S.companion.declaredRelationship = e.target.value; };
  },
  onNext() {
    S.session.assistanceLevel = 'ACCOMPANY';
    audit('A01', `Sessão aberta · ${S.session.servicePointId} · acompanhante ${S.companion.present ? 'presente' : 'ausente'}`);
  },
};

/* ---------------------------------------------------------------- E02 */
/* Travas de domínio (dossiê, Parte A): o CPF decide o caminho.
   · já possui conta corrente  → atendimento (S00), abertura improcedente
   · bloqueio judicial         → esteira de bloqueio e restrições (S09)
   · proposta em análise       → para: acompanhar a proposta existente
   · menor de idade            → para: abertura exige representante legal
   · procurador sem registro   → para: registrar a procuração antes      */
const E02_SITUACAO = {
  INCOMPLETO: { tone: 'neutral', badge: 'incompleto', destino: 'Aguardando CPF completo' },
  NOVO:       { tone: 'success', badge: 'CPF sem conta no banco', destino: 'Abertura de conta' },
  EXISTENTE:  { tone: 'alert',   badge: 'já possui conta corrente', destino: 'Atendimento · S00, abertura encerrada como improcedente' },
  JUDICIAL:   { tone: 'danger',  badge: 'bloqueio judicial ativo', destino: 'Bloqueio judicial e restrições · S09' },
  PROPOSTA:   { tone: 'alert',   badge: 'proposta em análise', destino: 'Acompanhar a proposta existente · abertura não segue' },
  MENOR:      { tone: 'danger',  badge: 'menor de idade', destino: 'Abertura com representante legal · fluxo próprio' },
  PROCURADOR: { tone: 'danger',  badge: 'procurador sem registro', destino: 'Registrar a procuração (S08) antes de abrir' },
};

/* Situação efetiva, combinando a base de CPF com quem comparece. */
function situacaoE02(lk) {
  if (!lk || lk.situacao === 'INCOMPLETO') return 'INCOMPLETO';
  if (lk.situacao !== 'NOVO') return lk.situacao;
  const anos = lk.birth ? idade(lk.birth) : null;
  if (anos !== null && anos < 18) return 'MENOR';
  if (S.onb.appearer === 'PROCURADOR_SEM_REG') return 'PROCURADOR';
  return 'NOVO';
}

SCREENS.e02 = {
  title: 'Identificação por CPF e travas',
  hint: 'I01 · o CPF é o gatilho de tudo. Cliente já cadastrado sai da esteira de abertura e vai para o módulo de atendimento.',
  nextLabel: 'Consultar cliente',
  render() {
    const cpf = S.onb.lookup ? S.onb.lookup.raw : (S.customer.cpf || PERSONAS[PERSONA].cpf);
    return `
    <div class="wrap">
      <div class="h-eyebrow">${ico('search', 14)} I01 · Identificação do cliente</div>
      <h1 class="h1">Quem está sendo atendida hoje?</h1>
      <p class="lede">A identificação é digitada pelo atendente, com a cliente presente. Não há busca livre por nome: o CPF é a chave, e a resposta do sistema decide o caminho.</p>

      <div class="card">
        <div class="grid grid--3">
          <div class="field span-2">
            <label class="field__label" for="cpf">CPF da cliente <span class="field__req">*</span></label>
            <input class="field__input" id="cpf" inputmode="numeric" autocomplete="off"
                   value="${maskCpf(cpf)}" style="font-size:var(--fs-2xl);letter-spacing:.06em">
            <span class="field__help">11 dígitos, com máscara automática. O conferente contra o documento é feito aqui, não depois.</span>
          </div>
          <div class="field">
            <label class="field__label" for="cpf-quem">Quem comparece ao balcão</label>
            <select class="field__select" id="cpf-quem">
              <option value="TITULAR" ${S.onb.appearer === 'TITULAR' ? 'selected' : ''}>A própria titular</option>
              <option value="PROCURADOR_REG" ${S.onb.appearer === 'PROCURADOR_REG' ? 'selected' : ''}>Procurador com procuração registrada</option>
              <option value="PROCURADOR_SEM_REG" ${S.onb.appearer === 'PROCURADOR_SEM_REG' ? 'selected' : ''}>Procurador sem procuração registrada</option>
            </select>
          </div>
        </div>

        <div class="mt-24">
          <div class="card__title mb-8">Travas de domínio (o que o sistema impede)</div>
          <div class="inline" id="cpf-travas">
            ${['EXISTENTE', 'PROPOSTA', 'PROCURADOR', 'JUDICIAL', 'MENOR'].map(k =>
              `<span class="chip chip--iface" data-trava="${k}">${E02_SITUACAO[k].badge}</span>`).join('')}
          </div>
          <p class="tiny muted mt-8">Nenhuma trava é contornada pelo atendente. Cliente existente e bloqueio judicial desviam para o atendimento; proposta em análise, menor de idade e procurador sem registro param a abertura com o encaminhamento indicado.</p>
        </div>
        <div class="trace">
          <span class="chip chip--iface">I01</span>
          <span class="chip chip--ca">17.3</span>
          <span class="chip chip--norm">Res. CMN 4.753/2019 · Circ. BCB 3.978/2020</span>
        </div>
      </div>

      <div class="grid grid--2">
        <div class="card">
          <div class="card__title mb-16">Resposta da consulta</div>
          <div class="rows">
            <div class="row"><span class="row__k">Situação do CPF</span><span class="row__v" id="cpf-ok">—</span></div>
            <div class="row"><span class="row__k">Nome no cadastro</span><span class="row__v" id="cpf-nome">—</span></div>
            <div class="row"><span class="row__k">Idade</span><span class="row__v" id="cpf-idade">—</span></div>
            <div class="row"><span class="row__k">Detalhe</span><span class="row__v" id="cpf-det">—</span></div>
            <div class="row"><span class="row__k">Destino</span><span class="row__v" id="cpf-dest">—</span></div>
          </div>
        </div>
        <div class="card">
          <div class="card__title mb-16">Cenário de demonstração</div>
          <p class="tiny muted mb-16">Troque o CPF para ver o desvio. É a forma mais rápida de mostrar que a esteira tem portões, não um caminho único. Todos os CPFs são fictícios e inválidos.</p>
          <div class="grid grid--2">
            <button class="btn btn--outline btn--block" data-cpf="novo">CPF novo</button>
            <button class="btn btn--outline btn--block" data-cpf="existente">Já possui conta</button>
            <button class="btn btn--outline btn--block" data-cpf="judicial">Bloqueio judicial</button>
            <button class="btn btn--outline btn--block" data-cpf="proposta">Proposta em análise</button>
            <button class="btn btn--outline btn--block" data-cpf="menor">Menor de idade</button>
            <button class="btn btn--outline btn--block" data-cpf="procurador">Procurador sem registro</button>
          </div>
        </div>
      </div>
    </div>`;
  },
  bind(root) {
    const inp = root.querySelector('#cpf');
    const quem = root.querySelector('#cpf-quem');
    const load = () => {
      const lk = consultarCpf(inp.value);
      inp.value = maskCpf(lk.raw);
      S.onb.lookup = lk.situacao === 'INCOMPLETO' ? null : lk;
      const sit = situacaoE02(lk);
      const cfg = E02_SITUACAO[sit];
      const anos = lk.birth ? idade(lk.birth) : null;
      root.querySelector('#cpf-ok').innerHTML = `<span class="badge badge--${cfg.tone}">${cfg.badge}</span>`;
      root.querySelector('#cpf-nome').textContent = lk.name ? lk.name.split(' ').slice(0, 3).join(' ') : (sit === 'INCOMPLETO' ? '—' : 'sem cadastro no banco');
      root.querySelector('#cpf-idade').textContent = anos === null ? '—' : `${anos} anos`;
      root.querySelector('#cpf-det').textContent = lk.detalhe || '—';
      root.querySelector('#cpf-dest').textContent = cfg.destino;
      root.querySelectorAll('[data-trava]').forEach(c => c.classList.toggle('chip--hit', c.dataset.trava === sit));
      S.customer.existing = sit === 'EXISTENTE';
      paintRail();
    };
    inp.oninput = load;
    quem.onchange = () => { S.onb.appearer = quem.value; load(); };
    load();
    root.querySelectorAll('[data-cpf]').forEach(b => b.onclick = () => {
      const k = b.dataset.cpf;
      const v = { novo: PERSONAS[PERSONA].cpf, existente: '108.442.719-60', judicial: '041.882.910-12',
                  proposta: '362.518.904-77', menor: '519.730.286-95', procurador: PERSONAS[PERSONA].cpf }[k];
      S.onb.appearer = k === 'procurador' ? 'PROCURADOR_SEM_REG' : 'TITULAR';
      quem.value = S.onb.appearer;
      inp.value = v; load();
    });
  },
  gate() {
    const lk = S.onb.lookup;
    const sit = situacaoE02(lk);
    if (sit === 'INCOMPLETO') return 'Informe os 11 dígitos do CPF da cliente.';
    if (sit === 'PROPOSTA') return `Já existe proposta de abertura em análise para este CPF (${lk.detalhe}). Não se abre outra: acompanhe a existente e informe o prazo à cliente.`;
    if (sit === 'MENOR') return `A titular tem ${idade(lk.birth)} anos. Conta para menor de 18 anos exige representante legal e segue fluxo próprio, fora desta esteira.`;
    if (sit === 'PROCURADOR') return 'Quem comparece é procurador sem procuração registrada no banco. Registre a procuração no atendimento (S08) e retome a abertura depois.';
    return null;
  },
  onNext() {
    const lk = S.onb.lookup;
    const sit = situacaoE02(lk);
    S.customer.cpf = lk.raw;
    if (lk.persona === undefined && lk.name) Object.assign(S.customer, { name: lk.name, birth: lk.birth });
    audit('I01', `CPF ${maskCpf(lk.raw)} consultado · ${E02_SITUACAO[sit].badge}`);
    if (sit === 'EXISTENTE') {
      S.session.outcome = 'IMPROCEDENTE';
      audit('I01', 'Abertura encerrada como improcedente · cliente já possui conta corrente · atendimento aberto em S00');
      S.srv.task = 'Cliente existente vindo da abertura';
      return { ir: 'S00', modulo: 'srv' };
    }
    if (sit === 'JUDICIAL') {
      S.session.outcome = 'BLOQUEIO_JUDICIAL';
      audit('I17', 'Abertura impedida por bloqueio judicial ativo · atendimento direcionado a S09');
      S.srv.task = 'Bloqueio judicial vindo da abertura';
      return { ir: 'S09', modulo: 'srv' };
    }
  },
};

/* ---------------------------------------------------------------- E03 */
SCREENS.e03 = {
  title: 'Seleção do tipo de conta',
  hint: 'E03 · a escolha é da cliente, com o produto explicado em linguagem simples. O atendente não empurra produto.',
  nextLabel: 'Ver pré-requisitos',
  render() {
    const prods = [
      { id: 'CHECKING', ico: 'wallet', name: 'Conta corrente', desc: 'Para receber salário, aposentadoria e pagar contas. Tem cartão, Pix e cheque especial.', sel: true },
      { id: 'SAVINGS',   ico: 'bank',   name: 'Poupança', desc: 'Rende uma vez por mês, no dia em que a conta faz aniversário. Abre junto com a conta corrente ou depois dela.', sel: false },
      { id: 'BASIC',    ico: 'doc',    name: 'Conta básica', desc: 'Sem tarifa de manutenção. Para quem só precisa receber e sacar.', sel: false },
    ];
    return `
    <div class="wrap">
      <div class="h-eyebrow">${ico('wallet', 14)} E03 · Produto</div>
      <h1 class="h1">Que conta você quer abrir?</h1>
      <p class="lede">A seleção é livre. Se a cliente hesitar, a explicação passa para linguagem simples e leitura em voz alta, em vez de mais uma tela de tabela de tarifas.</p>

      <div class="choices" id="prod">
        ${prods.map(p => `
        <button class="choice" data-prod="${p.id}" aria-pressed="${S.onb.accountTypes.includes(p.id)}">
          <span class="choice__ic">${ico(p.ico, 22)}</span>
          <span>
            <span class="choice__name">${p.name}</span>
            <span class="choice__desc">${p.desc}</span>
          </span>
        </button>`).join('')}
      </div>

      <div class="card mt-24">
        <div class="card__head">
          <span class="card__title">Como a abertura é afetada</span>
          <span class="badge badge--info">${S.onb.accountTypes.length} selecionada(s)</span>
        </div>
        <div class="card__body">
          <div class="rows">
            <div class="row"><span class="row__k">${ico('shield', 16)} KYC e validação de identidade</span><span class="row__v">obrigatório em todos os casos</span></div>
            <div class="row"><span class="row__k">${ico('user', 16)} Risco de perfil</span><span class="row__v">varia com a combinação escolhida</span></div>
            <div class="row"><span class="row__k">${ico('card', 16)} Cartão</span><span class="row__v">virtual na hora · físico solicitado na abertura (E13)</span></div>
            <div class="row"><span class="row__k">${ico('alert', 16)} Limite de transferência</span><span class="row__v" id="prod-limit">—</span></div>
          </div>
          <div class="note note--info mt-16">
            <span class="note__ic">${ico('info', 18)}</span>
            <div><b>Poupança vem com a conta corrente.</b> <span class="muted">Ao marcar poupança, a conta corrente entra junto: a poupança não abre sozinha. Pessoa jurídica segue na abertura tradicional da agência nesta fase.</span></div>
          </div>
          <div class="note note--info mt-16">
            <span class="note__ic">${ico('info', 18)}</span>
            <div><b>Cartão sem escolha extra aqui.</b> <span class="muted">A solicitação do cartão de débito sai junto com a criação da conta (E13). Entrega, senha e 2ª via ficam no atendimento (S30), para não misturar dois prazos de SLA no mesmo formulário.</span></div>
          </div>
          <div class="trace">
            <span class="chip chip--iface">E03</span>
            <span class="chip chip--norm">Res. CMN 4.753/2019 · art. 3º</span>
          </div>
        </div>
      </div>
    </div>`;
  },
  bind(root) {
    root.querySelectorAll('[data-prod]').forEach(b => b.onclick = () => {
      const id = b.dataset.prod;
      const on = S.onb.accountTypes.includes(id);
      let tipos = on ? S.onb.accountTypes.filter(x => x !== id) : [...S.onb.accountTypes, id];
      /* Poupança só com conta corrente (ou básica): marcar poupança traz a corrente junto,
         e tirar a última conta corrente tira a poupança. */
      const temCorrente = t => t.includes('CHECKING') || t.includes('BASIC');
      if (id === 'SAVINGS' && !on && !temCorrente(tipos)) tipos = ['CHECKING', ...tipos];
      if (id !== 'SAVINGS' && on && !temCorrente(tipos)) tipos = tipos.filter(x => x !== 'SAVINGS');
      S.onb.accountTypes = tipos.length ? tipos : [id];
      root.querySelectorAll('[data-prod]').forEach(x => x.setAttribute('aria-pressed', S.onb.accountTypes.includes(x.dataset.prod)));
      root.querySelector('#prod-limit').textContent = money(limiteConta()) + ' por transação';
    });
    root.querySelector('#prod-limit').textContent = money(limiteConta()) + ' por transação';
  },
  onNext() {
    audit('E03', `Produto selecionado: ${S.onb.accountTypes.join(', ')}`);
  },
};

/* ---------------------------------------------------------------- E04 */
SCREENS.e04 = {
  title: 'Consulta prévia regulatória',
  hint: 'A04 · a consulta vem <b>antes</b> da digitação de qualquer dado pessoal. A elegibilidade é decidida sem nenhuma coleta prévia.',
  nextLabel() { return S.onb.eligibility === 'UNAVAILABLE' ? 'Encerrar com protocolo' : 'Aplicar resultado'; },
  render() {
    const R = S.onb.eligibility || 'CLEAR';
    const map = {
      CLEAR:       { t: 'success', h: 'Elegível',   d: 'Sem impedimentos regulatórios. O fluxo de abertura segue normalmente.' },
      RESTRICTED:  { t: 'alert',   h: 'Com restrição', d: 'Existe uma condição que muda o produto ou exige aviso ao Banco Central. Continua, com registro do motivo.' },
      UNAVAILABLE: { t: 'danger',  h: 'Indisponível',  d: 'A consulta não pôde ser concluída por indisponibilidade do serviço. O processo para com protocolo, sem caracterizar negativa de crédito.' },
    }[R];
    return `
    <div class="wrap">
      <div class="h-eyebrow">${ico('shield', 14)} A04 · Pré-requisitos regulatórios</div>
      <h1 class="h1">Verificação automática antes de começar</h1>
      <p class="lede">Esta consulta não pede nenhum dado da cliente. Ela cruza o CPF com listas restritivas nacionais e internacionais (OFAC, CSNU, UE, fraudadores do DICT), com a base de PEP e com o Sistema de Informações de Crédito. É um portão: pode liberar, restringir ou interromper.</p>

      <div class="card">
        <div class="card__head">
          <span class="card__title">Resultado da consulta</span>
          <span class="badge badge--${map.t}">${map.h}</span>
        </div>
        <div class="card__body">
          <p class="p">${map.d}</p>
          <div class="rows">
            <div class="row"><span class="row__k">${ico('file', 16)} Consulta de crédito</span><span class="row__v">${R === 'CLEAR' ? 'sem apontamento impeditivo' : R === 'RESTRICTED' ? '1 apontamento em monitoramento' : 'não concluída'}</span></div>
            <div class="row"><span class="row__k">${ico('scale', 16)} PEP · Pessoa Exposta Politicamente</span><span class="row__v" id="a04-pep">${S.onb.pepStatus === 'PENDING' ? 'não avaliado' : S.onb.pepStatus}</span></div>
            <div class="row"><span class="row__k">${ico('flag', 16)} Listas restritivas e sanções</span><span class="row__v">${R === 'UNAVAILABLE' ? 'não avaliado' : 'nenhuma ocorrência'}</span></div>
            <div class="row"><span class="row__k">${ico('list', 16)} Pendências internas</span><span class="row__v">${R === 'CLEAR' ? 'nenhuma' : R === 'RESTRICTED' ? '1 pendência leve' : 'não avaliado'}</span></div>
            <div class="row"><span class="row__k">${ico('folder', 16)} Identificador da consulta</span><span class="row__v" id="a04-id">${S.onb.eligibilityId || '—'}</span></div>
          </div>
          ${R === 'UNAVAILABLE' ? `
          <div class="note note--danger mt-16">
            <span class="note__ic">${ico('xCircle', 18)}</span>
            <div><b>Não tratar como recusa.</b> <span class="muted">Indisponibilidade do serviço não é negativa. A sessão é encerrada com protocolo para o cliente voltar a outro dia, e o atendente registra o motivo real.</span></div>
          </div>` : ''}
          ${R === 'RESTRICTED' ? `
          <div class="note note--alert mt-16">
            <span class="note__ic">${ico('alert', 18)}</span>
            <div><b>Restrição não é negativa de crédito.</b> <span class="muted">O produto ou o limite muda, a conta abre, e a cliente é avisada em linguagem simples antes de confirmar.</span></div>
          </div>` : ''}
        </div>
      </div>

      <div class="card">
        <div class="card__title mb-16">Simular resposta da interface A04</div>
        <div class="grid grid--3">
          <button class="btn btn--outline" data-el="CLEAR">Sem apontamento</button>
          <button class="btn btn--outline" data-el="RESTRICTED">Com restrição</button>
          <button class="btn btn--outline" data-el="UNAVAILABLE">Serviço indisponível</button>
        </div>
        <div class="trace">
          <span class="chip chip--iface">A04</span>
          <span class="chip chip--ca">17.5 · 17.6 · 17.7</span>
          <span class="chip chip--norm">Circ. BCB 3.978/2020 · Res. CMN 4.753/2019</span>
        </div>
      </div>
    </div>`;
  },
  bind(root) {
    root.querySelectorAll('[data-el]').forEach(b => b.onclick = () => {
      S.onb.eligibility = b.dataset.el;
      S.onb.eligibilityId = uid('ELG');
      S.onb.pepStatus = b.dataset.el === 'CLEAR' ? 'NEGATIVO' : 'PENDENTE';
      render();
    });
  },
  onNext() {
    if (!S.onb.eligibility) { S.onb.eligibility = 'CLEAR'; S.onb.eligibilityId = uid('ELG'); S.onb.pepStatus = 'NEGATIVO'; }
    audit('A04', `Pré-requisito ${S.onb.eligibility} · ${S.onb.eligibilityId}`);
    if (S.onb.eligibility === 'UNAVAILABLE') {
      S.onb.outcome = 'SERVICE_UNAVAILABLE';
      S.onb.protocolo = S.onb.protocolo || uid('PRO');
      audit('A04', `Abertura interrompida por indisponibilidade da consulta · protocolo ${S.onb.protocolo} · não é negativa`);
      return { ir: 'E14' };
    }
  },
};
