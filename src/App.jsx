import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Braces,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Database,
  File,
  FileText,
  Folder,
  GitBranch,
  Heart,
  History,
  ListFilter,
  Lock,
  Menu,
  MoreVertical,
  PlayCircle,
  Plus,
  RefreshCw,
  Save,
  Search,
  Server,
  Settings,
  Sparkles,
  TerminalSquare,
  Wand2,
  X
} from 'lucide-react';

const projectTypes = [
  { title: 'Docker', type: 'docker', icon: Server, copy: 'Containerized projects with Dockerfile, ports, logs, and runner controls.', tags: ['containers', 'images', 'ports'], tone: 'indigo' },
  { title: 'Gradio', type: 'gradio', icon: Wand2, copy: 'Python UI apps with app.py, requirements.txt, live preview, and runtime logs.', tags: ['python', 'app.py', 'models'], tone: 'violet' },
  { title: 'Static', type: 'static', icon: Code2, copy: 'HTML, CSS, JS, docs, landing pages, and preview-first web projects.', tags: ['html', 'css', 'assets'], tone: 'plum' }
];

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function fileKind(name, type) {
  if (type === 'folder') return 'folder';
  if (name.endsWith('.md')) return 'md';
  if (name.endsWith('.js') || name.endsWith('.jsx') || name.endsWith('.json')) return 'js';
  return 'file';
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

function BrandMark() {
  return <div className="brand-mark" aria-label="QNWRK logo"><span /><span /><span /></div>;
}

function ProjectTypeCard({ project, onCreate, busy }) {
  const Icon = project.icon;
  return (
    <article className={`type-card ${project.tone}`}>
      <div className="type-card-top">
        <div className="type-icon"><Icon size={22} /></div>
        <button className="round-action" onClick={() => onCreate(project)} disabled={busy} aria-label={`Create ${project.title}`}><ChevronDown size={18} className="rotate-corner" /></button>
      </div>
      <h3>{project.title}</h3>
      <p>{project.copy}</p>
      <div className="tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </article>
  );
}

function FileIcon({ kind }) {
  if (kind === 'folder') return <Folder className="folder-icon" size={21} fill="currentColor" />;
  if (kind === 'md') return <FileText className="md-icon" size={21} />;
  if (kind === 'js') return <Braces className="js-icon" size={21} />;
  return <File className="file-icon" size={21} />;
}

function FileRow({ row, onOpen }) {
  const kind = fileKind(row.name, row.type);
  return (
    <button className="file-row" onClick={() => onOpen(row)}>
      <div className="file-name"><FileIcon kind={kind} /><span>{row.name}</span></div>
      <div className="file-size">{formatBytes(row.size)}</div>
      <div className="file-date">{formatDate(row.updatedAt)}</div>
      <span className="ghost-icon"><MoreVertical size={18} /></span>
    </button>
  );
}

function EmptyWorkspace({ onCreate, busy }) {
  return (
    <section className="workspace-empty">
      <div className="empty-orb"><Database size={38} /></div>
      <h2>No VM workspace yet</h2>
      <p>Create a real project below. QNWRK will create the folder and starter files inside the VM <code>workspaces/</code> directory.</p>
      <div className="empty-actions">
        {projectTypes.map((project) => <button key={project.type} onClick={() => onCreate(project)} disabled={busy}><project.icon size={18} /> New {project.title}</button>)}
      </div>
    </section>
  );
}

function WorkspacePanel({ project, files, cwd, activeTab, setActiveTab, loadingFiles, onOpenFile, onCreateFile, onCreateFolder, onRefresh, onGoRoot }) {
  const totalSize = useMemo(() => files.reduce((sum, row) => sum + (row.size || 0), 0), [files]);
  return (
    <section className="workspace-panel live-panel">
      <div className="workspace-tools">
        <button className="branch-pill"><GitBranch size={18} /> main <ChevronDown size={16} /></button>
        <div className="repo-title">{project.name} <span>{formatBytes(totalSize)}</span></div>
        <button className="search-btn" onClick={onRefresh} aria-label="Refresh files"><RefreshCw size={20} /></button>
      </div>

      <div className="workspace-meta">
        <div className="owner-line"><span className="avatar" /> {project.owner || 'VM'} <small>{project.type}</small></div>
        <button className="history-pill"><History size={19} /> Local VM files</button>
      </div>

      <div className="workspace-switcher">
        <button className={activeTab === 'app' ? 'active' : ''} onClick={() => setActiveTab('app')}><Box size={18} /> App</button>
        <button className={activeTab === 'files' ? 'active' : ''} onClick={() => setActiveTab('files')}><ListFilter size={18} /> Files</button>
        <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}><TerminalSquare size={18} /> Logs</button>
      </div>

      {activeTab === 'app' && <div className="app-preview-wrap"><iframe title={`${project.name} preview`} src={project.previewPath} /></div>}
      {activeTab === 'logs' && <div className="logs-panel"><p><span>$</span> QNWRK runner is ready.</p><p><span>$</span> Filesystem API connected to {project.slug}</p><p><span>$</span> Docker and Gradio run buttons come after file editing is stable.</p></div>}

      {activeTab === 'files' && <>
        <div className="file-actions-row">
          <button className="contribute-btn" onClick={onCreateFile}><Plus size={20} /> New file</button>
          <button className="folder-btn" onClick={onCreateFolder}><Folder size={18} /> New folder</button>
        </div>
        <div className="path-line"><button onClick={onGoRoot}>/{project.slug}</button>{cwd !== '.' && <span>/ {cwd}</span>}</div>
        <div className="file-table">
          <div className="commit-row"><div className="commit-author"><span className="avatar mini" /> VM filesystem</div><div className="commit-message">{loadingFiles ? 'Loading files...' : `${files.length} items`}</div><code>local</code><span>{project.status}</span><Check className="ok" size={18} /></div>
          {files.map((row) => <FileRow key={row.path} row={row} onOpen={onOpenFile} />)}
          {!loadingFiles && files.length === 0 && <div className="empty-list">This folder is empty.</div>}
        </div>
      </>}

      <div className="private-note"><Lock size={16} /> This project lives on your VM filesystem.</div>
      <div className="self-hosted"><Database size={17} /> Self-hosted</div>
    </section>
  );
}

