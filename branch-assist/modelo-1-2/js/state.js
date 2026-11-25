/* ============================================================================
   Estado do modelo — Branch Assist
   Espelha as entidades do dossiê BASA-B15-BA-026 v2.0 (Parte E.3)
   e as máquinas de estado da ADR-0003 v3.0 (Parte D).
   Nada aqui faz chamada de rede: as interfaces A01 a A14 e I00 a I35 são
   simuladas em memória para que o fluxo seja percorrível de ponta a ponta.
   ========================================================================== */

/* Data relativa a hoje, em ISO. Os dados de exemplo usam isto para que o
   modelo continue coerente meses depois — data fixa envelhece e quebra
   demonstrações (agendamento vencido não exercita o cancelamento). */
function emDias(n) {
  /* Data LOCAL. toISOString() devolveria a data em UTC, que no Brasil
     (UTC-3) vira o dia seguinte a partir das 21h. */
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return isoLocal(d);
}
function hojeISO() { return emDias(0); }

function isoLocal(d) {
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* 'AAAA-MM-DD' interpretado como data local. new Date('AAAA-MM-DD') lê
   meia-noite UTC e, no fuso de Belém, mostra o dia anterior. */
function parseISO(v) {
  if (v instanceof Date) return v;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || ''));
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], 12, 0, 0);
  return new Date(v);
}
function dataBR(v) {
  const d = parseISO(v);
  return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR');
}
/* Dias corridos entre hoje e a data (negativo se já passou). */
function diasAte(v) {
  const a = parseISO(hojeISO()), b = parseISO(v);
  return Math.round((b - a) / 864e5);
}

/* Quem usa o Branch Assist: funcionário de agência, correspondente bancário e agente de
   microcrédito. As alçadas de cada perfil ainda não foram definidas pelo Banco. */
const PERFIS_ACESSO = {
  AGENCIA:        { nome: 'Funcionário de agência',  papel: 'Gerente de Relacionamento' },
  CORRESPONDENTE: { nome: 'Correspondente bancário', papel: 'Correspondente bancário' },
  MICROCREDITO:   { nome: 'Agente de microcrédito',  papel: 'Agente de microcrédito' },
};

/* Contas abertas no atendimento presencial nascem na Agência Digital 201; a agência física
   fica registrada como origem do atendimento. */
const AGENCIA_DIGITAL = { id: '201', nome: 'Agência Digital' };

