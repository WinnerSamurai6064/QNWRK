import { useEffect, useState } from 'react';
import { PlayCircle, Sparkles, TerminalSquare } from 'lucide-react';
import { createFolder, createProject, listFiles, listProjects, readFile, saveFile } from './api/qnwrk.js';
import EditorModal from './components/EditorModal.jsx';
import { projectTypes } from './components/ProjectTypeCards.jsx';
import ProjectTypePage from './pages/ProjectTypePage.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';

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
      const data = await listProjects();
      const nextProjects = data.projects || [];
      setProjects(nextProjects);
      if (!selectedSlug && nextProjects[0]) setSelectedSlug(nextProjects[0].slug);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoadingProjects(false);
    }
  }

  async function loadProjectFiles(slug = selectedProject?.slug, path = cwd) {
    if (!slug) return;
    setLoadingFiles(true);
    try {
      const data = await listFiles(slug, path);
      setFiles(data.files || []);
      setCwd(data.cwd || '.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoadingFiles(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject?.slug) loadProjectFiles(selectedProject.slug, '.');
  }, [selectedProject?.slug]);

  async function handleCreateProject(projectType) {
    const name = window.prompt(`Name this ${projectType.title} workspace`, `my-${projectType.type}-app`);
    if (!name) return;

    setBusy(true);
    try {
      const data = await createProject({ name, type: projectType.type });
      await loadProjects();
      setSelectedSlug(data.project.slug);
      setActiveTab('files');
      setNotice(`Created ${data.project.name}`);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleOpenFile(row) {
    if (!selectedProject) return;
    if (row.type === 'folder') {
      await loadProjectFiles(selectedProject.slug, row.path);
      return;
    }

    try {
      const data = await readFile(selectedProject.slug, row.path);
      setEditorFile(data);
      setEditorValue(data.content);
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function handleSaveFile() {
    if (!selectedProject || !editorFile) return;

    setSaving(true);
    try {
      await saveFile(selectedProject.slug, editorFile.path, editorValue);
      setEditorFile(null);
      await loadProjectFiles(selectedProject.slug, cwd);
      setNotice(`Saved ${editorFile.path}`);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateFile() {
    if (!selectedProject) return;
    const fallback = cwd === '.' ? 'index.html' : `${cwd}/new-file.txt`;
    const path = window.prompt('File path inside this workspace', fallback);
    if (!path) return;

    try {
      await saveFile(selectedProject.slug, path, '');
      await loadProjectFiles(selectedProject.slug, cwd);
      setNotice(`Created ${path}`);
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function handleCreateFolder() {
    if (!selectedProject) return;
    const fallback = cwd === '.' ? 'src' : `${cwd}/new-folder`;
    const path = window.prompt('Folder path inside this workspace', fallback);
    if (!path) return;

    try {
      await createFolder(selectedProject.slug, path);
      await loadProjectFiles(selectedProject.slug, cwd);
      setNotice(`Created ${path}`);
    } catch (error) {
      setNotice(error.message);
    }
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
          <div className="hero-actions">
            <button className="primary" onClick={() => selectedProject ? setActiveTab('files') : handleCreateProject(projectTypes[2])}>
              <PlayCircle size={19} /> {selectedProject ? 'Open filesystem' : 'Create workspace'}
            </button>
            <button className="secondary" onClick={() => setActiveTab('logs')}><TerminalSquare size={19} /> View build logs</button>
          </div>

          <ProjectTypePage
            projects={projects}
            selectedProject={selectedProject}
            setSelectedSlug={setSelectedSlug}
            onCreateProject={handleCreateProject}
            busy={busy}
            loadingProjects={loadingProjects}
          />
        </div>

        <WorkspacePage
          project={selectedProject}
          files={files}
          cwd={cwd}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          loadingFiles={loadingFiles}
          onOpenFile={handleOpenFile}
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
          onRefresh={() => loadProjectFiles(selectedProject?.slug, cwd)}
          onGoRoot={() => loadProjectFiles(selectedProject?.slug, '.')}
        />
      </section>

      <EditorModal
        file={editorFile}
        value={editorValue}
        setValue={setEditorValue}
        onClose={() => setEditorFile(null)}
        onSave={handleSaveFile}
        saving={saving}
      />
    </main>
  );
}
