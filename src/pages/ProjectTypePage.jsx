import { Database } from 'lucide-react';
import ProjectTypeCards, { projectTypes } from '../components/ProjectTypeCards.jsx';

export default function ProjectTypePage({ projects, selectedProject, setSelectedSlug, onCreateProject, busy, loadingProjects }) {
  return (
    <>
      <div className="project-strip">
        {loadingProjects && <span>Loading VM projects...</span>}
        {!loadingProjects && projects.map((project) => (
          <button key={project.slug} className={project.slug === selectedProject?.slug ? 'active' : ''} onClick={() => setSelectedSlug(project.slug)}>
            {project.name}
          </button>
        ))}
      </div>

      {!selectedProject && (
        <section className="workspace-empty">
          <div className="empty-orb"><Database size={38} /></div>
          <h2>No VM workspace yet</h2>
          <p>Create a real project below. QNWRK will create the folder and starter files inside the VM workspace directory.</p>
          <div className="empty-actions">
            {projectTypes.map((project) => {
              const Icon = project.icon;
              return <button key={project.type} onClick={() => onCreateProject(project)} disabled={busy}><Icon size={18} /> New {project.title}</button>;
            })}
          </div>
        </section>
      )}

      <section className="type-section">
        <div className="section-heading">
          <span>1</span>
          <div>
            <h2>Create project type</h2>
            <p>This creates real folders and starter files inside the VM workspace directory.</p>
          </div>
        </div>
        <ProjectTypeCards onCreate={onCreateProject} busy={busy} />
      </section>
    </>
  );
}