const S = {
  /* ---------- AssistedSession (A01) ---------- */
  session: {
    sessionId: null,
    operatorId: 'BASA\\ana.moreira',
    operatorRole: 'RELATIONSHIP_OFFICER',
    operatorProfile: 'AGENCIA',          // PERFIS_ACESSO
    approvalAuthority: false,            // alçada de aprovação do perfil
    branchId: '0108',
    servicingChannel: 'BRANCH',          // ADR-0009
    servicePointId: '0108-BRAGANCA',
    deviceId: 'TAB-0108-004',
    deviceType: 'TABLET',
    deviceEnrollmentId: 'MDM-8842-A19F',  // ADR-0003 D4 — atestação
    assistanceLevel: 'ACCOMPANY',
    customerPresenceConfirmed: false,
    outcome: null,
  },

  /* ---------- companion (ADR-0003 D4 · Lei 10.741/2003) ---------- */
  companion: { present: true, declaredRelationship: 'GRANDCHILD', identified: false },

  /* ---------- accessibilityProfile (ADR-0003 D5) ---------- */
  a11y: {
    fontScale: 1.0,
    highContrast: false,
    audioGuidance: false,
    audioOutput: 'HEADPHONE',            // padrão é fone — I-01 do STRIDE
    extendedTimeouts: false,
    simplifiedLanguage: false,
    hapticFeedback: false,
  },

  /* ---------- deviceMode / Handoff (A02) ---------- */
  mode: 'OPERATOR_MODE',
  handoff: { handoffId: null, taskScope: null, stepId: null, companionDistanceConfirmed: false, mirroringSuppressed: false, expiresAt: null, expired: false },

  /* Navegação livre: só para apresentação. Permite saltar etapas pelo
     trilho; o botão Avançar continua respeitando os portões. */
  freeNav: false,
  alcance: { onb: 0, srv: 0 },           // etapa mais adiantada já alcançada
  ultimaAtividade: Date.now(),           // bloqueio por inatividade (E00)
  sessaoBloqueada: false,

  /* ---------- Cliente em atendimento ---------- */
  customer: {
    cpf: '', name: '', birth: '', mother: '', phone: '', email: '',
    income: '', occupation: '', cbo: '', purpose: '',
    address: { zip: '', street: '', num: '', city: '', state: '' },
    existing: false,
  },

  /* ---------- OnboardingCase ---------- */
  onb: {
    accountTypes: ['CHECKING'],
    eligibility: null,                   // CLEAR | RESTRICTED | UNAVAILABLE
    eligibilityId: null,
    documentType: 'RG',
    documentCondition: 'GOOD',           // GOOD|WORN|LAMINATED|HANDWRITTEN|PRE_1990
    docFront: false, docBack: false, selfie: false,
    /* Imagens realmente capturadas pela câmera (data URI). Ficam só em
       memória: nada é enviado a lugar algum neste modelo. */
    docFrontShot: null, docBackShot: null, selfieShot: null,
    documentId: null,
    docState: null,                      // 8 estados da ADR-0003 §4.1
    validScenario: 'APPROVED',           // resposta que o console manda o fornecedor devolver
    faceAttempts: 0,                     // divergências faciais já ocorridas
    docAttempts: 0,                      // recapturas de documento já feitas
    outcome: null,                       // desfecho da abertura (OUTCOMES)
    protocolo: null,
    lookup: null,                        // resultado da consulta de CPF (E02)
    appearer: 'TITULAR',                 // quem comparece: TITULAR | PROCURADOR_REG | PROCURADOR_SEM_REG
    kycDone: false,
    pepStatus: 'PENDING',
    assignedBranch: null,                // 201..204 — ADR-0010
    branchConfirmed: false,
    consentId: null,
    purposes: {
      REGISTRY_DATA_PROCESSING: null,
      THIRD_PARTY_DOCUMENT_VERIFICATION: null,
      FRAUD_INDICATOR_SHARING: null,
      BIOMETRIC_LOGIN_CREDENTIAL: null,
    },
    consentAudioPlayed: false,
    consentPrinted: false,
    pin: {
      enrollmentId: null,
      method: 'TOUCH_KEYPAD',
      confirmationMethod: 'REPEAT_ENTRY',
      status: 'PENDING',                 // 9 estados da ADR-0003 §4.2
      attempts: 0,
      maxAttempts: 3,                    // BASA_PIN_MAX_ATTEMPTS_PER_METHOD
      entry: '', confirm: '', stage: 'entry',
      exhausted: [],
      policyViolation: 0,                // quantas senhas previsíveis foram recusadas
    },
    signature: { status: 'PENDING', mode: 'SELF', witnesses: [], envelopeId: null, drawn: false },
    account: { number: null, risk: null, limit: null, status: null, credentials: null, cardRequest: null },
    /* Aprovação do supervisor com alçada antes da criação da conta (caderno de homologação
       da abertura assistida: operador e supervisor). */
    supervisorApproval: null,            // { supervisorId, em }
    biometric: 'PENDING',                // ENROLLED|FAILED|SKIPPED_NO_CONSENT
  },

  /* ---------- Servicing ---------- */
  srv: {
    task: null,
    authLevel: null,                     // BIOMETRIC | PIN | CARD_PIN
    stepUpDone: false,
    /* Autenticação da titular: obrigatória na abertura do atendimento e em cada
       transação (autenticarTitular, em app.js). */
    clientAuth: { done: false, metodo: null, em: null },
    autenticacoes: 0,
    authTx: {},                          // etapa -> transação autorizada pela titular
    pendingApproval: null,
  },

  /* ---------- Investimentos (Deposits) ----------
     Cobre os 13 requisitos de Deposits do escopo funcional: CDB/RDB em três
     modalidades, suitability, simulação, aplicação, resgate com penalidade,
     vencimento, renovação automática e tarifas.                            */
  inv: {
    /* Suitability (17.9 / 14.5.4): sem perfil válido não se aplica em nada
       que exceda o perfil — a trava é de conduta, não de sistema.          */
    suitability: {
      answers: {},                       // qid -> pontos
      profile: null,                     // CONSERVADOR | MODERADO | ARROJADO
      completedAt: null,
      expiresAt: null,                   // validade de 24 meses
      refused: false,                    // recusa registrada é caminho legítimo
    },
    simulation: null,                    // { produto, modalidade, valor, prazo, bruto, ir, iof, liquido }
    positions: [
      { id: 'APL-4471', produto: 'CDB', modalidade: 'POS', indexador: 'CDI',
        taxa: 0.98, valor: 5000, aplicadoEm: emDias(-680), vencimento: emDias(50),
        bruto: 5847.2, liquidez: 'DIARIA', tarifa: 0 },
      /* A poupança aparece na posição de investimentos (14.5.3), mas o saldo
         é o da conta poupança: fonte única, nunca um número repetido. */
      { id: 'APL-5120', produto: 'POUPANCA', modalidade: 'POUP', indexador: 'TR',
        taxa: 0.5, valor: 1200, aplicadoEm: emDias(-600), vencimento: null,
        get bruto() { return saldoPoup(); }, liquidez: 'DIARIA', tarifa: 0 },
    ],
    resgate: null,                       // { id, valor, penalidade, ir, liquido }
    renovacao: {},                       // id -> AUTOMATICA | RESGATE | REINVESTIR
    alerts: [],                          // vencimentos notificados (2.1.8)
  },

  /* ---------- Crédito (Loans) e limites (Limits) ----------
     Loans: 14.3.1, 14.3.2, 14.3.8, 15.23.1, 15.28.1, 15.28.2
     Limits: 8.3, 17.15, 19.2.1                                            */
  cred: {
    simulation: null,                    // { produto, valor, parcelas, taxa, cet, parcela, total }
    proposals: [
      { id: 'PRP-8841', produto: 'CUSTEIO_AGRICOLA', valor: 18000, parcelas: 12,
        status: 'EM_ANALISE', criadaEm: emDias(-18), etapa: 'Análise de capacidade de pagamento',
        origem: 'FNO', pendencia: 'Falta a declaração de aptidão ao Pronaf (DAP) vigente' },
      { id: 'PRP-8790', produto: 'PESSOAL', valor: 2500, parcelas: 18,
        status: 'APROVADA', criadaEm: emDias(-30), etapa: 'Aprovada, aguardando desembolso',
        origem: 'PROPRIO', pendencia: null },
    ],
    disbursed: [],                       // operações desembolsadas (15.23.1)
    /* Limites: redução vale na hora; aumento só depois da carência —
       é a trava antifraude, não lentidão de sistema.                      */
    limits: {
      tedDia: 3000, tedNoite: 1000, tedSolicitado: null, tedVigenciaEm: null,
      /* Janela noturna de 20h às 6h (Res. BCB 142/2021). */
      janelaNoturna: '20h às 6h',
      credito: { limite: 3200, usado: 412.55, risco: 'B', revisadoEm: emDias(-60) },
      monitor: [
        { em: emDias(-40), evento: 'Renda recorrente confirmada por 6 meses', efeito: 'elegível a revisão de limite' },
        { em: emDias(-110), evento: 'Atraso de 12 dias na fatura do cartão', efeito: 'limite mantido, risco reavaliado' },
      ],
    },
  },

  /* ---------- Poupança, DDA, agendamentos e comprovantes ----------
     1.2.3, 1.2.4, 15.2.9, 8.13, 8.14, 14.7.2, 14.7.5, 14.7.7,
     15.5.1–15.5.4, 15.32.1–15.32.5                                        */
  ops: {
    poupanca: {
      conta: '0108 · 84421-7', aniversario: 3,
      get saldo() { return saldoPoup(); },
      set saldo(v) { const c = contaPoup(); if (c) c.saldo = Math.round(v * 100) / 100; },
      /* Poupança só rende no aniversário: sacar antes perde o mês todo. */
      rendimentoPendente: 5.18, movimentos: [],
    },
    dda: {
      adherido: false, adesaoEm: null,
      boletos: [
        { id: 'BOL-3391', cedente: 'Centrais Elétricas do Pará', valor: 148.9,
          vence: emDias(6), status: 'A_PAGAR', linha: '82670000014 8 89010208202 6' },
        { id: 'BOL-3402', cedente: 'Cooperativa Agrícola de Bragança', valor: 320,
          vence: emDias(13), status: 'A_PAGAR', linha: '82670000032 0 00110208202 4' },
        { id: 'BOL-3288', cedente: 'Loja Móveis Norte', valor: 89.9,
          vence: emDias(-2), status: 'CONTESTADO', linha: '82670000008 9 90010208202 1',
          motivo: 'Cliente não reconhece a compra' },
      ],
    },
    /* Datas relativas a hoje: o modelo é usado em apresentações ao longo do
       tempo, e agendamento com data no passado não exercita o cancelamento. */
    agendamentos: [
      { id: 'AGD-771', tipo: 'TRANSFERENCIA', descricao: 'TED para João Batista Ferreira Lima',
        valor: 300, quando: emDias(12), status: 'AGENDADO', repete: false },
      { id: 'AGD-772', tipo: 'PAGAMENTO', descricao: 'Conta de luz (débito automático)',
        valor: 148.9, quando: emDias(7), status: 'AGENDADO', repete: true },
    ],
    comprovantes: [
      { id: 'CMP-9001', tipo: 'TRANSFERENCIA', data: emDias(-5), valor: 700,
        descricao: 'Transferência recebida de Cooperativa Agrícola', tarifa: 0 },
      { id: 'CMP-9002', tipo: 'PAGAMENTO', data: emDias(-9), valor: 148.9,
        descricao: 'Conta de luz (Centrais Elétricas do Pará)', tarifa: 0 },
      { id: 'CMP-8877', tipo: 'TED', data: emDias(-42), valor: 500,
        descricao: 'TED para outra instituição', tarifa: 12.9 },
      { id: 'CMP-8791', tipo: 'SAQUE', data: emDias(-58), valor: 200,
        descricao: 'Saque no terminal de autoatendimento', tarifa: 0 },
    ],
    /* Tarifas do período (15.32.5): isenções da conta simplificada
       precisam ficar visíveis, senão o cliente não sabe o que tem direito. */
    tarifas: [
      { nome: 'TED para outra instituição', qtd: 1, valor: 12.9, isento: false },
      { nome: 'Pix', qtd: 14, valor: 0, isento: true, obs: 'isento por norma para pessoa física' },
      { nome: 'Saque no terminal', qtd: 3, valor: 0, isento: true, obs: '4 saques por mês isentos' },
      { nome: 'Extrato impresso', qtd: 2, valor: 0, isento: true, obs: '2 extratos por mês isentos' },
      { nome: 'Manutenção da conta simplificada', qtd: 1, valor: 0, isento: true, obs: 'conta simplificada não tem tarifa de manutenção' },
    ],
    transferencia: null,                 // operação em preparo
  },

  /* ---------- Conta corrente e poupança (25 requisitos) ----------
     1.1.3, 1.1.4, 1.1.7, 1.1.8, 1.1.9, 1.1.10, 1.1.12, 1.1.13,
     1.1.74.7/12/14/15/16/17, 15.2.2, 15.2.3, 15.4.1, 15.4.2,
     15.14.1, 15.14.2, 15.14.11, 1.2.1, 1.2.9, 15.15.1, 15.15.2      */
  cc: {
    contas: [
      /* saldo = saldoInicioPeriodo + soma dos lançamentos ativos.
         Coerência verificada no QA: consulta de saldo retroativo
         (1.1.74.16) só faz sentido se as duas coisas fecharem. */
      { id: '0108-84420-9', tipo: 'CORRENTE', situacao: 'ATIVA', abertaEm: emDias(-4380),
        saldo: 1247.8, saldoAbertura: 0, saldoInicioPeriodo: -502.75, temCartao: true, bloqueado: 120,
        parametros: { limiteSaque: 800, extratoEmail: true, tarifaPacote: 'SIMPLIFICADA',
                      avisoSaldoBaixo: true, cestaServicos: 'ISENTA' } },
      { id: '0108-84421-7', tipo: 'POUPANCA', situacao: 'ATIVA', abertaEm: emDias(-1200),
        saldo: 1243.9, saldoAbertura: 0, temCartao: false, bloqueado: 0,
        parametros: { extratoEmail: false, aniversario: 3 } },
      { id: '0108-71104-2', tipo: 'CORRENTE', situacao: 'PARALISADA', abertaEm: emDias(-2900),
        saldo: 3.12, saldoAbertura: 0, temCartao: false, bloqueado: 0,
        motivoParalisia: 'Sem movimentação há 26 meses',
        parametros: { extratoEmail: false } },
    ],
    contaSel: '0108-84420-9',
    /* Consulta parametrizada (1.1.3): o atendente escolhe período e tipo. */
    filtro: { dias: 30, tipo: 'TODOS', dataRef: null },
    /* Histórico de lançamentos (1.1.9): incluir, consultar, alterar, inativar.
       Lançamento nunca é apagado — é inativado, preservando a trilha. */
    lancamentos: [
      { id: 'LAN-5501', data: emDias(-1), hist: '013', desc: 'Aposentadoria INSS', valor: 1518, tipo: 'C', ativo: true, estornavel: false },
      { id: 'LAN-5502', data: emDias(-1), hist: '027', desc: 'Pagamento farmácia', valor: -86.4, tipo: 'D', ativo: true, estornavel: true },
      { id: 'LAN-5503', data: emDias(-3), hist: '041', desc: 'Transferência recebida', valor: 700, tipo: 'C', ativo: true, estornavel: false },
      { id: 'LAN-5504', data: emDias(-5), hist: '027', desc: 'Conta de luz', valor: -148.9, tipo: 'D', ativo: true, estornavel: true },
      { id: 'LAN-5505', data: emDias(-7), hist: '027', desc: 'Supermercado', valor: -232.15, tipo: 'D', ativo: true, estornavel: true },
      { id: 'LAN-5506', data: emDias(-9), hist: '099', desc: 'Lançamento indevido: tarifa em duplicidade', valor: -12.9, tipo: 'D', ativo: false, estornavel: false, inativadoPor: 'Estorno automático de tarifa duplicada' },
    ],
    /* Cheque especial (15.4.1 / 15.4.2) e adiantamento a depositante (1.1.8)
       são produtos distintos: o primeiro é contratado, o segundo é
       liberação pontual de crédito sobre depósito não compensado.       */
    chequeEspecial: { contratado: false, limite: 0, taxaMes: 7.9, usado: 0, contratadoEm: null },
    adiantamento: { disponivel: 0, solicitado: null, depositoBase: null },
    estornos: [],
  },

  /* ---------- Cartões (14 requisitos) e visão do cliente (13) ----------
     14.4.2, 14.4.3, 14.4.6, 14.4.7, 15.1.1, 15.1.2, 15.1.3,
     15.27.1–15.27.7, 28.7.2.1 · 1.1.5, 1.1.74.1/8/9/10/11/13,
     15.2.7, 15.2.8, 16.29                                               */
  cards: {
    lista: [
      { id: 'CTZ-4471', nome: 'Cartão de débito', bandeira: 'ELO', final: '3388',
        vinculo: '0108-84420-9', situacao: 'ATIVO', funcoes: { debito: true, credito: false, exterior: false },
        limite: 0, anuidade: 0, senhaDefinida: true, aproximacao: true,
        emitidoEm: emDias(-900), entrega: null },
      { id: 'CTZ-5120', nome: 'Cartão de crédito', bandeira: 'ELO', final: '7712',
        vinculo: '0108-84420-9', situacao: 'BLOQUEADO_TEMP', funcoes: { debito: false, credito: true, exterior: false },
        limite: 3200, usado: 412.55, anuidade: 0, senhaDefinida: true, aproximacao: true,
        emitidoEm: emDias(-400), entrega: null,
        motivoBloqueio: 'Bloqueio temporário pedido pela cliente por não encontrar o cartão' },
      { id: 'CTZ-6001', nome: 'Cartão de poupança', bandeira: 'ELO', final: '9021',
        vinculo: '0108-84421-7', situacao: 'AGUARDANDO_ENTREGA', funcoes: { debito: true, credito: false, exterior: false },
        limite: 0, anuidade: 0, senhaDefinida: false, aproximacao: false,
        emitidoEm: emDias(-12),
        entrega: { transportadora: 'Correios', objeto: 'BR889210347PA', etapa: 'Em trânsito para a agência 0108',
                   previsao: emDias(4), historico: [
                     { em: emDias(-12), ev: 'Cartão solicitado na agência' },
                     { em: emDias(-9), ev: 'Cartão produzido' },
                     { em: emDias(-5), ev: 'Postado em Belém/PA' },
                     { em: emDias(-1), ev: 'Em trânsito para a agência 0108' },
                   ] } },
    ],
    cardSel: 'CTZ-5120',
    /* Tratativa registrada para cada alerta (16.29): id do alerta -> ação. */
    tratativas: {},
    /* Alertas de risco em tempo real (16.29). */
    alertas: [
      { id: 'ALR-1', em: emDias(0), nivel: 'ALTO', titulo: 'Tentativa de compra negada no exterior',
        detalhe: 'Compra de US$ 180 negada porque a função exterior está desabilitada. Se não foi a cliente, é indício de vazamento do cartão.' },
      { id: 'ALR-2', em: emDias(-2), nivel: 'MEDIO', titulo: 'Três tentativas de senha erradas no terminal',
        detalhe: 'Cartão não foi bloqueado porque parou na terceira. Vale confirmar se foi a própria cliente.' },
      { id: 'ALR-3', em: emDias(-20), nivel: 'BAIXO', titulo: 'Endereço de entrega divergente do cadastro',
        detalhe: 'Cartão de poupança endereçado à agência, não à residência. Coerente com o pedido registrado.' },
    ],
  },

  /* ---------- Navegação ---------- */
  module: 'onb',
  idx: 0,
  visited: new Set(),

  /* ---------- Trilha de auditoria (I07) ---------- */
  audit: [],
};

