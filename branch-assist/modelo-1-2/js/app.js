/* ============================================================================
   Branch Assist — Runtime de navegação
   Renderiza as telas, controla OPERATOR_MODE / CUSTOMER_MODE, dispara o
   ritual de handoff e aplica o accessibilityProfile.

   Contrato de cada tela (SCREENS.<render>):
     render()  devolve o HTML
     bind()    liga os eventos (opcional)
     gate()    devolve null para liberar o Avançar, ou o motivo do bloqueio
               em texto para quem está com o tablet (opcional)
     onNext()  efeitos ao sair da etapa (opcional). Pode devolver
               { ir: 'E07' } ou { ir: 'S09', modulo: 'srv' } para desviar.
   ========================================================================== */

/* ---------------------------------------------------------------- INÍCIO */
function aplicarPersona(id) {
  PERSONA = id;
  const p = PERSONAS[id];
  Object.assign(S.a11y, p.a11y);
  Object.assign(S.companion, p.companion);
  Object.assign(S.customer, {
    name: p.name, birth: p.birth, mother: p.mother, phone: p.phone, email: p.email,
    income: p.income, occupation: p.occupation, cbo: p.cbo, purpose: p.purpose,
    cpf: p.cpf.replace(/\D/g, ''), address: { ...p.address }, existing: false,
  });
  S.onb.documentCondition = p.docCondition;
  S.onb.documentType = p.docType;
  S.onb.signature.mode = p.signMode;
  S.onb.lookup = null;
  S.onb.appearer = 'TITULAR';
}

/* Faixa de rastreabilidade fixa por tela: lida uma vez no estado inicial e
   garantida em todos os estados seguintes (vazio, concluído, recusado).
   Assim a matriz não perde requisito conforme o atendimento avança. */
function fixarTraces() {
  const tmp = document.createElement('div');
  STEPS_ONB.concat(STEPS_SRV).forEach(st => {
    const scr = SCREENS[st.render];
    if (!scr || scr._traceFixo) return;
    let html = '';
    try { html = scr.render(); } catch (e) { html = ''; }
    tmp.innerHTML = html;
    const ca = tmp.querySelector('.chip--ca');
    if (!ca) return;
    const faixa = (ca.closest('.trace') || ca.parentElement).outerHTML;
    const original = scr.render;
    scr.render = function () { return garantirTrace(original.call(this), faixa); };
    scr._traceFixo = true;
  });
  tmp.innerHTML = '';
}

function boot() {
  aplicarPersona(PERSONA);
  fixarTraces();
  S.srv.request = 'Não consigo usar o cartão que cancelaram. E quero ver o extrato do mês passado.';

  Fala.init();
  pintarOperador();
  applyA11y();
  paintConsole();
  wireConsole();
  render();
  audit('I07', 'Modelo Branch Assist iniciado · Branch Assist · 1280×800');
  audit('A01', `Recursos do dispositivo · voz ${Fala.supported ? 'disponível' : 'indisponível'}`
              + ` · câmera ${Camera.supported ? 'disponível' : 'indisponível'}`);
}

/* Papel do atendente no topo, conforme o perfil de acesso escolhido em E00. */
function pintarOperador() {
  const el = document.querySelector('.operator__role');
  if (el) el.textContent = `${PERFIS_ACESSO[S.session.operatorProfile].papel} · 0108 Bragança`;
}

/* ---------------------------------------------------------------- A11Y */
function applyA11y() {
  const r = document.documentElement;
  r.style.setProperty('--a11y-font-scale', S.a11y.fontScale);
  r.dataset.contrast = S.a11y.highContrast ? 'high' : 'normal';
  document.querySelectorAll('[data-a11y]').forEach(b => {
    const k = b.dataset.a11y;
    const on = k === 'fontScale' ? S.a11y[k] > 1 : !!S.a11y[k];
    b.setAttribute('aria-checked', on);
  });
  document.querySelectorAll('[data-flag]').forEach(b => {
    const k = b.dataset.flag;
    if (k === 'companion') b.setAttribute('aria-checked', S.companion.present);
    if (k === 'medAck') b.setAttribute('aria-checked', !!S.srv.medAck);
    if (k === 'freeNav') b.setAttribute('aria-checked', !!S.freeNav);
  });
}

