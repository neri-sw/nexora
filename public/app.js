// Front mínimo sin dependencias. Rutas: "/" (listado) y "/p/<slug>" (detalle).
const app = document.getElementById('app');

const api = async (method, url, body) => {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
};

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Markdown muy básico: títulos, listas, negrita, cursiva, código y párrafos.
function md(src = '') {
  const inline = (t) => esc(t)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])[*_]([^*_]+)[*_]/g, '$1<em>$2</em>');
  const out = []; let list = null;
  for (const line of src.split('\n')) {
    const h = line.match(/^(#{1,3})\s+(.*)/);
    const li = line.match(/^\s*[-*]\s+(.*)/);
    if (!li && list) { out.push('</ul>'); list = null; }
    if (h) out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
    else if (li) { if (!list) { out.push('<ul>'); list = true; } out.push(`<li>${inline(li[1])}</li>`); }
    else if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push('</ul>');
  return out.join('');
}

function navigate(path) { history.pushState({}, '', path); render(); }
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (a) { e.preventDefault(); navigate(a.getAttribute('href')); }
});
window.addEventListener('popstate', render);

async function render() {
  const m = location.pathname.match(/^\/p\/([a-z0-9-]+)\/?$/);
  try {
    if (m) await renderProject(m[1]);
    else await renderList();
  } catch (e) {
    app.innerHTML = `<div class="card empty">${esc(e.message)} · <a href="/" data-link>Volver</a></div>`;
  }
}

async function renderList() {
  document.title = 'Proyectos';
  const projects = await api('GET', '/api/projects');
  app.innerHTML = `
    <h1>Proyectos</h1>
    <p class="muted">${projects.length} proyecto${projects.length === 1 ? '' : 's'}</p>
    <form class="inline card" id="new">
      <input type="text" name="name" placeholder="Nombre del nuevo proyecto" required>
      <input type="text" name="description" placeholder="Descripción corta (opcional)">
      <button>Crear proyecto</button>
    </form>
    <h2>En curso</h2>
    ${projects.length ? `<div class="grid">${projects.map((p) => `
      <a class="card project" href="/p/${p.slug}" data-link>
        <h3>${esc(p.name)}</h3>
        <div class="muted">${esc(p.description || '')}</div>
        <div class="muted" style="margin-top:8px"><span class="tag">${esc(p.status)}</span> ${p.openTasks} pendiente${p.openTasks === 1 ? '' : 's'} de ${p.taskCount}</div>
      </a>`).join('')}</div>` : '<div class="card empty muted">Todavía no hay proyectos. Creá el primero arriba.</div>'}
  `;
  document.getElementById('new').onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const p = await api('POST', '/api/projects', { name: f.get('name'), description: f.get('description') });
    navigate('/p/' + p.slug);
  };
}

async function renderProject(slug, editingVision = false) {
  const p = await api('GET', '/api/projects/' + slug);
  document.title = p.name + ' · Proyectos';
  const open = p.tasks.filter((t) => t.status !== 'done');
  const done = p.tasks.filter((t) => t.status === 'done');
  const taskLi = (t) => `
    <li class="${t.status === 'done' ? 'done' : ''}" data-id="${t.id}">
      <input type="checkbox" ${t.status === 'done' ? 'checked' : ''} data-act="toggle">
      <span class="title">${esc(t.title)}</span>
      ${t.createdBy === 'claude' ? '<span class="tag">Claude</span>' : ''}
      <button class="icon" data-act="del" title="Borrar">✕</button>
    </li>`;

  app.innerHTML = `
    <p><a href="/" data-link>← Proyectos</a></p>
    <div class="row">
      <div>
        <h1>${esc(p.name)}</h1>
        <div class="muted">${esc(p.description || '')}</div>
      </div>
      <select id="status">
        ${['activo', 'pausado', 'terminado'].map((s) => `<option ${s === p.status ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>

    <h2>Tareas <span class="muted">(${open.length} pendientes)</span></h2>
    <div class="card">
      <form class="inline" id="newTask" style="margin-bottom:8px">
        <input type="text" name="title" placeholder="Nueva tarea" required>
        <button>Agregar</button>
      </form>
      <ul class="tasks">${open.map(taskLi).join('') || '<li class="muted">Sin tareas pendientes.</li>'}</ul>
      ${done.length ? `<details style="margin-top:8px"><summary class="muted">${done.length} hechas</summary><ul class="tasks">${done.map(taskLi).join('')}</ul></details>` : ''}
    </div>

    <div class="row"><h2>Visión completa</h2>
      ${editingVision ? '' : '<button class="ghost" id="editVision">Editar</button>'}
    </div>
    <div class="card">
      ${editingVision
        ? `<textarea id="visionText">${esc(p.vision)}</textarea>
           <div style="margin-top:8px;display:flex;gap:8px"><button id="saveVision">Guardar</button><button class="ghost" id="cancelVision">Cancelar</button></div>`
        : `<div class="vision">${md(p.vision) || '<span class="muted">Sin visión todavía.</span>'}</div>`}
    </div>
  `;

  const base = '/api/projects/' + slug;
  document.getElementById('status').onchange = async (e) => { await api('PATCH', base, { status: e.target.value }); };
  document.getElementById('newTask').onsubmit = async (e) => {
    e.preventDefault();
    await api('POST', base + '/tasks', { title: new FormData(e.target).get('title') });
    renderProject(slug);
  };
  app.querySelectorAll('ul.tasks li[data-id]').forEach((li) => {
    li.onclick = async (e) => {
      const act = e.target.dataset.act; if (!act) return;
      const id = li.dataset.id;
      if (act === 'toggle') await api('PATCH', `${base}/tasks/${id}`, { status: e.target.checked ? 'done' : 'todo' });
      if (act === 'del') await api('DELETE', `${base}/tasks/${id}`);
      renderProject(slug);
    };
  });
  const ev = document.getElementById('editVision'); if (ev) ev.onclick = () => renderProject(slug, true);
  const sv = document.getElementById('saveVision');
  if (sv) {
    sv.onclick = async () => { await api('PATCH', base, { vision: document.getElementById('visionText').value }); renderProject(slug); };
    document.getElementById('cancelVision').onclick = () => renderProject(slug);
  }
}

render();