/* =========================================================================
   MÁQUINAS DE ESTADO — referência exibida nas telas
   ======================================================================= */

// ADR-0003 §4.1 — documentoscopia (8 estados)
const DOC_STATES = {
  SUBMITTED:          { label: 'Enviado',              tone: 'info',    desc: 'documentId persistido antes de qualquer renderização.' },
  IN_ANALYSIS:        { label: 'Em análise',           tone: 'info',    desc: 'Polling no servidor. Suspender o tablet não cancela.' },
  APPROVED:           { label: 'Aprovado',             tone: 'success', desc: 'resultStatus explícito em elemento COMPLETED.' },
  REJECTED_DOCUMENT:  { label: 'Documento recusado',   tone: 'alert',   desc: 'Recaptura permitida até BASA_DOC_RECAPTURE_MAX (2) vezes; depois, análise manual.' },
  REJECTED_FACE:      { label: 'Divergência facial',   tone: 'danger',  desc: 'Uma única nova selfie. Reincidência suspende a abertura e vai para prevenção a fraudes.' },
  MANUAL_REVIEW:      { label: 'Análise manual',       tone: 'alert',   desc: 'Documento degradado vai para pessoa. A conta só nasce depois da confirmação.' },
  INDETERMINATE:      { label: 'Indeterminado',        tone: 'alert',   desc: 'Não é rejeição nem aprovação. Protocolo e requery; a conta aguarda.' },
  CANCELLED:          { label: 'Cancelado',            tone: 'neutral', desc: 'Desistência registrada com motivo.' },
};