function toggleA11y(k) {
  if (k === 'fontScale') S.a11y.fontScale = S.a11y.fontScale > 1 ? 1 : 1.5;
  else S.a11y[k] = !S.a11y[k];
  applyA11y();
  if (k === 'fontScale' || k === 'highContrast') render();
  audit('A01', `Perfil de acessibilidade alterado: ${k}`);
}

/* ---------------------------------------------------------------- RAIL */
function paintRail() {
  const list = steps();
  const el = document.getElementById('rail-steps');
  el.innerHTML = list.map((s, i) => {
    const done = S.visited.has(s.id) && i < S.idx;
    const isCust = s.mode === 'CUSTOMER_MODE';
    const travada = S.module === 'onb' && !S.freeNav && i > S.alcance.onb;
    return `
      <li>
        <button class="step" data-i="${i}" ${i === S.idx ? 'aria-current="step"' : ''} data-done="${done}" ${travada ? 'data-locked="true" aria-disabled="true"' : ''}>
          <span class="step__num">${done ? ico('check', 12, 2.5) : s.id}</span>
          <span class="step__body">
            <span class="step__label">${s.label}</span>
            <span class="step__meta">
              <span class="step__mode ${isCust ? 'step__mode--cust' : 'step__mode--op'}"></span>
              ${isCust ? 'cliente' : 'funcionário'} · ${s.min} min${s.gap ? ' · <b>escopo ampliado</b>' : ''}
            </span>
          </span>
        </button>
      </li>`;
  }).join('');

  el.querySelectorAll('.step').forEach(b => b.onclick = () => {
    if (overlayAberto()) return;
    const i = +b.dataset.i;
    if (i === S.idx) return;
    const target = list[i];
    if (S.module === 'onb' && !S.freeNav && i > S.alcance.onb) {
      bloquear(step(), `A etapa ${target.id} ainda não foi alcançada. Conclua as anteriores pelo botão Avançar, ou ligue a navegação livre no console de apresentação.`);
      return;
    }
    if (S.module === 'onb' && i > S.alcance.onb) audit('I07', `Navegação livre: salto para ${target.id} sem passar pelos portões anteriores`);
    irParaIndice(i);
  });

  const cpfRail = S.module === 'srv' ? S.customer.cpf : (S.onb.lookup ? S.onb.lookup.raw : '');
  document.getElementById('rail-module').textContent = S.module === 'onb' ? 'Onboarding assistido' : 'Servicing assistido';
  document.getElementById('rail-case').textContent = S.module === 'onb' ? 'Nova proposta' : (S.srv.task || 'Atendimento');
  document.getElementById('rail-cpf').textContent = cpfRail ? maskCpf(cpfRail) : 'Aguardando identificação';
  document.getElementById('tag-module').textContent = S.module === 'onb' ? 'Onboarding assistido' : 'Servicing assistido';
  document.querySelectorAll('[data-module]').forEach(b => b.setAttribute('aria-selected', b.dataset.module === S.module));
}

/* ---------------------------------------------------------------- RENDER */
/* Etapa da cliente com o tablet ainda nas mãos do atendente: a tela da
   cliente não aparece para ele. Mostra só o convite para entregar o tablet. */
function telaHandoffPendente(st) {
  const expirou = S.handoff && S.handoff.expired && S.handoff.stepId === st.id;
  return `
    <div class="wrap">
      <div class="h-eyebrow">${ico('handoff', 14)} A02 · Tarefa da cliente</div>
      <h1 class="h1">${st.label}</h1>
      <p class="lede">Esta etapa é decidida pela própria cliente, com o tablet nas mãos dela. A tela não é exibida ao atendente.</p>
      ${expirou ? `
      <div class="note note--alert">
        <span class="note__ic">${ico('clock', 18)}</span>
        <div><b>A tarefa anterior foi interrompida porque o tempo acabou.</b> <span class="muted">Nada foi concluído nem registrado como feito pela cliente. Entregue o tablet de novo quando ela estiver pronta.</span></div>
      </div>` : ''}
      <div class="note note--info">
        <span class="note__ic">${ico('info', 18)}</span>
        <div><b>Prazo da tarefa.</b> <span class="muted">${minutosTxt(HANDOFF_MIN)} minutos${S.a11y.extendedTimeouts ? ', com tempo estendido' : ''}. Ao fim do prazo, o tablet volta ao atendente sem concluir a etapa.</span></div>
      </div>
    </div>`;
}

