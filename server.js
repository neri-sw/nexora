// Servidor local mínimo, sin dependencias. Uso: node server.js  ->  http://localhost:3000
// Lee y escribe los proyectos como archivos dentro de data/projects/<slug>/
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA = path.join(ROOT, 'data', 'projects');
const PUBLIC = path.join(ROOT, 'public');

fs.mkdirSync(DATA, { recursive: true });

const now = () => new Date().toISOString();
const slugify = (s) =>
  s.toString().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'proyecto';
const validSlug = (s) => /^[a-z0-9-]+$/.test(s);

function projectDir(slug) { return path.join(DATA, slug); }

function readProject(slug) {
  const dir = projectDir(slug);
  const file = path.join(dir, 'project.json');
  if (!validSlug(slug) || !fs.existsSync(file)) return null;
  const project = JSON.parse(fs.readFileSync(file, 'utf8'));
  const visionFile = path.join(dir, 'vision.md');
  project.vision = fs.existsSync(visionFile) ? fs.readFileSync(visionFile, 'utf8') : '';
  project.slug = slug;
  project.tasks = project.tasks || [];
  return project;
}

function writeProject(slug, project) {
  const dir = projectDir(slug);
  fs.mkdirSync(dir, { recursive: true });
  const { vision, slug: _s, ...meta } = project;
  meta.updatedAt = now();
  fs.writeFileSync(path.join(dir, 'project.json'), JSON.stringify(meta, null, 2) + '\n');
  if (vision !== undefined) fs.writeFileSync(path.join(dir, 'vision.md'), vision);
  return readProject(slug);
}

function listProjects() {
  return fs.readdirSync(DATA, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => readProject(d.name))
    .filter(Boolean)
    .map(({ vision, tasks, ...p }) => ({
      ...p,
      taskCount: tasks.length,
      openTasks: tasks.filter((t) => t.status !== 'done').length,
    }))
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

function nextTaskId(project) {
  const max = project.tasks.reduce((m, t) => Math.max(m, parseInt(String(t.id).replace(/\D/g, ''), 10) || 0), 0);
  return 't' + (max + 1);
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
  });
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

async function handleApi(req, res, parts) {
  // parts: ['api','projects', slug?, 'tasks'?, taskId?]
  const [, , slug, sub, taskId] = parts;
  const m = req.method;

  if (!slug) {
    if (m === 'GET') return send(res, 200, listProjects());
    if (m === 'POST') {
      const body = await readBody(req);
      if (!body.name || !body.name.trim()) return send(res, 400, { error: 'Falta el nombre' });
      let s = slugify(body.name), i = 2;
      while (fs.existsSync(projectDir(s))) s = slugify(body.name) + '-' + i++;
      const project = {
        name: body.name.trim(),
        description: (body.description || '').trim(),
        status: 'activo',
        createdAt: now(),
        tasks: [],
        vision: `# ${body.name.trim()}\n\n_Escribí acá la visión completa del proyecto._\n`,
      };
      return send(res, 201, writeProject(s, project));
    }
  }

  const project = readProject(slug);
  if (!project) return send(res, 404, { error: 'Proyecto no encontrado' });

  if (!sub) {
    if (m === 'GET') return send(res, 200, project);
    if (m === 'PATCH') {
      const body = await readBody(req);
      for (const k of ['name', 'description', 'status', 'vision']) if (body[k] !== undefined) project[k] = body[k];
      return send(res, 200, writeProject(slug, project));
    }
  }

  if (sub === 'tasks') {
    if (!taskId && m === 'POST') {
      const body = await readBody(req);
      if (!body.title || !body.title.trim()) return send(res, 400, { error: 'Falta el título' });
      project.tasks.push({
        id: nextTaskId(project),
        title: body.title.trim(),
        status: 'todo',
        createdBy: body.createdBy || 'neri',
        createdAt: now(),
      });
      return send(res, 201, writeProject(slug, project));
    }
    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return send(res, 404, { error: 'Tarea no encontrada' });
    if (m === 'PATCH') {
      const body = await readBody(req);
      for (const k of ['title', 'status', 'notes']) if (body[k] !== undefined) task[k] = body[k];
      if (body.status === 'done' && !task.doneAt) task.doneAt = now();
      if (body.status && body.status !== 'done') delete task.doneAt;
      return send(res, 200, writeProject(slug, project));
    }
    if (m === 'DELETE') {
      project.tasks = project.tasks.filter((t) => t.id !== taskId);
      return send(res, 200, writeProject(slug, project));
    }
  }
  send(res, 405, { error: 'Método no permitido' });
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    if (parts[0] === 'api' && parts[1] === 'projects') return await handleApi(req, res, parts);

    // Archivos estáticos; cualquier otra ruta (/, /p/<slug>) devuelve index.html
    const file = path.join(PUBLIC, path.normalize(url.pathname));
    if (file.startsWith(PUBLIC) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'Content-Type': (MIME[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8' });
      return fs.createReadStream(file).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(path.join(PUBLIC, 'index.html')).pipe(res);
  } catch (e) {
    send(res, 500, { error: e.message });
  }
}).listen(PORT, () => console.log(`Gestión de proyectos -> http://localhost:${PORT}`));
