// Almacenamiento de proyectos con dos modos:
// - Local (por defecto): archivos en data/projects/<slug>/
// - Vercel Blob: si existe BLOB_READ_WRITE_TOKEN, los mismos archivos viven en el store
//   como projects/<slug>/project.json y projects/<slug>/vision.md (acceso privado).
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, 'data', 'projects');

const local = {
  mode: 'local',
  async listSlugs() {
    if (!fs.existsSync(DATA)) return [];
    return fs.readdirSync(DATA, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  },
  async read(slug, name) {
    const file = path.join(DATA, slug, name);
    return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  },
  async write(slug, name, content) {
    fs.mkdirSync(path.join(DATA, slug), { recursive: true });
    fs.writeFileSync(path.join(DATA, slug, name), content);
  },
};

function blobStore() {
  const blob = require('@vercel/blob'); // solo se instala/usa en Vercel
  const key = (slug, name) => `projects/${slug}/${name}`;
  return {
    mode: 'blob',
    async listSlugs() {
      const slugs = new Set();
      let cursor;
      do {
        const r = await blob.list({ prefix: 'projects/', cursor });
        for (const b of r.blobs) {
          const m = b.pathname.match(/^projects\/([a-z0-9-]+)\/project\.json$/);
          if (m) slugs.add(m[1]);
        }
        cursor = r.hasMore ? r.cursor : undefined;
      } while (cursor);
      return [...slugs];
    },
    async read(slug, name) {
      const r = await blob.get(key(slug, name), { access: 'private', useCache: false });
      if (!r || r.statusCode !== 200) return null;
      return await new Response(r.stream).text();
    },
    async write(slug, name, content) {
      await blob.put(key(slug, name), content, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: name.endsWith('.json') ? 'application/json' : 'text/markdown',
      });
    },
  };
}

module.exports = process.env.BLOB_READ_WRITE_TOKEN ? blobStore() : local;