function render() {
  const st = step();
  const scr = SCREENS[st.render];
  const pendente = st.mode === 'CUSTOMER_MODE' && S.mode !== 'CUSTOMER_MODE';
  document.documentElement.dataset.mode = S.mode;
  document.getElementById('mb-mode').textContent = S.mode === 'CUSTOMER_MODE' ? 'Modo cliente' : 'Modo funcionário';
  document.getElementById('mb-scope').textContent = S.mode === 'CUSTOMER_MODE'
    ? (st.scope || 'TASK').replace(/_/g, ' ').toLowerCase() + ' · entrega do tablet à titular'
    : 'Esteira de atendimento · acesso completo';
  document.getElementById('mb-session').textContent = 'sessão ' + (S.session.sessionId || '—');

  /* Troca de tela encerra câmera e voz: nenhum recurso do dispositivo fica
     ativo fora da etapa que o pediu (privacidade da titular). */
  if (typeof Camera !== 'undefined') Camera.fechar();
  if (typeof Fala !== 'undefined') Fala.parar();

  const canvas = document.getElementById('canvas');
  canvas.innerHTML = pendente ? telaHandoffPendente(st) : scr.render();
  canvas.scrollTop = 0;
  if (!pendente && scr.bind) scr.bind(canvas);

  document.getElementById('hint').innerHTML = pendente ? 'A02 · a etapa só começa depois do ritual de entrega do tablet.' : (scr.hint || '');
  document.getElementById('btn-next').innerHTML = pendente
    ? ico('handoff', 18) + ' Entregar o tablet à cliente'
    : ((typeof scr.nextLabel === 'function' ? scr.nextLabel() : scr.nextLabel) || 'Avançar') + ' ' + ico('arrowRight', 18);
  document.getElementById('btn-back').disabled = S.idx === 0;
  document.getElementById('btn-back').innerHTML = ico('arrowLeft', 18) + ' Voltar';

  const cust = S.mode === 'CUSTOMER_MODE';
  document.getElementById('btn-back').hidden = cust;
  document.getElementById('hint').hidden = cust;

  applyA11y();
  paintRail();
  paintConsole();
}

/* Mostra o motivo do bloqueio no topo da etapa e registra na trilha. */
function bloquear(st, motivo) {
  const canvas = document.getElementById('canvas');
  const antigo = canvas.querySelector('.gate');
  if (antigo) antigo.remove();
  const el = document.createElement('div');
  el.className = 'gate note note--danger';
  el.setAttribute('role', 'alert');
  el.tabIndex = -1;
  el.innerHTML = `<span class="note__ic">${ico('alert', 18)}</span><div><b>${S.mode === 'CUSTOMER_MODE' ? 'Ainda falta uma coisa.' : 'Não é possível avançar.'}</b> <span>${motivo}</span></div>`;
  canvas.prepend(el);
  canvas.scrollTop = 0;
  el.focus();
  audit('I07', `Avanço bloqueado em ${st.id} · ${String(motivo).replace(/<[^>]+>/g, '')}`);
}

/* ---------------------------------------------------------------- NAV */
function next() {
  if (overlayAberto()) return;
  const st = step();
  const scr = SCREENS[st.render];

  if (st.mode === 'CUSTOMER_MODE' && S.mode !== 'CUSTOMER_MODE') { requestHandoff(st); return; }

  const motivo = scr.gate ? scr.gate() : null;
  if (motivo) { bloquear(st, motivo); return; }

  const r = scr.onNext ? scr.onNext() : undefined;
  S.visited.add(st.id);
  if (r && r.ir) { irPara(r.ir, r.modulo, { desvio: true }); return; }
  if (S.idx === steps().length - 1) { render(); return; }
  irParaIndice(S.idx + 1);
}

function back() {
  if (overlayAberto()) return;
  if (S.mode === 'CUSTOMER_MODE') return;
  if (S.idx === 0) return;
  irParaIndice(S.idx - 1);
}

/* Vai para uma etapa pelo id, trocando de módulo se preciso. */
/* Desvio (onNext com destino) não conta como etapa alcançada: saltar de E04
   para E14 por indisponibilidade não libera E05 a E13 no trilho. */
function irPara(id, modulo, opts = {}) {
  if (modulo && modulo !== S.module) trocarModulo(modulo, `desvio a partir de ${step().id}`);
  const i = steps().findIndex(s => s.id === id);
  if (i < 0) { render(); return; }
  irParaIndice(i, opts);
}

