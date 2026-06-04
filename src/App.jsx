import {
  Box,
  Braces,
  Check,
  ChevronDown,
  Clock3,
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
  Package,
  PlayCircle,
  Plus,
  Search,
  Server,
  Settings,
  Sparkles,
  TerminalSquare,
  Users,
  Wand2
} from 'lucide-react';

const projectTypes = [
  {
    title: 'Docker',
    icon: Server,
    copy: 'Containerized projects with build logs, ports, env files, and restart controls.',
    tags: ['containers', 'images', 'ports'],
    tone: 'indigo'
  },
  {
    title: 'Gradio',
    icon: Wand2,
    copy: 'Python UI apps with requirements, live preview, and clean runtime logs.',
    tags: ['python', 'app.py', 'models'],
    tone: 'violet'
  },
  {
    title: 'Static',
    icon: Code2,
    copy: 'HTML, CSS, JS, docs, landing pages, and preview-first web projects.',
    tags: ['html', 'css', 'assets'],
    tone: 'plum'
  }
];

const fileRows = [
  { name: '.vision', type: 'folder', updated: '3 days ago', size: '—' },
  { name: 'models', type: 'folder', updated: '2 days ago', size: '—' },
  { name: 'profiles', type: 'folder', updated: '5 days ago', size: '—' },
  { name: 'public', type: 'folder', updated: '3 days ago', size: '—' },
  { name: 'scripts', type: 'folder', updated: '2 days ago', size: '—' },
  { name: 'src', type: 'folder', updated: '1 day ago', size: '—' },
  { name: '.gitattributes', type: 'file', updated: '1 week ago', size: '1.52 kB' },
  { name: 'Dockerfile', type: 'file', updated: '2 days ago', size: '1.27 kB' },
  { name: 'README.md', type: 'md', updated: '2 days ago', size: '203 Bytes' },
  { name: 'package.json', type: 'js', updated: '2 days ago', size: '628 Bytes' },
  { name: 'requirements.txt', type: 'file', updated: '2 days ago', size: '65 Bytes' },
  { name: 'server.js', type: 'js', updated: '1 day ago', size: '1.42 kB' }
];

function BrandMark() {
  return (
    <div className="brand-mark" aria-label="QNWRK logo">
      <span />
      <span />
      <span />
    </div>
  );
}

function ProjectTypeCard({ project }) {
  const Icon = project.icon;
  return (
    <article className={`type-card ${project.tone}`}>
      <div className="type-card-top">
        <div className="type-icon"><Icon size={22} /></div>
        <button className="round-action" aria-label={`Open ${project.title}`}>
          <ChevronDown size={18} className="rotate-corner" />
        </button>
      </div>
      <h3>{project.title}</h3>
      <p>{project.copy}</p>
      <div className="tags">
        {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
    </article>
  );
}

function FileIcon({ type }) {
  if (type === 'folder') return <Folder className="folder-icon" size={21} fill="currentColor" />;
  if (type === 'md') return <FileText className="md-icon" size={21} />;
  if (type === 'js') return <Braces className="js-icon" size={21} />;
  return <File className="file-icon" size={21} />;
}

function FileRow({ row }) {
  return (
    <div className="file-row">
      <div className="file-name"><FileIcon type={row.type} /><span>{row.name}</span></div>
      <div className="file-size">{row.size}</div>
      <div className="file-date">{row.updated}</div>
      <button className="ghost-icon" aria-label={`Actions for ${row.name}`}><MoreVertical size={18} /></button>
    </div>
  );
}

function WorkspacePreview() {
  return (
    <section className="workspace-panel">
      <div className="workspace-tools">
        <button className="branch-pill"><GitBranch size={18} /> main <ChevronDown size={16} /></button>
        <div className="repo-title">Rerez <span>69.7 MB</span></div>
        <button className="search-btn" aria-label="Search files"><Search size={21} /></button>
      </div>

      <div className="workspace-meta">
        <div className="owner-line"><span className="avatar" /> EricaLuvGemma <small>1 contributor</small></div>
        <button className="history-pill"><History size={19} /> History: 66 commits</button>
      </div>

      <button className="contribute-btn"><Plus size={20} /> Contribute <ChevronDown size={17} /></button>

      <div className="file-table">
        <div className="commit-row">
          <div className="commit-author"><span className="avatar mini" /> EricaLuvGemma</div>
          <div className="commit-message">Update README.md</div>
          <code>a1b2c3d</code>
          <span>2 days ago</span>
          <Check className="ok" size={18} />
        </div>
        {fileRows.map((row) => <FileRow key={row.name} row={row} />)}
      </div>

      <div className="private-note"><Lock size={16} /> This repository is private on your self-hosted workspace.</div>
      <div className="self-hosted"><Database size={17} /> Self-hosted</div>
    </section>
  );
}

function MobilePreview() {
  return (
    <section className="phone-frame" aria-label="Mobile file workspace preview">
      <div className="phone-top">
        <BrandMark />
        <span className="divider" />
        <span className="avatar" />
        <strong>EricaLuvGemma / <b>Rerez</b></strong>
        <Copy size={18} />
        <button className="like"><Heart size={18} /> like <span>0</span></button>
        <Menu size={26} />
      </div>
      <div className="phone-actions">
        <button className="running"><span /> Running</button>
        <button><ListFilter size={20} /></button>
        <button><MoreVertical size={20} /></button>
      </div>
      <nav className="tabs">
        <a><Box size={20} /> App</a>
        <a className="active"><ListFilter size={20} /> Files</a>
        <a>👋 Community</a>
        <a><Settings size={20} /> Settings</a>
      </nav>
      <WorkspacePreview />
    </section>
  );
}

export default function App() {
  return (
    <main className="app-shell">
      <div className="grain" />
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={16} /> QNWRK VM Workstation</div>
          <h1>Self-hosted Spaces, but built for your own VM.</h1>
          <p>
            Manage files, run Docker or Gradio projects, commit from the browser, and preview the live app through an iframe without living inside SSH all day.
          </p>
          <div className="hero-actions">
            <button className="primary"><PlayCircle size={19} /> Open workspace</button>
            <button className="secondary"><TerminalSquare size={19} /> View build logs</button>
          </div>
        </div>
        <MobilePreview />
      </section>

      <section className="type-section">
        <div className="section-heading">
          <span>1</span>
          <div>
            <h2>Choose project type</h2>
            <p>This determines the files, runner, ports, and preview behavior inside the VM.</p>
          </div>
        </div>
        <div className="type-grid">
          {projectTypes.map((project) => <ProjectTypeCard key={project.title} project={project} />)}
        </div>
      </section>
    </main>
  );
}
