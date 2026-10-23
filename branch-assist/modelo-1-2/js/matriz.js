/* =========================================================================
   PAINEL DE RASTREABILIDADE
   -------------------------------------------------------------------------
   Mostra os 106 requisitos do escopo funcional e a tela que atende cada um.
   O vínculo é lido, em tempo de execução, dos chips chip--ca que cada tela
   exibe: a matriz renderiza as 47 telas fora da página e coleta os IDs.
   Remover um chip faz o requisito aparecer como "sem tela"; um chip com
   ID fora da planilha aparece como "chip sem requisito".
   Abre por cima do modelo, sem alterar a etapa em que o atendimento está.
   ======================================================================= */

const Matriz = {
  aberta: false,
  downloads: null,                       // capacidade do visualizador do claude.ai, quando houver
  filtro: { modulo: 'TODOS', busca: '' },

  /* Nome legível de cada tela, a partir das etapas declaradas. */
  rotuloTela(id) {
    const st = STEPS_ONB.concat(STEPS_SRV).find(s => s.id === id);
    return st ? `${st.id} · ${st.label}` : id;
  },

  /* Lê os chips de requisito de todas as telas. Devolve { id: [telas] }. */
  cobertura() {
    const mapa = {};
    const tmp = document.createElement('div');
    STEPS_ONB.concat(STEPS_SRV).forEach(st => {
      const scr = SCREENS[st.render];
      let html = '';
      try { html = scr.render(); } catch (e) { html = ''; }
      tmp.innerHTML = html;
      tmp.querySelectorAll('.chip--ca').forEach(c => c.textContent.split('·').map(x => x.trim()).filter(Boolean).forEach(id => {
        mapa[id] = mapa[id] || [];
        if (!mapa[id].includes(st.id)) mapa[id].push(st.id);
      }));
    });
    tmp.innerHTML = '';
    return mapa;
  },

  /* Requisitos com as telas que os exibem, mais os chips sem requisito. */
  linhas() {
    const mapa = this.cobertura();
    const ids = new Set(REQS.map(r => r.id));
    return {
      reqs: REQS.map(r => ({ ...r, t: mapa[r.id] || [] })),
      orfaos: Object.keys(mapa).filter(id => !ids.has(id)).map(id => ({ id, t: mapa[id] })),
    };
  },

  abrir() {
    this.aberta = true;
    audit('I07', `Matriz de rastreabilidade aberta · ${REQS.length} requisitos do escopo funcional`);
    this.pintar();
  },

  fechar() {
    this.aberta = false;
    const h = document.getElementById('matriz-host');
    if (h) h.innerHTML = '';
  },

  pintar() {
    const host = document.getElementById('matriz-host');
    if (!host) return;
    if (!this.aberta) { host.innerHTML = ''; return; }

    const { reqs: TODOS, orfaos } = this.linhas();
    const mods = [...new Set(TODOS.map(r => r.m))].sort();
    const f = this.filtro;
    const busca = f.busca.trim().toLowerCase();
    const lista = TODOS.filter(r => {
      if (f.modulo !== 'TODOS' && r.m !== f.modulo) return false;
      if (busca && !(r.id.includes(busca) || r.d.toLowerCase().includes(busca))) return false;
      return true;
    });
    const cobertos = TODOS.filter(r => r.t.length).length;
    const pct = Math.round((cobertos / TODOS.length) * 100);

    host.innerHTML = `
    <div class="matriz" role="dialog" aria-modal="true" aria-label="Matriz de rastreabilidade de requisitos">
      <div class="matriz__box">
        <div class="matriz__head">
          <div>
            <div class="matriz__title">Rastreabilidade do escopo funcional</div>
            <div class="matriz__sub">${cobertos} de ${TODOS.length} requisitos com tela · ${pct}% · lido dos chips das telas agora${orfaos.length ? ` · <b>${orfaos.length} chip(s) sem requisito</b>` : ''}</div>
          </div>
          <button class="btn btn--ghost" data-mx="fechar">${ico('x', 18)} Fechar</button>
        </div>

        <div class="matriz__tools">
          <select class="field__select" data-mx="modulo" style="max-width:260px">
            <option value="TODOS">Todos os módulos (${REQS.length})</option>
            ${mods.map(m => `<option value="${m}" ${f.modulo === m ? 'selected' : ''}>${m} (${REQS.filter(r => r.m === m).length})</option>`).join('')}
          </select>
          <input class="field__input" data-mx="busca" placeholder="Buscar por ID ou texto do requisito" value="${f.busca}" style="flex:1">
          <span class="badge badge--neutral">${lista.length} exibidos</span>
        </div>

        <div class="matriz__body">
          <table class="table">
            <thead><tr><th style="width:88px">ID</th><th>Requisito</th><th style="width:150px">Módulo</th><th style="width:230px">Onde é atendido</th></tr></thead>
            <tbody>
              ${lista.map(r => `
              <tr>
                <td><code>${r.id}</code></td>
                <td>${r.d}</td>
                <td class="tiny muted">${r.m}</td>
                <td>
                  ${r.t.length
                    ? r.t.map(t => `<div><span class="badge badge--success">${this.rotuloTela(t)}</span></div>`).join('')
                    : '<span class="badge badge--danger">sem tela</span>'}
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
          ${orfaos.length ? `
          <div style="padding:var(--sp-16) var(--sp-24)">
            <div class="note note--danger">
              <span class="note__ic">${ico('alert', 18)}</span>
              <div><b>Chips sem requisito na planilha.</b> <span class="muted">${orfaos.map(o => `<code>${o.id}</code> em ${o.t.join(', ')}`).join(' · ')}</span></div>
            </div>
          </div>` : ''}
          ${!lista.length ? `
          <div style="padding:var(--sp-24)">
            <div class="note note--info">
              <span class="note__ic">${ico('info', 18)}</span>
              <div><b>Nenhum requisito encontrado com esse filtro.</b></div>
            </div>
          </div>` : ''}
        </div>

        <div class="matriz__foot">
          <span class="tiny muted">Fonte: BASA - Branch Assist Scope_20052026.xlsx · o vínculo vem dos chips exibidos em cada tela, lidos no momento da abertura</span>
          <div class="inline">
            <span class="tiny muted" id="mx-csv-msg" role="status"></span>
            <button class="btn btn--outline" data-mx="csv">${ico('download', 16)} Exportar CSV</button>
          </div>
        </div>
      </div>
    </div>`;

    host.querySelector('[data-mx="fechar"]').onclick = () => this.fechar();
    host.querySelector('[data-mx="modulo"]').onchange = (e) => { this.filtro.modulo = e.target.value; this.pintar(); };
    const inp = host.querySelector('[data-mx="busca"]');
    inp.oninput = (e) => {
      this.filtro.busca = e.target.value;
      this.pintar();
      /* Mantém o foco e o cursor durante a digitação. */
      const novo = document.querySelector('[data-mx="busca"]');
      if (novo) { novo.focus(); novo.setSelectionRange(novo.value.length, novo.value.length); }
    };
    host.querySelector('[data-mx="csv"]').onclick = () => this.exportar();

    /* Escape fecha, como em qualquer diálogo. */
    host.querySelector('.matriz').onkeydown = (e) => { if (e.key === 'Escape') this.fechar(); };
  },

  exportar() {
    const linhas = [['ID', 'Requisito', 'Modulo', 'Telas']];
    this.linhas().reqs.forEach(r => linhas.push([r.id, r.d, r.m, r.t.map(t => this.rotuloTela(t)).join(' | ')]));
    const csv = linhas.map(l => l.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const msg = document.getElementById('mx-csv-msg');
    const avisar = (t) => { if (msg) msg.textContent = t; };
    const conteudo = '\ufeff' + csv;
    const nome = 'rastreabilidade-branch-assist.csv';

    /* Publicado no claude.ai: a página não baixa arquivos sozinha; o visualizador
       oferece o arquivo e a pessoa confirma. */
    if (this.downloads) {
      this.downloads.save({ filename: nome, data: conteudo })
        .then(() => avisar('CSV salvo.'))
        .catch((e) => avisar(e && e.code === 'declined' ? 'Download cancelado.' : 'Download indisponível nesta visualização.'));
      audit('I07', `Matriz de rastreabilidade exportada em CSV · ${REQS.length} requisitos`);
      return;
    }

    /* Rodando localmente: baixa o arquivo e também copia o CSV, que pode ser
       colado direto numa planilha se o navegador bloquear o download. */
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nome;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch (e) { /* download indisponível: segue a cópia */ }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(csv)
        .then(() => avisar('CSV copiado. Cole numa planilha se o download não começar.'))
        .catch(() => {});
    }
    audit('I07', `Matriz de rastreabilidade exportada em CSV · ${REQS.length} requisitos`);
  },
};

/* No claude.ai, o visualizador oferece a capacidade de download; fora dele,
   window.claude não existe e a exportação usa o download do navegador. */
if (window.claude && typeof window.claude.use === 'function') {
  window.claude.use('downloads').then((d) => { Matriz.downloads = d; }).catch(() => {});
}