function irParaIndice(i, opts = {}) {
  S.idx = i;
  if (!opts.desvio) S.alcance[S.module] = Math.max(S.alcance[S.module], i);
  const ns = step();
  if (ns.mode === 'CUSTOMER_MODE' && S.mode !== 'CUSTOMER_MODE') requestHandoff(ns);
  else if (ns.mode !== 'CUSTOMER_MODE' && S.mode === 'CUSTOMER_MODE') returnToOperator(ns);
  else { if (ns.mode === 'CUSTOMER_MODE') renovarHandoff(ns); render(); }
}

function trocarModulo(mod, motivo) {
  if (S.mode === 'CUSTOMER_MODE') {
    const hid = (S.handoff && S.handoff.handoffId) || 's/n';
    audit('A02', `Handoff.customerToOperator · ${hid} interrompido por troca de módulo`);
    S.mode = 'OPERATOR_MODE';
    if (S.handoff) S.handoff.expiresAt = null;
  }
  S.module = mod;
  S.idx = 0;
  audit('I07', `Módulo alterado para ${mod === 'onb' ? 'onboarding assistido' : 'servicing assistido'}${motivo ? ' · ' + motivo : ''}`);
}

/* ------------------------------------------------------- OVERLAYS */
/* Enquanto um overlay está aberto (handoff, devolução, bloqueio), o resto da
   página fica inerte: nem mouse nem teclado alcançam trilho, abas ou console. */
const ATRAS_DO_OVERLAY = ['.console', '.modebar', '.topbar', '.body', '.legend'];
function overlayAberto() { return !!document.querySelector('#overlay-host .overlay'); }
function abrirOverlay(html) {
  document.getElementById('overlay-host').innerHTML = html;
  ATRAS_DO_OVERLAY.forEach(sel => document.querySelectorAll(sel).forEach(el => { el.inert = true; }));
  return document.getElementById('overlay-host');
}
function fecharOverlay() {
  document.getElementById('overlay-host').innerHTML = '';
  ATRAS_DO_OVERLAY.forEach(sel => document.querySelectorAll(sel).forEach(el => { el.inert = false; }));
}

/* ------------------------------------------------------- HANDOFF (D4) */
const HANDOFF_CHECKS = [
  { id: 'td', t: 'Tablet entregue à cliente', d: 'A cliente segura o aparelho. O atendente não opera a tela.', req: 'obrigatório' },
  { id: 'ac', t: 'Acompanhante afastado da tela', d: 'O acompanhante não acompanha a selfie, a senha ou a assinatura.', req: 'quando houver acompanhante', companion: true },
  { id: 'av', t: 'Cliente avisada do que vai acontecer', d: 'Ela sabe que é com ela, por quanto tempo e o que será pedido.', req: 'obrigatório' },
  { id: 'au', t: 'Idioma e acessibilidade confirmados', d: 'Ajustes de fonte, contraste e áudio já valem para esta tarefa.', req: 'obrigatório' },
];

/* Prazo em minutos já com o fator de tempo estendido, no formato pt-BR. */
function minutosTxt(base) { return (base * fatorTempo()).toLocaleString('pt-BR', { maximumFractionDigits: 1 }); }

function prazoHandoffMs() { return HANDOFF_MIN * 60 * 1000 * fatorTempo(); }

