import { Check, ChevronDown, Database, GitBranch, History, Lock, TerminalSquare } from 'lucide-react';
import AppPreview from '../components/AppPreview.jsx';
import FileBrowser, { formatBytes } from '../components/FileBrowser.jsx';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import WorkspaceTabs from '../components/WorkspaceTabs.jsx';

export default function WorkspacePage({ project, files, cwd, activeTab, setActiveTab, loadingFiles, onOpenFile, onCreateFile, onCreateFolder, onRefresh, onGoRoot }) {
  const totalSize = files.reduce((sum, row) => sum + (row.size || 0), 0);

  return (
    <section className="phone-frame" aria-label="Mobile file workspace preview">
      <WorkspaceHeader project={project} onRefresh={onRefresh} />
      <WorkspaceTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {project ? (
        <section className="workspace-panel live-panel">
          <div className="workspace-tools">
            <button className="branch-pill"><GitBranch size={18} /> main <ChevronDown size={16} /></button>
            <div className="repo-title">{project.name} <span>{formatBytes(totalSize)}</span></div>
          </div>

          <div className="workspace-meta">
            <div className="owner-line"><span className="avatar" /> {project.owner || 'VM'} <small>{project.type}</small></div>
            <button className="history-pill"><History size={19} /> Local VM files</button>
          </div>

          {activeTab === 'app' && <AppPreview project={project} />}
          {activeTab === 'files' && <FileBrowser project={project} files={files} cwd={cwd} loadingFiles={loadingFiles} onOpenFile={onOpenFile} onCreateFile={onCreateFile} onCreateFolder={onCreateFolder} onRefresh={onRefresh} onGoRoot={onGoRoot} />}
          {activeTab === 'logs' && <div className="logs-panel"><p><span>$</span> QNWRK runner is ready.</p><p><span>$</span> Filesystem API connected to {project.slug}</p><p><span>$</span> Docker and Gradio runner controls come next.</p></div>}
          {activeTab === 'settings' && <div className="logs-panel"><p><span>$</span> Settings placeholder.</p><p>Environment variables, preview port, and runner config will live here.</p></div>}

          <div className="private-note"><Lock size={16} /> This project lives on your VM filesystem.</div>
          <div className="self-hosted"><Database size={17} /> Self-hosted</div>
        </section>
      ) : (
        <div className="no-project-phone">Create a project below to activate the filesystem and iframe preview.</div>
      )}
    </section>
  );
}