const DOC_RECAPTURE_MAX = 2;   // BASA_DOC_RECAPTURE_MAX
const FACE_RECAPTURE_MAX = 1;  // uma única nova selfie depois da divergência facial

// ADR-0003 D6 — cadeia de cinco métodos de PIN
const PIN_METHODS = [
  { id: 'TOUCH_KEYPAD',            n: 1, ico: 'keypad',   name: 'Teclado na tela',      desc: 'Teclado numérico no tablet, em modo cliente.' },
  { id: 'TOUCH_KEYPAD_ACCESSIBLE', n: 2, ico: 'textSize', name: 'Teclado ampliado',     desc: 'Teclas grandes, alto contraste, resposta tátil e áudio no fone.' },
  { id: 'EXTERNAL_PINPAD',         n: 3, ico: 'atm',      name: 'Pinpad físico',        desc: 'Teclado externo com teclas em relevo, pareado ao tablet.' },
  { id: 'ATM_DEFERRED',            n: 4, ico: 'atm',      name: 'Definir no terminal',  desc: 'A conta abre agora; a senha é criada no autoatendimento.' },
  { id: 'SEALED_ENVELOPE',         n: 5, ico: 'envelope', name: 'Envelope selado',      desc: 'Senha gerada pelo sistema, com troca obrigatória no primeiro uso.' },
];

// ADR-0011 — quatro finalidades independentes
const PURPOSES = [
  { id: 'REGISTRY_DATA_PROCESSING',        name: 'Usar seus dados para abrir e manter a conta',
    plain: 'Precisamos guardar seu nome, CPF, endereço e renda para abrir a conta e cumprir as regras do Banco Central.',
    required: true,  norm: 'LGPD art. 7º · Res. CMN 4.753/2019' },
  { id: 'THIRD_PARTY_DOCUMENT_VERIFICATION', name: 'Conferir seu documento com empresa parceira',
    plain: 'Enviamos a foto do seu documento e a sua selfie para uma empresa especializada confirmar que é você mesma.',
    required: true,  norm: 'LGPD art. 7º · Res. CMN 4.753/2019 art. 2º' },
  { id: 'FRAUD_INDICATOR_SHARING',         name: 'Compartilhar indícios de fraude',
    plain: 'Se houver sinal de fraude, o banco comunica ao Banco Central e a outras instituições, para proteger você.',
    required: true,  norm: 'Res. Conjunta CMN/BCB 6/2023' },
  { id: 'BIOMETRIC_LOGIN_CREDENTIAL',      name: 'Usar seu rosto para entrar no aplicativo',
    plain: 'Podemos guardar a medida do seu rosto para você entrar no banco sem digitar senha. Você pode recusar, e a conta abre do mesmo jeito.',
    required: false, norm: 'LGPD arts. 9º e 11 · recusa não bloqueia (art. 8º §5º)' },
];

/* =========================================================================
   ETAPAS — Onboarding assistido (E00–E14), dossiê Parte A §3 e C.2
   ======================================================================= */