function requestHandoff(target) {
  if (overlayAberto()) return;
  const st = target || step();
  const aplicaveis = HANDOFF_CHECKS.filter(c => !c.companion || S.companion.present);
  const companhiaNaAbertura = S.companion.present;
  const host = abrirOverlay(`
    <div class="overlay">
      <div class="handoff">
        <div class="handoff__dir">${ico('handoff', 18)} <b>OPERADOR</b> ${ico('arrowRight', 16)} <b>CLIENTE</b> ${ico('arrowRight', 16)} <b>OPERADOR</b></div>
        <h1 class="handoff__title">O tablet vai para a cliente</h1>
        <p class="handoff__sub">“${st.label}” é uma tarefa da própria cliente. Confirme os pontos abaixo antes de passar o aparelho. Prazo da tarefa: ${minutosTxt(HANDOFF_MIN)} min.</p>
        <div class="checklist">
          ${HANDOFF_CHECKS.map(c => {
            const na = c.companion && !S.companion.present;
            return `
            <button class="check" role="checkbox" aria-checked="${na ? 'mixed' : 'false'}" data-hc="${c.id}" ${na ? 'disabled data-na="true"' : ''}>
              <span class="check__box">${na ? ico('minus', 14, 3) : ''}</span>
              <span>
                <span class="check__t">${c.t}</span>
                <span class="check__d">${na ? 'Cliente sem acompanhante nesta sessão.' : c.d}</span>
                <span class="check__req">${na ? 'não se aplica' : c.req}</span>
              </span>
            </button>`;
          }).join('')}
        </div>
        <div class="inline" style="justify-content:center">
          <button class="btn btn--ghost" data-ho="cancel" style="color:#fff;border-color:#ffffff59">Voltar</button>
          <button class="btn btn--cta btn--lg" data-ho="go" disabled>${ico('handoff', 18)} Entregar o tablet à cliente</button>
        </div>
      </div>
    </div>`);

  const checks = new Set();
  const go = host.querySelector('[data-ho="go"]');
  host.querySelectorAll('[data-hc]:not([data-na])').forEach(b => b.onclick = () => {
    const id = b.dataset.hc;
    if (checks.has(id)) checks.delete(id); else checks.add(id);
    b.setAttribute('aria-checked', checks.has(id));
    b.querySelector('.check__box').innerHTML = checks.has(id) ? ico('check', 16, 3) : '';
    go.disabled = checks.size < aplicaveis.length;
  });
  /* Desistir do handoff mantém a etapa da cliente, sem mostrar a tela dela. */
  host.querySelector('[data-ho="cancel"]').onclick = () => { fecharOverlay(); render(); };
  go.onclick = () => {
    /* A presença de acompanhante mudou com o painel aberto: refaz as confirmações. */
    if (S.companion.present !== companhiaNaAbertura) { fecharOverlay(); requestHandoff(st); return; }
    S.mode = 'CUSTOMER_MODE';
    S.handoff = {
      handoffId: uid('HOF'),
      taskScope: st.scope || 'CLIENT_TASK',
      stepId: st.id,
      companionDistanceConfirmed: S.companion.present ? checks.has('ac') : null,
      mirroringSuppressed: true,
      expiresAt: Date.now() + prazoHandoffMs(),
      expired: false,
    };
    audit('A02', `Handoff.operatorToCustomer · escopo ${S.handoff.taskScope} · ${S.handoff.handoffId}`
               + ` · prazo ${minutosTxt(HANDOFF_MIN)} min`
               + (S.companion.present ? '' : ' · sem acompanhante'));
    fecharOverlay();
    render();
  };
}

/* Duas tarefas seguidas da cliente (E10, E11, E12): o tablet continua com
   ela, e cada tarefa ganha o seu próprio prazo. */
function renovarHandoff(st) {
  if (!S.handoff) return;
  S.handoff.taskScope = st.scope || 'CLIENT_TASK';
  S.handoff.stepId = st.id;
  S.handoff.expiresAt = Date.now() + prazoHandoffMs();
  S.handoff.expired = false;
  audit('A02', `Handoff ${S.handoff.handoffId} renovado para ${st.id} · escopo ${S.handoff.taskScope}`);
}

/* Campo de reautenticação do atendente, usado na devolução do tablet e no
   desbloqueio por inatividade. O valor nunca vai para a trilha. */
function campoReauth(id) {
  return `
    <div class="reauth">
      <label class="reauth__lbl" for="${id}">PIN do atendente · ${S.session.operatorId}</label>
      <input class="reauth__in" id="${id}" type="password" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="6 dígitos">
    </div>`;
}
function ligarReauth(host, inputId, botao) {
  const inp = host.querySelector('#' + inputId);
  const ok = () => /^\d{6}$/.test(inp.value);
  botao.disabled = true;
  inp.oninput = () => { inp.value = inp.value.replace(/\D/g, '').slice(0, 6); botao.disabled = !ok(); };
  inp.onkeydown = (e) => { if (e.key === 'Enter' && ok()) botao.click(); };
  setTimeout(() => inp.focus(), 0);
}

