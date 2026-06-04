import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const WORKSPACES = path.resolve(process.env.QNWRK_WORKSPACES || path.join(ROOT, 'workspaces'));
const PORT = Number(process.env.PORT || 8788);
const MAX_FILE_BYTES = Number(process.env.QNWRK_MAX_FILE_BYTES || 512_000);

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

function safeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function assertProjectSlug(slug) {
  if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(slug)) {
    const err = new Error('Invalid project slug');
    err.status = 400;
    throw err;
  }
}

function resolveWorkspace(slug) {
  assertProjectSlug(slug);
  return path.join(WORKSPACES, slug);
}

function resolveInside(base, requested = '.') {
  const clean = String(requested || '.').replace(/^\/+/, '');
  const target = path.resolve(base, clean);
  if (target !== base && !target.startsWith(base + path.sep)) {
    const err = new Error('Path escapes workspace');
    err.status = 400;
    throw err;
  }
  return target;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeProjectMeta(root, data) {
  await ensureDir(path.join(root, '.qnwrk'));
  await fs.writeFile(path.join(root, '.qnwrk', 'project.json'), JSON.stringify(data, null, 2), 'utf8');
}

async function readProjectMeta(slug) {
  const root = resolveWorkspace(slug);
  const fallbackName = slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  const meta = await readJson(path.join(root, '.qnwrk', 'project.json'), {});
  return {
    id: slug,
    slug,
    name: meta.name || fallbackName,
    type: meta.type || 'static',
    owner: meta.owner || 'VM',
    status: meta.status || 'created',
    previewPath: `/preview/${slug}/`,
    createdAt: meta.createdAt || null
  };
}

async function listFiles(slug, relativePath = '.') {
  const workspace = resolveWorkspace(slug);
  const dir = resolveInside(workspace, relativePath);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const rows = await Promise.all(entries
    .filter((entry) => entry.name !== '.qnwrk')
    .map(async (entry) => {
      const absolute = path.join(dir, entry.name);
      const stat = await fs.stat(absolute);
      const rel = path.relative(workspace, absolute).replaceAll(path.sep, '/');
      return {
        name: entry.name,
        path: rel,
        type: entry.isDirectory() ? 'folder' : 'file',
        size: entry.isDirectory() ? null : stat.size,
        updatedAt: stat.mtime.toISOString()
      };
    }));
  return rows.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

async function createTemplate(root, name, type) {
  await ensureDir(root);
  await writeProjectMeta(root, {
    name,
    type,
    owner: 'VM',
    status: 'created',
    createdAt: new Date().toISOString()
  });

  if (type === 'static') {
    await ensureDir(path.join(root, 'public'));
    await ensureDir(path.join(root, 'src'));
    await fs.writeFile(path.join(root, 'index.html'), `<!doctype html>\n<html>\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>${name}</title>\n    <link rel="stylesheet" href="/styles.css" />\n  </head>\n  <body>\n    <main>\n      <p class="tag">QNWRK STATIC APP</p>\n      <h1>${name}</h1>\n      <p>Edit files in QNWRK and refresh the App tab to see changes.</p>\n    </main>\n  </body>\n</html>\n`);
    await fs.writeFile(path.join(root, 'styles.css'), `body{margin:0;min-height:100vh;display:grid;place-items:center;background:#05020a;color:#fff;font-family:Inter,system-ui,sans-serif}main{width:min(760px,88vw);padding:42px;border:1px solid rgba(168,85,247,.45);border-radius:28px;background:linear-gradient(135deg,rgba(88,28,135,.28),rgba(0,0,0,.38));box-shadow:0 0 90px rgba(147,51,234,.25)}h1{font-size:clamp(3rem,9vw,7rem);margin:.1em 0;letter-spacing:-.08em}.tag{color:#c084fc;letter-spacing:.18em;font-size:.8rem}\n`);
  }

  if (type === 'gradio') {
    await fs.writeFile(path.join(root, 'app.py'), `import gradio as gr\n\ndef greet(name):\n    return f"Hello, {name} from ${name}"\n\ndemo = gr.Interface(fn=greet, inputs="text", outputs="text")\n\nif __name__ == "__main__":\n    demo.launch(server_name="0.0.0.0", server_port=7860)\n`);
    await fs.writeFile(path.join(root, 'requirements.txt'), 'gradio\n');
  }

  if (type === 'docker') {
    await fs.writeFile(path.join(root, 'Dockerfile'), `FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]\n`);
    await fs.writeFile(path.join(root, 'server.js'), `import http from 'node:http';\nconst port = process.env.PORT || 3000;\nhttp.createServer((req, res) => {\n  res.end('${name} running in Docker workspace');\n}).listen(port, '0.0.0.0');\n`);
    await fs.writeFile(path.join(root, 'package.json'), '{"type":"module","scripts":{"start":"node server.js"}}\n');
  }

  await fs.writeFile(path.join(root, 'README.md'), `# ${name}\n\nQNWRK ${type} workspace.\n`);
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'qnwrk-vm-backend', workspaces: WORKSPACES });
});