const STEPS_ONB = [
  { id:'E00', label:'Autenticação do funcionário',        mode:'OPERATOR_MODE', min:1,   iface:['I00'],                        render:'e00' },
  { id:'E01', label:'Abertura da sessão assistida',       mode:'OPERATOR_MODE', min:3,   iface:['A01'],                        render:'e01' },
  { id:'E02', label:'Identificação por CPF e travas',     mode:'OPERATOR_MODE', min:1,   iface:['I01'],                        render:'e02' },
  { id:'E03', label:'Seleção do tipo de conta',           mode:'OPERATOR_MODE', min:2,   iface:[],                             render:'e03' },
  { id:'E04', label:'Consulta prévia regulatória',        mode:'OPERATOR_MODE', min:0.5, iface:['A04'],                        render:'e04' },
  { id:'E05', label:'Dados cadastrais declarados',        mode:'OPERATOR_MODE', min:6,   iface:[],                             render:'e05' },
  { id:'E06', label:'Captura do documento',               mode:'OPERATOR_MODE', min:3,   iface:[],                             render:'e06' },
  { id:'E07', label:'Selfie com prova de vida',           mode:'CUSTOMER_MODE', min:4,   iface:['A02','I00'], scope:'SELFIE_CAPTURE', render:'e07' },
  { id:'E08', label:'Documentoscopia e face match',       mode:'OPERATOR_MODE', min:2,   iface:['A05','A06','A07'],            render:'e08' },
  { id:'E09', label:'KYC, enriquecimento e segmentação',  mode:'OPERATOR_MODE', min:4,   iface:['I02','A14'],                  render:'e09' },
  { id:'E10', label:'Consentimento por finalidade',       mode:'CUSTOMER_MODE', min:5,   iface:['A02','A08','I00'], scope:'CONSENT', render:'e10' },
  { id:'E11', label:'Definição do PIN pela titular',      mode:'CUSTOMER_MODE', min:6,   iface:['A09','A10','A11','A12'], scope:'PIN_ENROLLMENT', render:'e11' },
  { id:'E12', label:'Assinatura do termo de adesão',      mode:'CUSTOMER_MODE', min:4,   iface:['I03'], scope:'SIGNATURE',     render:'e12' },
  { id:'E13', label:'Abertura da conta e credenciais',    mode:'OPERATOR_MODE', min:1,   iface:['I04','I05','A13','I06','I08'],render:'e13' },
  { id:'E14', label:'Comprovantes e encerramento',        mode:'OPERATOR_MODE', min:4,   iface:['A03','I07'],                  render:'e14' },
];

/* =========================================================================
   ETAPAS — Servicing assistido (S00 a S31)
   Escopo ampliado: atendimento a quem já é cliente, além da abertura de conta.
   O Banco pediu esse alcance; a lista final de serviços está em confirmação.
   ======================================================================= */
const STEPS_SRV = [
  { id:'S00', label:'Identificação e autenticação',       mode:'OPERATOR_MODE', min:3,   iface:['I01','A02'],  render:'s00', gap:false },
  { id:'S01', label:'Visão 360º ampliada',                mode:'OPERATOR_MODE', min:2,   iface:['I01','I09'],  render:'s01', gap:true  },
  { id:'S02', label:'Saldo, extrato e comprovantes',      mode:'CUSTOMER_MODE', min:4,   iface:['I10'], scope:'ACCOUNT_VIEW', render:'s02', gap:false },
  { id:'S03', label:'Chaves Pix e portabilidade',         mode:'CUSTOMER_MODE', min:5,   iface:['I11'], scope:'PIX_KEY',      render:'s03', gap:true  },
  { id:'S04', label:'Transferência Pix e TED',            mode:'CUSTOMER_MODE', min:5,   iface:['I12'], scope:'TRANSFER',     render:'s04', gap:false },
  { id:'S05', label:'Devolução Pix e MED',                mode:'OPERATOR_MODE', min:8,   iface:['I13'],  render:'s05', gap:true  },
  { id:'S06', label:'Cartões: senha, bloqueio e 2ª via',  mode:'CUSTOMER_MODE', min:5,   iface:['I14'], scope:'CARD_SERVICE', render:'s06', gap:false },
  { id:'S07', label:'Contestação de compra e fraude',     mode:'OPERATOR_MODE', min:10,  iface:['I15'],  render:'s07', gap:true  },
  { id:'S08', label:'Procurador e representante legal',   mode:'OPERATOR_MODE', min:12,  iface:['I16'],  render:'s08', gap:true  },
  { id:'S09', label:'Bloqueio judicial e restrições',     mode:'OPERATOR_MODE', min:4,   iface:['I17'],  render:'s09', gap:true  },
  { id:'S10', label:'Motor de alçadas e exceções',        mode:'OPERATOR_MODE', min:6,   iface:['I18'],  render:'s10', gap:true  },
  { id:'S11', label:'Renegociação e crédito assistido',   mode:'OPERATOR_MODE', min:12,  iface:['I19'],  render:'s11', gap:true  },
  { id:'S12', label:'Formalização e encerramento',        mode:'OPERATOR_MODE', min:4,   iface:['A03','I07','I06'], render:'s12', gap:false },

  /* ---------- Investimentos — Deposits (13 requisitos) ----------
     O handoff acontece só onde a decisão é da titular: o questionário de
     suitability e a autorização da aplicação. Consulta de posição e
     simulação são trabalho de balcão.                                     */
  { id:'S13', label:'Perfil de investidor (suitability)', mode:'CUSTOMER_MODE', min:6,  iface:['I20'], scope:'SUITABILITY', render:'s13', gap:true },
  { id:'S14', label:'Simulação de CDB, RDB e fundos',     mode:'OPERATOR_MODE', min:5,  iface:['I21'], render:'s14', gap:true },
  { id:'S15', label:'Aplicação e autorização da titular', mode:'CUSTOMER_MODE', min:4,  iface:['I21','A02'], scope:'INVESTMENT', render:'s15', gap:true },
  { id:'S16', label:'Posição, resgate e vencimentos',     mode:'OPERATOR_MODE', min:6,  iface:['I22'], render:'s16', gap:true },

  /* ---------- Crédito e limites (9 requisitos) ---------- */
  { id:'S17', label:'Simulação de crédito e custeio',     mode:'OPERATOR_MODE', min:7,  iface:['I23'], render:'s17', gap:true },
  { id:'S18', label:'Contratação e desembolso',           mode:'CUSTOMER_MODE', min:5,  iface:['I23','A02'], scope:'CREDIT_CONTRACT', render:'s18', gap:true },
  { id:'S19', label:'Propostas em acompanhamento',        mode:'OPERATOR_MODE', min:4,  iface:['I24'], render:'s19', gap:true },
  { id:'S20', label:'Limites de TED e de crédito',        mode:'OPERATOR_MODE', min:5,  iface:['I25'], render:'s20', gap:true },

  /* ---------- Poupança, DDA, agendamentos e comprovantes (17 requisitos) ---------- */
  { id:'S21', label:'Poupança e transferências SPB',      mode:'CUSTOMER_MODE', min:5,  iface:['I26','A02'], scope:'SAVINGS', render:'s21', gap:true },
  { id:'S22', label:'DDA e boletos',                      mode:'OPERATOR_MODE', min:6,  iface:['I27'], render:'s22', gap:true },
  { id:'S23', label:'Agendamentos e cancelamentos',       mode:'OPERATOR_MODE', min:4,  iface:['I28'], render:'s23', gap:true },
  { id:'S24', label:'Comprovantes e tarifas',             mode:'OPERATOR_MODE', min:4,  iface:['I29'], render:'s24', gap:true },

  /* ---------- Conta corrente e poupança (25 requisitos) ---------- */
  { id:'S25', label:'Consulta de contas e extrato',       mode:'OPERATOR_MODE', min:5,  iface:['I30'], render:'s25', gap:true },
  { id:'S26', label:'Lançamentos e estorno',              mode:'OPERATOR_MODE', min:6,  iface:['I31'], render:'s26', gap:true },
  { id:'S27', label:'Cheque especial e adiantamento',     mode:'CUSTOMER_MODE', min:5,  iface:['I32','A02'], scope:'OVERDRAFT', render:'s27', gap:true },
  { id:'S28', label:'Parâmetros, bloqueios e cadastro',   mode:'OPERATOR_MODE', min:6,  iface:['I33'], render:'s28', gap:true },

  /* ---------- Cartões e visão consolidada (27 requisitos) ---------- */
  { id:'S29', label:'Cartões: funções, limite e bloqueio', mode:'OPERATOR_MODE', min:6, iface:['I34'], render:'s29', gap:true },
  { id:'S30', label:'2ª via, entrega e senha',            mode:'CUSTOMER_MODE', min:5,  iface:['I34','A10'], scope:'CARD_PIN', render:'s30', gap:true },
  { id:'S31', label:'Visão consolidada e alertas',        mode:'OPERATOR_MODE', min:5,  iface:['I35'], render:'s31', gap:true },
];