function returnToOperator(target, opts = {}) {
  if (overlayAberto()) return;
  const st = target || step();
  const expirado = !!opts.expirado;
  const host = abrirOverlay(`
    <div class="overlay">
      <div class="handoff">
        <div class="handoff__dir">${ico('handoff', 18)} <b>CLIENTE</b> ${ico('arrowRight', 16)} <b>OPERADOR</b></div>
        <h1 class="handoff__title">${expirado ? 'O tempo da tarefa acabou' : 'O tablet volta para o atendente'}</h1>
        <p class="handoff__sub">${expirado
          ? `A tarefa “${st.label}” não foi concluída. O tablet volta ao atendente e a etapa continua pendente.`
          : `“${st.label}” volta para o atendente. A tela da cliente some, e a visão de agência reaparece inteira, inclusive as telas que ela não pode ver.`}</p>
        <div class="checklist">
          <div class="check" style="cursor:default">
            <span class="check__box" style="background:var(--c-neon-padrao);border-color:var(--c-neon-padrao)">${ico('check', 16, 3)}</span>
            <span><span class="check__t">Espelhamento suprimido</span>
            <span class="check__d">A tela da cliente nunca é espelhada em monitor do balcão.</span></span>
          </div>
          <div class="check" style="cursor:default">
            <span class="check__box" style="background:var(--c-neon-padrao);border-color:var(--c-neon-padrao)">${ico(expirado ? 'clock' : 'check', 16, 3)}</span>
            <span><span class="check__t">${expirado ? 'Tarefa interrompida por tempo' : 'Tarefa da cliente concluída'}</span>
            <span class="check__d">${expirado ? 'Fica registrado no handoff que a etapa não foi feita.' : 'O que ela fez fica registrado no handoff, com horário.'}</span></span>
          </div>
        </div>
        ${campoReauth('ro-pin')}
        <div class="inline" style="justify-content:center">
          <button class="btn btn--cta btn--lg" data-ro="go">${ico('handoff', 18)} Retomar como atendente</button>
        </div>
      </div>
    </div>`);
  const go = host.querySelector('[data-ro="go"]');
  ligarReauth(host, 'ro-pin', go);
  go.onclick = () => {
    const hid = (S.handoff && S.handoff.handoffId) || 's/n';
    audit('A02', `Handoff.customerToOperator · ${hid} ${expirado ? 'interrompido por tempo, etapa ' + st.id + ' não concluída' : 'encerrado'}`);
    S.mode = 'OPERATOR_MODE';
    if (S.handoff) S.handoff.expiresAt = null;
    audit('I00', 'Funcionário reautenticado na devolução do tablet');
    S.ultimaAtividade = Date.now();
    fecharOverlay();
    render();
  };
}

/* Bloqueio por inatividade do atendente (E00): mesma credencial. */
function bloquearSessao() {
  S.sessaoBloqueada = true;
  audit('I00', `Sessão bloqueada por inatividade de ${minutosTxt(INATIVIDADE_MIN)} min`);
  const host = abrirOverlay(`
    <div class="overlay">
      <div class="handoff">
        <div class="handoff__dir">${ico('lock', 18)} <b>SESSÃO BLOQUEADA</b></div>
        <h1 class="handoff__title">Tablet bloqueado por inatividade</h1>
        <p class="handoff__sub">Nenhum dado da cliente fica visível enquanto o atendente não se autentica de novo. O atendimento continua de onde parou.</p>
        ${campoReauth('lk-pin')}
        <div class="inline" style="justify-content:center">
          <button class="btn btn--cta btn--lg" data-lk="go">${ico('lock', 18)} Desbloquear</button>
        </div>
      </div>
    </div>`);
  const go = host.querySelector('[data-lk="go"]');
  ligarReauth(host, 'lk-pin', go);
  go.onclick = () => {
    S.sessaoBloqueada = false;
    S.ultimaAtividade = Date.now();
    audit('I00', 'Sessão desbloqueada · funcionário reautenticado');
    fecharOverlay();
    render();
  };
}

/* ---------------------------------------------------------------- AUTENTICAÇÃO DA TITULAR */
/* Regra do atendimento: toda transação pede a autenticação da própria titular, no método
   escolhido em S00 (biometria, senha de 4 números ou senha do cartão). O atendente não vê o
   que ela digita, e nada do que é digitado vai para a trilha. */
const METODOS_TITULAR = {
  BIOMETRIC: { nome: 'biometria facial', ic: 'face' },
  PIN:       { nome: 'senha de 4 números', ic: 'lock' },
  CARD_PIN:  { nome: 'senha do cartão', ic: 'card' },
};

