// Servidor mínimo. Local: node server.js -> http://localhost:3000
// En Vercel se usa como función (api/index.js) y guarda los datos en Vercel Blob (ver storage.js).
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const store = require('./storage');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const PASSWORD = process.env.APP_PASSWORD || ''; // sin contraseña = sin login (uso local)

const now = () => new Date().toISOString();
const slugify = (s) =>
  s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'proyecto';
const validSlug = (s) => /^[a-z0-9-]+$/.test(s);

async function readProject(slug) {
  if (!validSlug(slug)) return null;
  const raw = await store.read(slug, 'project.json');
  if (!raw) return null;
  const project = JSON.parse(raw);
  project.vision = (await store.read(slug, 'vision.md')) || '';
  project.slug = slug;
  project.tasks = project.tasks || [];
  return project;
}

async function writeProject(slug, project) {
  const { vision, slug: _s, ...meta } = project;
  meta.updatedAt = now();
  await store.write(slug, 'project.json', JSON.stringify(meta, null, 2) + '\n');
  if (vision !== undefined) await store.write(slug, 'vision.md', vision);
  return readProject(slug);
}

async function listProjects() {
  const projects = await Promise.all((await store.listSlugs()).map(readProject));
  return projects
    .filter(Boolean)
    .map(({ vision, tasks, ...p }) => ({
      ...p,
      taskCount: tasks.length,
      openTasks: tasks.filter((t) => t.status !== 'done').length,
    }))
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

// --- Acceso con contraseña (solo si APP_PASSWORD está definida) ---
const sessionToken = () => crypto.createHmac('sha256', PASSWORD).update('gestor-sesion-v1').digest('hex');
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
function isAuthed(req) {
  if (!PASSWORD) return true;
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ') && safeEqual(auth.slice(7), PASSWORD)) return true;
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)sesion=([a-f0-9]+)/);
  return !!m && safeEqual(m[1], sessionToken());
}
function setSession(res, value, maxAge) {
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader('Set-Cookie', `sesion=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`);
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
  // En Vercel el runtime ya parsea el body (req.body)
  if (process.env.VERCEL && 'body' in req) return Promise.resolve(typeof req.body === 'object' && req.body ? req.body : {});
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
    if (m === 'GET') return send(res, 200, await listProjects());
    if (m === 'POST') {
      const body = await readBody(req);
      if (!body.name || !body.name.trim()) return send(res, 400, { error: 'Falta el nombre' });
      let s = slugify(body.name), i = 2;
      while (await store.read(s, 'project.json')) s = slugify(body.name) + '-' + i++;
      const project = {
        name: body.name.trim(),
        description: (body.description || '').trim(),
        status: 'activo',
        createdAt: now(),
        tasks: [],
        vision: `# ${body.name.trim()}\n\n_Escribí acá la visión completa del proyecto._\n`,
      };
      return send(res, 201, await writeProject(s, project));
    }
  }

  const project = await readProject(slug);
  if (!project) return send(res, 404, { error: 'Proyecto no encontrado' });

  if (!sub) {
    if (m === 'GET') return send(res, 200, project);
    if (m === 'PATCH') {
      const body = await readBody(req);
      for (const k of ['name', 'description', 'status', 'vision']) if (body[k] !== undefined) project[k] = body[k];
      return send(res, 200, await writeProject(slug, project));
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
      return send(res, 201, await writeProject(slug, project));
    }
    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return send(res, 404, { error: 'Tarea no encontrada' });
    if (m === 'PATCH') {
      const body = await readBody(req);
      for (const k of ['title', 'status', 'notes']) if (body[k] !== undefined) task[k] = body[k];
      if (body.status === 'done' && !task.doneAt) task.doneAt = now();
      if (body.status && body.status !== 'done') delete task.doneAt;
      return send(res, 200, await writeProject(slug, project));
    }
    if (m === 'DELETE') {
      project.tasks = project.tasks.filter((t) => t.id !== taskId);
      return send(res, 200, await writeProject(slug, project));
    }
  }
  send(res, 405, { error: 'Método no permitido' });
}

async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://localhost');
    // En Vercel, vercel.json reescribe /api/* a /api/index?__path=*
    const pathname = url.searchParams.has('__path') ? '/api/' + url.searchParams.get('__path') : url.pathname;
    const parts = pathname.split('/').filter(Boolean).map(decodeURIComponent);

    if (parts[0] === 'api') {
      if (parts[1] === 'session') {
        if (req.method === 'GET') return send(res, 200, { authed: isAuthed(req), passwordRequired: !!PASSWORD });
        if (req.method === 'POST') {
          const body = await readBody(req);
          if (!PASSWORD || !safeEqual(body.password || '', PASSWORD)) return send(res, 401, { error: 'Contraseña incorrecta' });
          setSession(res, sessionToken(), 60 * 60 * 24 * 30);
          return send(res, 200, { authed: true });
        }
        if (req.method === 'DELETE') { setSession(res, '', 0); return send(res, 200, { authed: false }); }
      }
      if (!isAuthed(req)) return send(res, 401, { error: 'No autorizado', login: true });
      if (parts[1] === 'projects') return await handleApi(req, res, parts);
      return send(res, 404, { error: 'No encontrado' });
    }

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
}

module.exports = handler;

if (require.main === module) {
  http.createServer(handler).listen(PORT, () =>
    console.log(`Gestión de proyectos -> http://localhost:${PORT} (datos: ${store.mode}${PASSWORD ? ', con contraseña' : ''})`));
}