/* Saldo da conta corrente: fonte única. Antes o valor estava repetido em
   oito lugares, então uma tela que movimentasse a conta deixava as outras
   mostrando número diferente. */
function saldoCC() {
  const c = S.cc.contas.find(x => x.tipo === 'CORRENTE' && x.situacao !== 'PARALISADA');
  return c ? c.saldo : 0;
}
function disponivelCC() {
  const c = S.cc.contas.find(x => x.tipo === 'CORRENTE' && x.situacao !== 'PARALISADA');
  return c ? c.saldo - c.bloqueado : 0;
}
function contaCC()   { return S.cc.contas.find(x => x.tipo === 'CORRENTE' && x.situacao !== 'PARALISADA'); }
function contaPoup() { return S.cc.contas.find(x => x.tipo === 'POUPANCA'); }
function saldoPoup() { const c = contaPoup(); return c ? c.saldo : 0; }

/* Movimenta a poupança. O principal da posição de investimentos (APL-5120)
   acompanha o movimento, para que depósito ou saque não virem "rendimento". */
function movimentarPoup(valor) {
  const c = contaPoup();
  if (!c) return;
  c.saldo = Math.round((c.saldo + valor) * 100) / 100;
  const pos = S.inv.positions.find(p => p.produto === 'POUPANCA');
  if (pos) pos.valor = Math.round((pos.valor + valor) * 100) / 100;
}

/* Movimenta a conta corrente gerando lançamento no histórico (1.1.9).
   Toda operação que mexe em dinheiro passa por aqui, para que saldo,
   disponível e extrato continuem fechando entre si. */
function movimentarCC(valor, desc, hist) {
  const c = contaCC();
  if (!c) return null;
  const l = { id: uid('LAN'), data: hojeISO(), hist: hist || (valor >= 0 ? '041' : '027'),
              desc, valor: Math.round(valor * 100) / 100, tipo: valor >= 0 ? 'C' : 'D',
              ativo: true, estornavel: valor < 0 };
  S.cc.lancamentos.unshift(l);
  c.saldo = Math.round((c.saldo + l.valor) * 100) / 100;
  return l;
}

/* Histórico de lançamento (1.1.9): código padronizado, como no legado. */
const HISTORICOS = [
  { cod: '013', nome: 'Crédito de benefício' },
  { cod: '027', nome: 'Débito autorizado' },
  { cod: '041', nome: 'Transferência recebida' },
  { cod: '055', nome: 'Depósito em espécie' },
  { cod: '072', nome: 'Adiantamento a depositante' },
  { cod: '099', nome: 'Ajuste ou estorno' },
];

/* Tipos de transferência exigidos por 15.5.1–15.5.4 e 14.7.7 */
const TRANSF_TIPOS = [
  { id: 'BASA_MESMO', nome: 'Entre contas suas no BASA', tarifa: 0, prazo: 'na hora',
    plain: 'Da sua conta corrente para a sua poupança, ou o contrário.' },
  { id: 'BASA_TERCEIRO', nome: 'Para outra pessoa no BASA', tarifa: 0, prazo: 'na hora',
    plain: 'Para alguém que também tem conta no Banco da Amazônia.' },
  { id: 'SPB_CC', nome: 'Da conta corrente para outro banco', tarifa: 12.9, prazo: 'até 1 dia útil',
    plain: 'TED para outro banco. Tem tarifa.' },
  { id: 'SPB_POUP', nome: 'Da poupança para outro banco', tarifa: 12.9, prazo: 'até 1 dia útil',
    plain: 'Sai direto da poupança para outro banco. Tem tarifa.' },
];

/* =========================================================================
   PRODUTOS DE CRÉDITO — requisito 14.3.8
   Inclui custeio agrícola e capital de giro, que são a vocação do banco
   (FNO), além do crédito pessoal e consignado do 15.28.1.
   ======================================================================= */
const CRED_PRODUCTS = [
  { id: 'PESSOAL', nome: 'Crédito pessoal', taxaMes: 3.89, maxParcelas: 24, teto: 15000,
    exigeMargem: false, plain: 'Dinheiro livre, parcelas fixas descontadas da conta.' },
  { id: 'CONSIGNADO', nome: 'Consignado (INSS)', taxaMes: 1.72, maxParcelas: 84, teto: 30000,
    exigeMargem: true, plain: 'Parcela sai direto do benefício. Juro menor, prazo maior.' },
  { id: 'CAPITAL_GIRO', nome: 'Capital de giro', taxaMes: 2.45, maxParcelas: 36, teto: 80000,
    exigeMargem: false, exigeCnpj: true, plain: 'Para o caixa do negócio, com carência opcional.' },
  { id: 'CUSTEIO_AGRICOLA', nome: 'Custeio agrícola (FNO)', taxaMes: 0.58, maxParcelas: 120, teto: 250000,
    exigeMargem: false, exigeDap: true, plain: 'Juro do fundo constitucional, pago após a safra.' },
  { id: 'INVESTIMENTO', nome: 'Investimento (FNO)', taxaMes: 0.71, maxParcelas: 144, teto: 400000,
    exigeMargem: false, exigeProjeto: true, plain: 'Para comprar máquina, benfeitoria ou ampliar a produção.' },
];

/* Margem consignável: 35% do benefício (Lei 14.431/2022). */
function margemConsignavel(renda) { return renda * 0.35; }

/* Parcela pelo sistema de prestação constante (Tabela Price). */
function parcelaPrice(valor, taxaMes, n) {
  const i = taxaMes / 100;
  if (i === 0) return valor / n;
  return valor * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}

/* =========================================================================
   SUITABILITY — questionário de perfil de investidor
   Requisitos 17.9 (procedimentos de suitability) e 14.5.4 (perfil).
   Perguntas em linguagem simples: o público inclui pessoas com baixa
   escolaridade e primeira experiência bancária.
   ======================================================================= */