function autenticarTitular(motivo, aoConcluir) {
  if (overlayAberto()) return;
  const metodo = S.srv.authLevel || 'PIN';
  const m = METODOS_TITULAR[metodo];
  const porSenha = metodo !== 'BIOMETRIC';
  const teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'limpar', '0', 'apagar'];
  const host = abrirOverlay(`
    <div class="overlay">
      <div class="handoff">
        <div class="handoff__dir">${ico('shield', 18)} <b>AUTENTICAÇÃO DA TITULAR</b></div>
        <h1 class="handoff__title">${porSenha ? 'A titular confirma com a senha' : 'A titular confirma com a biometria'}</h1>
        <p class="handoff__sub">${motivo}. ${porSenha
          ? `Ela digita a ${m.nome} no teclado do tablet; o atendente não vê os números.`
          : 'Ela olha para a câmera do tablet; o reconhecimento é simulado neste modelo.'}</p>
        ${porSenha ? `
        <div class="pin__dots" aria-hidden="true">${[0, 1, 2, 3].map(i => `<span class="pin__dot" data-ad="${i}"></span>`).join('')}</div>
        <div class="keypad keypad--titular">
          ${teclas.map(t => /\d/.test(t)
            ? `<button type="button" data-tecla="${t}" aria-label="${t}">${t}</button>`
            : `<button type="button" data-act="${t}">${t === 'limpar' ? 'Limpar' : 'Apagar'}</button>`).join('')}
        </div>` : ''}
        <div class="inline" style="justify-content:center">
          <button class="btn btn--ghost" data-at="cancel" style="color:#fff;border-color:#ffffff59">Cancelar</button>
          <button class="btn btn--cta btn--lg" data-at="go" ${porSenha ? 'disabled' : ''}>${ico(m.ic, 18)} ${porSenha ? 'Confirmar' : 'Simular reconhecimento'}</button>
        </div>
      </div>
    </div>`);
  let digitos = '';
  const go = host.querySelector('[data-at="go"]');
  const pinta = () => {
    host.querySelectorAll('[data-ad]').forEach(d => d.dataset.filled = Number(d.dataset.ad) < digitos.length);
    go.disabled = porSenha && digitos.length < 4;
  };
  host.querySelectorAll('[data-tecla]').forEach(b => b.onclick = () => { if (digitos.length < 4) digitos += b.dataset.tecla; pinta(); });
  host.querySelectorAll('.keypad--titular [data-act]').forEach(b => b.onclick = () => { digitos = b.dataset.act === 'limpar' ? '' : digitos.slice(0, -1); pinta(); });
  host.querySelector('[data-at="cancel"]').onclick = () => {
    audit('A02', `Autenticação da titular cancelada · ${motivo} · nada foi feito`);
    fecharOverlay();
    render();
  };
  go.onclick = () => {
    digitos = '';
    S.srv.clientAuth = { done: true, metodo, em: new Date().toISOString() };
    S.srv.autenticacoes = (S.srv.autenticacoes || 0) + 1;
    audit('A02', `Titular autenticada por ${m.nome} · ${motivo}`);
    fecharOverlay();
    aoConcluir();
  };
}

/* Bloco de autorização para transação que se efetiva no Avançar (S04, S07): o botão pede a
   autenticação, e o gate() da etapa segura o Avançar até ela acontecer. */
function blocoAutorizacao(etapa, motivo) {
  return S.srv.authTx[etapa]
    ? `<div class="note note--success mt-16"><span class="note__ic">${ico('shield', 18)}</span><div><b>Autorizada pela titular.</b> <span class="muted">${motivo} confirmada com ${METODOS_TITULAR[S.srv.authLevel || 'PIN'].nome}.</span></div></div>`
    : `<div class="spread mt-16"><span class="tiny muted">${motivo} só segue com a autenticação da titular.</span>
        <button class="btn btn--cta" data-authtx="${etapa}" data-motivo="${motivo}">${ico('shield', 18)} Autorizar com a titular</button></div>`;
}

/* Envolve a ação de um botão: a ação só roda depois da autenticação da titular. */
function comTitular(motivo, acao) {
  return (...args) => autenticarTitular(motivo, () => acao(...args));
}