function EditorModal({ file, value, setValue, onClose, onSave, saving }) {
  if (!file) return null;
  return (
    <div className="modal-backdrop">
      <section className="editor-modal">
        <header><div><p>Editing</p><h3>{file.path}</h3></div><button className="ghost-icon" onClick={onClose}><X size={19} /></button></header>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} spellCheck="false" />
        <footer><button className="secondary" onClick={onClose}>Cancel</button><button className="primary" onClick={onSave} disabled={saving}><Save size={18} /> {saving ? 'Saving...' : 'Save file'}</button></footer>
      </section>
    </div>
  );
}

function MobilePreview(props) {
  const { project, activeTab, setActiveTab, onRefresh } = props;
  return (
    <section className="phone-frame" aria-label="Mobile file workspace preview">
      <div className="phone-top"><BrandMark /><span className="divider" /><span className="avatar" /><strong>VM / <b>{project?.name || 'QNWRK'}</b></strong><Copy size={18} /><button className="like"><Heart size={18} /> like <span>0</span></button><Menu size={26} /></div>
      <div className="phone-actions"><button className="running"><span /> {project ? 'Running' : 'Idle'}</button><button onClick={onRefresh}><ListFilter size={20} /></button><button><MoreVertical size={20} /></button></div>
      <nav className="tabs"><a className={activeTab === 'app' ? 'active' : ''} onClick={() => setActiveTab('app')}><Box size={20} /> App</a><a className={activeTab === 'files' ? 'active' : ''} onClick={() => setActiveTab('files')}><ListFilter size={20} /> Files</a><a className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}><TerminalSquare size={20} /> Logs</a><a><Settings size={20} /> Settings</a></nav>
      {project ? <WorkspacePanel {...props} /> : <div className="no-project-phone">Create a project below to activate the filesystem and iframe preview.</div>}
    </section>
  );
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [files, setFiles] = useState([]);
  const [cwd, setCwd] = useState('.');
  const [activeTab, setActiveTab] = useState('files');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [editorFile, setEditorFile] = useState(null);
  const [editorValue, setEditorValue] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedProject = projects.find((project) => project.slug === selectedSlug) || projects[0];

  async function loadProjects() {
    setLoadingProjects(true);
    try {
      const data = await api('/api/projects');
      setProjects(data.projects || []);
      if (!selectedSlug && data.projects?.[0]) setSelectedSlug(data.projects[0].slug);
    } catch (error) { setNotice(error.message); }
    finally { setLoadingProjects(false); }
  }

  async function loadFiles(slug = selectedProject?.slug, path = cwd) {
    if (!slug) return;
    setLoadingFiles(true);
    try {
      const query = new URLSearchParams({ path }).toString();
      const data = await api(`/api/projects/${slug}/files?${query}`);
      setFiles(data.files || []);
      setCwd(data.cwd || '.');
    } catch (error) { setNotice(error.message); }
    finally { setLoadingFiles(false); }
  }

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (selectedProject?.slug) loadFiles(selectedProject.slug, '.'); }, [selectedProject?.slug]);

  async function createProject(project) {
    const name = window.prompt(`Name this ${project.title} workspace`, `my-${project.type}-app`);
    if (!name) return;
    setBusy(true);
    try {
      const data = await api('/api/projects', { method: 'POST', body: JSON.stringify({ name, type: project.type }) });
      await loadProjects();
      setSelectedSlug(data.project.slug);
      setActiveTab('files');
      setNotice(`Created ${data.project.name}`);
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  async function openRow(row) {
    if (!selectedProject) return;
    if (row.type === 'folder') return loadFiles(selectedProject.slug, row.path);
    try {
      const query = new URLSearchParams({ path: row.path }).toString();
      const data = await api(`/api/projects/${selectedProject.slug}/file?${query}`);
      setEditorFile(data);
      setEditorValue(data.content);
    } catch (error) { setNotice(error.message); }
  }

  async function saveFile() {
    if (!selectedProject || !editorFile) return;
    setSaving(true);
    try {
      await api(`/api/projects/${selectedProject.slug}/file`, { method: 'PUT', body: JSON.stringify({ path: editorFile.path, content: editorValue }) });
      setEditorFile(null);
      await loadFiles(selectedProject.slug, cwd);
      setNotice(`Saved ${editorFile.path}`);
    } catch (error) { setNotice(error.message); }
    finally { setSaving(false); }
  }

  async function createFile() {
    if (!selectedProject) return;
    const name = window.prompt('File path inside this workspace', cwd === '.' ? 'index.html' : `${cwd}/new-file.txt`);
    if (!name) return;
    try {
      await api(`/api/projects/${selectedProject.slug}/file`, { method: 'PUT', body: JSON.stringify({ path: name, content: '' }) });
      await loadFiles(selectedProject.slug, cwd);
      setNotice(`Created ${name}`);
    } catch (error) { setNotice(error.message); }
  }

  async function createFolder() {
    if (!selectedProject) return;
    const name = window.prompt('Folder path inside this workspace', cwd === '.' ? 'src' : `${cwd}/new-folder`);
    if (!name) return;
    try {
      await api(`/api/projects/${selectedProject.slug}/folder`, { method: 'POST', body: JSON.stringify({ path: name }) });
      await loadFiles(selectedProject.slug, cwd);
      setNotice(`Created ${name}`);
    } catch (error) { setNotice(error.message); }
  }

  return (
    <main className="app-shell">
      <div className="grain" />
      {notice && <button className="toast" onClick={() => setNotice('')}>{notice}</button>}
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={16} /> QNWRK VM Workstation</div>
          <h1>Self-hosted Spaces, but built for your own VM.</h1>
          <p>Create real project folders on the VM, edit files in the browser, and preview static projects through the App iframe.</p>
          <div className="hero-actions"><button className="primary" onClick={() => selectedProject ? setActiveTab('files') : createProject(projectTypes[2])}><PlayCircle size={19} /> {selectedProject ? 'Open filesystem' : 'Create workspace'}</button><button className="secondary" onClick={() => setActiveTab('logs')}><TerminalSquare size={19} /> View build logs</button></div>
          <div className="project-strip">{loadingProjects && <span>Loading VM projects...</span>}{!loadingProjects && projects.map((project) => <button key={project.slug} className={project.slug === selectedProject?.slug ? 'active' : ''} onClick={() => setSelectedSlug(project.slug)}>{project.name}</button>)}</div>
        </div>
        <MobilePreview project={selectedProject} files={files} cwd={cwd} activeTab={activeTab} setActiveTab={setActiveTab} loadingFiles={loadingFiles} onOpenFile={openRow} onCreateFile={createFile} onCreateFolder={createFolder} onRefresh={() => loadFiles(selectedProject?.slug, cwd)} onGoRoot={() => loadFiles(selectedProject?.slug, '.')} />
      </section>
      {!selectedProject && <EmptyWorkspace onCreate={createProject} busy={busy} />}
      <section className="type-section"><div className="section-heading"><span>1</span><div><h2>Create project type</h2><p>This now creates real folders and starter files inside the VM workspace directory.</p></div></div><div className="type-grid">{projectTypes.map((project) => <ProjectTypeCard key={project.title} project={project} onCreate={createProject} busy={busy} />)}</div></section>
      <EditorModal file={editorFile} value={editorValue} setValue={setEditorValue} onClose={() => setEditorFile(null)} onSave={saveFile} saving={saving} />
    </main>
  );
}