app.get('/api/projects', async (req, res, next) => {
  try {
    await ensureDir(WORKSPACES);
    const entries = await fs.readdir(WORKSPACES, { withFileTypes: true });
    const projects = await Promise.all(entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => readProjectMeta(entry.name)));
    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

app.post('/api/projects', async (req, res, next) => {
  try {
    const name = String(req.body?.name || 'Untitled Project').trim();
    const type = String(req.body?.type || 'static').toLowerCase();
    const slug = safeSlug(req.body?.slug || name) || `project-${nanoid(6)}`;
    assertProjectSlug(slug);
    if (!['static', 'gradio', 'docker'].includes(type)) {
      return res.status(400).json({ error: 'Project type must be static, gradio, or docker' });
    }
    const root = resolveWorkspace(slug);
    if (existsSync(root)) return res.status(409).json({ error: 'Project already exists' });
    await createTemplate(root, name, type);
    res.status(201).json({ project: await readProjectMeta(slug) });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/projects/:slug', async (req, res, next) => {
  try {
    const workspace = resolveWorkspace(req.params.slug);
    await fs.rm(workspace, { recursive: true, force: true });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/projects/:slug/files', async (req, res, next) => {
  try {
    const files = await listFiles(req.params.slug, req.query.path || '.');
    res.json({ files, cwd: req.query.path || '.' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/projects/:slug/file', async (req, res, next) => {
  try {
    const workspace = resolveWorkspace(req.params.slug);
    const target = resolveInside(workspace, req.query.path);
    const stat = await fs.stat(target);
    if (stat.isDirectory()) return res.status(400).json({ error: 'Cannot read a directory as a file' });
    if (stat.size > MAX_FILE_BYTES) return res.status(413).json({ error: 'File is too large for browser editing' });
    const content = await fs.readFile(target, 'utf8');
    res.json({ path: req.query.path, content, size: stat.size, updatedAt: stat.mtime.toISOString() });
  } catch (error) {
    next(error);
  }
});

app.put('/api/projects/:slug/file', async (req, res, next) => {
  try {
    const workspace = resolveWorkspace(req.params.slug);
    const target = resolveInside(workspace, req.body?.path);
    await ensureDir(path.dirname(target));
    await fs.writeFile(target, String(req.body?.content ?? ''), 'utf8');
    const stat = await fs.stat(target);
    res.json({ ok: true, path: req.body.path, size: stat.size, updatedAt: stat.mtime.toISOString() });
  } catch (error) {
    next(error);
  }
});

app.post('/api/projects/:slug/folder', async (req, res, next) => {
  try {
    const workspace = resolveWorkspace(req.params.slug);
    const target = resolveInside(workspace, req.body?.path);
    await ensureDir(target);
    res.status(201).json({ ok: true, path: req.body.path });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/projects/:slug/file', async (req, res, next) => {
  try {
    const workspace = resolveWorkspace(req.params.slug);
    const target = resolveInside(workspace, req.query.path);
    await fs.rm(target, { recursive: true, force: true });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use('/preview/:slug', async (req, res, next) => {
  try {
    const workspace = resolveWorkspace(req.params.slug);
    const requestPath = req.path === '/' ? '/index.html' : req.path;
    const target = resolveInside(workspace, `.${requestPath}`);
    if (!existsSync(target)) return res.status(404).send('Preview file not found');
    createReadStream(target).pipe(res);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({ error: error.message || 'Server error' });
});

await ensureDir(WORKSPACES);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`QNWRK VM backend running on http://0.0.0.0:${PORT}`);
  console.log(`Workspace root: ${WORKSPACES}`);
});