/* ---------------------------------------------------------------- CONSOLE */
function paintConsole() {
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  set('cv-channel', S.session.servicingChannel);
  set('cv-point', S.session.servicePointId);
  set('cv-session', S.session.sessionId || '—');
  set('cv-mode', S.mode === 'CUSTOMER_MODE' ? 'CUSTOMER' : 'OPERATOR');
  set('cv-handoff', (S.mode === 'CUSTOMER_MODE' && S.handoff && S.handoff.handoffId) || '—');
  document.querySelectorAll('[data-persona]').forEach(b => b.setAttribute('aria-selected', b.dataset.persona === PERSONA));
  document.querySelectorAll('[data-valid]').forEach(b => b.setAttribute('aria-selected', b.dataset.valid === S.onb.validScenario));
}

function alternarFlag(k) {
  if (k === 'companion') { S.companion.present = !S.companion.present; audit('A01', `Acompanhante ${S.companion.present ? 'presente' : 'ausente'}`); render(); }
  if (k === 'medAck') { S.srv.medAck = !S.srv.medAck; render(); }
  if (k === 'freeNav') { S.freeNav = !S.freeNav; audit('I07', `Navegação livre de apresentação ${S.freeNav ? 'ligada' : 'desligada'}`); render(); }
}

function wireConsole() {
  const bm = document.getElementById('btn-matriz');
  if (bm) bm.onclick = () => Matriz.abrir();

  document.getElementById('btn-next').onclick = next;
  document.getElementById('btn-back').onclick = back;

  document.querySelectorAll('[data-a11y]').forEach(b => b.onclick = () => toggleA11y(b.dataset.a11y));
  document.querySelectorAll('.console [data-flag]').forEach(b => b.onclick = () => alternarFlag(b.dataset.flag));

  document.querySelectorAll('[data-persona]').forEach(b => b.onclick = () => {
    if (b.dataset.persona === PERSONA) return;
    aplicarPersona(b.dataset.persona);
    applyA11y();
    audit('A01', `Persona de demonstração alterada: ${PERSONA} · dados da cliente recarregados`);
    render();
  });

  document.querySelectorAll('[data-valid]').forEach(b => b.onclick = () => {
    S.onb.validScenario = b.dataset.valid;
    audit('A06', `Cenário do fornecedor de validação: ${b.dataset.valid}`);
    render();
  });

  document.querySelectorAll('[data-module]').forEach(b => b.onclick = () => {
    if (overlayAberto() || b.dataset.module === S.module) return;
    trocarModulo(b.dataset.module);
    render();
  });

  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { S.ultimaAtividade = Date.now(); }, true));

  setInterval(() => {
    const el = document.getElementById('mb-timer');
    if (!el || !S.session.sessionId) return;
    if (S.mode !== 'CUSTOMER_MODE') {
      el.textContent = S.sessaoBloqueada ? 'sessão bloqueada' : 'sessão autenticada';
      const parado = Date.now() - S.ultimaAtividade;
      if (!S.sessaoBloqueada && !document.querySelector('.overlay') && parado > INATIVIDADE_MIN * 60 * 1000 * fatorTempo()) bloquearSessao();
      return;
    }
    const left = Math.max(0, ((S.handoff && S.handoff.expiresAt) || 0) - Date.now());
    if (left > 0) {
      const s = Math.ceil(left / 1000);
      el.textContent = `tarefa da cliente · ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} para devolução`;
      return;
    }
    el.textContent = 'tempo da tarefa esgotado';
    if (S.handoff && !S.handoff.expired && !document.querySelector('.overlay')) {
      S.handoff.expired = true;
      audit('A02', `Handoff ${S.handoff.handoffId} expirado · tarefa ${S.handoff.stepId} interrompida sem conclusão`);
      returnToOperator(step(), { expirado: true });
    }
  }, 1000);

  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, select')) return;
    if (e.key === 'ArrowRight' && !document.querySelector('.overlay')) next();
    if (e.key === 'ArrowLeft' && !document.querySelector('.overlay')) back();
  });

  document.getElementById('canvas').addEventListener('click', e => {
    const sw = e.target.closest('[data-a11y]');
    if (sw) return toggleA11y(sw.dataset.a11y);
    const fl = e.target.closest('[data-flag]');
    if (fl) return alternarFlag(fl.dataset.flag);
    const tx = e.target.closest('[data-authtx]');
    if (tx) autenticarTitular(tx.dataset.motivo, () => { S.srv.authTx[tx.dataset.authtx] = true; render(); });
  });
}

/* Funciona tanto com os scripts no fim da página quanto com a página já
   carregada (por exemplo, quando publicada como arquivo único). */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
