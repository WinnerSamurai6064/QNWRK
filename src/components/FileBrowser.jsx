import { Braces, Check, File, FileText, Folder, History, ListFilter, MoreVertical, Plus, RefreshCw } from 'lucide-react';

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

export default function FileBrowser({ project, files, cwd, loadingFiles, onOpenFile, onCreateFile, onCreateFolder, onRefresh, onGoRoot }) {
  if (!project) return <div className="no-project-phone">Create a project to activate the filesystem.</div>;

  return (
    <>
      <div className="file-actions-row">
        <button className="contribute-btn" onClick={onCreateFile}><Plus size={20} /> New file</button>
        <button className="folder-btn" onClick={onCreateFolder}><Folder size={18} /> New folder</button>
      </div>

      <div className="path-line">
        <button onClick={onGoRoot}>/{project.slug}</button>
        {cwd !== '.' && <span>/ {cwd}</span>}
        <button onClick={onRefresh} aria-label="Refresh files"><RefreshCw size={16} /></button>
      </div>

      <div className="file-table">
        <div className="commit-row">
          <div className="commit-author"><span className="avatar mini" /> VM filesystem</div>
          <div className="commit-message">{loadingFiles ? 'Loading files...' : `${files.length} items`}</div>
          <code>local</code>
          <span>{project.status}</span>
          <Check className="ok" size={18} />
        </div>
        {files.map((row) => <FileRow key={row.path} row={row} onOpen={onOpenFile} />)}
        {!loadingFiles && files.length === 0 && <div className="empty-list">This folder is empty.</div>}
      </div>
    </>
  );
}

export { formatBytes };