const SUIT_QUESTIONS = [
  { id: 'Q1', ask: 'Se o dinheiro aplicado rendesse menos do que você esperava em algum mês, o que faria?',
    opts: [['Tirava tudo no mesmo dia', 1], ['Esperava mais um pouco', 2], ['Deixava, sabendo que varia', 3]] },
  { id: 'Q2', ask: 'Quando você acha que vai precisar desse dinheiro?',
    opts: [['A qualquer momento', 1], ['Daqui a mais ou menos um ano', 2], ['Só daqui a vários anos', 3]] },
  { id: 'Q3', ask: 'Você já aplicou dinheiro em algo além da poupança?',
    opts: [['Nunca', 1], ['Uma ou outra vez', 2], ['Sim, com frequência', 3]] },
  { id: 'Q4', ask: 'O que é mais importante para você?',
    opts: [['Não perder nada do que apliquei', 1], ['Um meio a meio', 2], ['Render mais, aceitando oscilar', 3]] },
];

/* Produtos de investimento — modalidades exigidas pelo requisito 2.1.1 */
const INV_PRODUCTS = [
  { id: 'CDB_PRE',   nome: 'CDB pré-fixado',      modalidade: 'PRE',    taxa: 11.2, unidade: '% ao ano',
    risco: 'CONSERVADOR', liquidez: 'No vencimento', fgc: true,
    plain: 'Você já sabe hoje quanto vai receber no fim do prazo.' },
  { id: 'CDB_POS',   nome: 'CDB pós-fixado',      modalidade: 'POS',    taxa: 98,   unidade: '% do CDI',
    risco: 'CONSERVADOR', liquidez: 'Diária após 30 dias', fgc: true,
    plain: 'Acompanha os juros do país. Rende mais se os juros subirem.' },
  { id: 'CDB_HIB',   nome: 'CDB híbrido (IPCA+)', modalidade: 'HIBRIDO', taxa: 6.1,  unidade: '% + IPCA ao ano',
    risco: 'MODERADO',    liquidez: 'No vencimento', fgc: true,
    plain: 'Protege da inflação e paga um juro fixo por cima dela.' },
  { id: 'RDB',       nome: 'RDB pré-fixado',      modalidade: 'PRE',    taxa: 11.5, unidade: '% ao ano',
    risco: 'CONSERVADOR', liquidez: 'Sem resgate antecipado', fgc: true,
    plain: 'Parecido com o CDB, mas não pode ser resgatado antes do prazo.' },
  { id: 'LCA',       nome: 'LCA do agronegócio',  modalidade: 'POS',    taxa: 92,   unidade: '% do CDI',
    risco: 'CONSERVADOR', liquidez: 'No vencimento', fgc: true, isento: true,
    plain: 'Não paga imposto de renda. Em troca, fica preso até o vencimento.' },
  { id: 'FUNDO_RF',  nome: 'Fundo de renda fixa', modalidade: 'FUNDO',  taxa: 10.4, unidade: '% ao ano estimado',
    risco: 'MODERADO',    liquidez: 'Resgate em 1 dia útil', fgc: false, taxaAdm: 0.8,
    plain: 'Um gestor cuida da aplicação. Cobra taxa e o rendimento não é garantido.' },
];

const SUIT_PROFILES = {
  CONSERVADOR: { label: 'Conservador', faixa: [4, 6],  aceita: ['CONSERVADOR'],
    plain: 'Você prefere não correr risco de perder o que aplicou.' },
  MODERADO:    { label: 'Moderado',    faixa: [7, 9],  aceita: ['CONSERVADOR', 'MODERADO'],
    plain: 'Você aceita alguma variação para render um pouco mais.' },
  ARROJADO:    { label: 'Arrojado',    faixa: [10, 12], aceita: ['CONSERVADOR', 'MODERADO', 'ARROJADO'],
    plain: 'Você aceita oscilações maiores buscando mais rendimento.' },
};

/* Imposto de renda regressivo sobre renda fixa (requisito 2.1.15: tarifas e
   encargos com transparência no extrato). */
function irRendaFixa(dias) {
  if (dias <= 180) return 0.225;
  if (dias <= 360) return 0.20;
  if (dias <= 720) return 0.175;
  return 0.15;
}

/* IOF regressivo nos 30 primeiros dias — o que torna resgate imediato ruim. */
function iofDias(dias) {
  if (dias >= 30) return 0;
  return (30 - dias) / 30;
}

/* =========================================================================
   BASE DE CPF SIMULADA (I01) — o que o cadastro devolve para cada CPF.
   Todos os CPFs são fictícios e falham no dígito verificador.
   situacao: NOVO | EXISTENTE | JUDICIAL | PROPOSTA
   ======================================================================= */
const CPF_BASE = {
  '28791433608': { situacao: 'NOVO', persona: 'dona-maria' },
  '15422087741': { situacao: 'NOVO', persona: 'padrao' },
  '10844271960': { situacao: 'EXISTENTE', name: 'Raimundo Nonato Ferreira Costa', birth: '1961-08-02',
                   detalhe: 'Conta corrente 0108-77310-4 ativa desde 2014' },
  '04188291012': { situacao: 'JUDICIAL', name: 'Joana Batista Ribeiro', birth: '1979-05-17',
                   detalhe: 'Ordem de bloqueio judicial ativa sobre o CPF (Sisbajud)' },
  '36251890477': { situacao: 'PROPOSTA', name: 'Francisca das Chagas Moura', birth: '1990-11-30',
                   detalhe: 'Proposta de abertura PRO-77K2QD em análise desde ' + dataBR(emDias(-2)) },
  '51973028695': { situacao: 'NOVO', name: 'Lucas Gabriel Souza Pinheiro', birth: emDias(-16 * 365 - 40),
                   detalhe: 'CPF sem relacionamento com o banco' },
};

/* Consulta o CPF na base simulada e devolve a situação e os dados. */
function consultarCpf(cpf) {
  const raw = String(cpf || '').replace(/\D/g, '');
  if (raw.length !== 11) return { raw, situacao: 'INCOMPLETO' };
  const b = CPF_BASE[raw];
  if (!b) return { raw, situacao: 'NOVO', name: null, birth: null, detalhe: 'CPF sem relacionamento com o banco' };
  if (b.persona) {
    const p = PERSONAS[b.persona];
    return { raw, situacao: 'NOVO', name: p.name, birth: p.birth, persona: b.persona,
             detalhe: 'CPF sem relacionamento com o banco' };
  }
  return { raw, ...b };
}

/* Idade em anos completos na data de hoje. */
function idade(birth) {
  const b = parseISO(birth), h = parseISO(hojeISO());
  if (isNaN(b)) return null;
  let a = h.getFullYear() - b.getFullYear();
  if (h.getMonth() < b.getMonth() || (h.getMonth() === b.getMonth() && h.getDate() < b.getDate())) a--;
  return a;
}

/* Desfechos possíveis da abertura de conta, exibidos em E14. */
const OUTCOMES = {
  ACCOUNT_OPENED:      { label: 'Conta aberta',                     tone: 'success' },
  PENDING_IDENTITY:    { label: 'Proposta pendente de identidade',  tone: 'alert'   },
  FRAUD_REVIEW:        { label: 'Abertura suspensa · prevenção a fraudes', tone: 'danger' },
  SERVICE_UNAVAILABLE: { label: 'Consulta indisponível · retorno agendado', tone: 'alert' },
  CANCELLED:           { label: 'Abertura cancelada',               tone: 'neutral' },
};

/* =========================================================================
   SENHA PREVISÍVEL — vale para a senha da conta (E11) e do cartão (S30).
   Recusa dígitos repetidos, sequências crescentes ou decrescentes e
   combinações da data de nascimento. Devolve o motivo, nunca a senha.
   ======================================================================= */
function senhaPrevisivel(pin, birth) {
  const s = String(pin || '');
  if (!/^\d{4}$/.test(s)) return null;
  if (/^(\d)\1{3}$/.test(s)) return 'todos os números iguais';
  const d = s.split('').map(Number);
  const passo = d[1] - d[0];
  if ((passo === 1 || passo === -1) && d.every((x, i) => i === 0 || x - d[i - 1] === passo)) return 'números em sequência';
  if (birth) {
    const b = parseISO(birth);
    if (!isNaN(b)) {
      const dd = String(b.getDate()).padStart(2, '0'), mm = String(b.getMonth() + 1).padStart(2, '0');
      const aaaa = String(b.getFullYear());
      if ([dd + mm, mm + dd, aaaa, aaaa.slice(2) + mm, dd + aaaa.slice(2)].includes(s)) return 'parte da data de nascimento';
    }
  }
  return null;
}

/* Tempo do handoff: 5 min por tarefa; o perfil "Tempo estendido"
   multiplica por 2,5 (E01). Nunca desliga o prazo. */
const HANDOFF_MIN = 5;
const INATIVIDADE_MIN = 5;
function fatorTempo() { return S.a11y.extendedTimeouts ? 2.5 : 1; }

/* Limite de transferência por tipo de conta (16.32). */
function limiteConta() {
  return S.onb.accountTypes.includes('BASIC') && S.onb.accountTypes.length === 1 ? 1000 : 5000;
}

/* =========================================================================
   Utilidades
   ======================================================================= */
function steps() { return S.module === 'onb' ? STEPS_ONB : STEPS_SRV; }
function step()  { return steps()[S.idx]; }

function uid(p) {
  return p + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function money(v) {
  // Aceita número ou string já formatada em pt-BR ("1.518,00") sem gerar NaN.
  let n;
  if (typeof v === 'number') n = v;
  else if (v === null || v === undefined || v === '') n = 0;
  else {
    const cleaned = String(v).replace(/[^\d,.-]/g, '');
    n = cleaned.indexOf(',') > -1 ? parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) : parseFloat(cleaned);
  }
  if (!isFinite(n)) n = 0;
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function maskCpf(v) {
  const d = String(v).replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/* Garante que a faixa de rastreabilidade apareça em todos os estados de uma
   tela (vazio, concluído, impedido). A matriz lê os chips exibidos; sem isso
   o requisito sumiria da matriz conforme o estado da sessão. */
function garantirTrace(html, trace) {
  if (/chip--ca/.test(html)) return html;
  const i = html.lastIndexOf('</div>');
  return i < 0 ? html + trace : html.slice(0, i) + trace + html.slice(i);
}

/* Registra evento na trilha de auditoria (I07).
   Todo evento carrega o AuditContext completo exigido pelo NFR-17. */
function audit(iface, msg) {
  const t = new Date();
  S.audit.unshift({
    t: t.toLocaleTimeString('pt-BR', { hour12: false }),
    iface,
    msg,
    ctx: {
      employeeId: S.session.operatorId,
      branchId: S.session.branchId,
      servicingChannel: S.session.servicingChannel,
      servicePointId: S.session.servicePointId,
      sessionId: S.session.sessionId || 'PRE-SESSION',
      handoffId: (S.mode === 'CUSTOMER_MODE' && S.handoff && S.handoff.handoffId) || null,
      consentId: S.onb.consentId,
      deviceMode: S.mode,
    },
  });
  if (S.audit.length > 60) S.audit.pop();
  paintAudit();
}

function paintAudit() {
  const el = document.getElementById('auditlog');
  if (!el) return;
  el.innerHTML = S.audit.map(e =>
    `<div class="log__e"><span class="log__t">${e.t}</span><span class="log__i">${e.iface}</span><span class="log__m">${e.msg}</span></div>`
  ).join('');
}

/* Personas de demonstração */
const PERSONAS = {
  'dona-maria': {
    cpf: '287.914.336-08', name: 'Maria de Nazaré Cardoso da Silva',
    birth: '1954-03-11', mother: 'Raimunda Cardoso da Silva',
    phone: '', email: '',
    income: '1518.00', occupation: 'Beneficiária do INSS', cbo: '9999-99',
    purpose: 'RECEIVE_BENEFIT',
    address: { zip: '68600-000', street: 'Travessa Sete de Setembro', num: '145', city: 'Bragança', state: 'PA' },
    a11y: { fontScale: 1.5, highContrast: true, audioGuidance: true, extendedTimeouts: true, simplifiedLanguage: true, hapticFeedback: true },
    companion: { present: true, declaredRelationship: 'GRANDCHILD' },
    docCondition: 'WORN', docType: 'RG',
    signMode: 'ROGO',
    /* O que as bases externas devolvem (simulado), para E09 comparar com
       o declarado. 16.6 e 16.22: enriquecimento e legitimidade da renda. */
    verificado: { renda: 'R$ 1.518,00 · benefício do INSS', fonteRenda: 'extrato de benefício (simulado)',
                  telefone: 'nenhum telefone associado', endereco: 'confere com fatura de energia (simulado)',
                  obito: 'não consta', vinculos: 'neta declarada como acompanhante' },
  },
  'padrao': {
    cpf: '154.220.877-41', name: 'João Batista Ferreira Lima',
    birth: '1988-07-22', mother: 'Antônia Ferreira Lima',
    phone: '(91) 98844-1207', email: 'joao.lima@email.com',
    income: '4200.00', occupation: 'Comerciante', cbo: '5211-05',
    purpose: 'DAILY_BANKING',
    address: { zip: '66055-050', street: 'Avenida Nazaré', num: '820', city: 'Belém', state: 'PA' },
    a11y: { fontScale: 1.0, highContrast: false, audioGuidance: false, extendedTimeouts: false, simplifiedLanguage: false, hapticFeedback: false },
    companion: { present: false, declaredRelationship: 'NONE' },
    docCondition: 'GOOD', docType: 'CNH',
    signMode: 'SELF',
    verificado: { renda: 'faturamento compatível com R$ 4.200,00 mensais', fonteRenda: 'Receita Federal e Junta Comercial (simulado)',
                  telefone: '(91) 98844-1207', endereco: 'confere com cadastro da Receita (simulado)',
                  obito: 'não consta', vinculos: 'sócio de comércio varejista (CNAE 4712-1/00)' },
  },
};
let PERSONA = 'dona-maria';
