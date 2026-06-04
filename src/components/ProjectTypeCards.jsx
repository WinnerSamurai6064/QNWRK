import { ChevronDown, Code2, Server, Wand2 } from 'lucide-react';

export const projectTypes = [
  { title: 'Docker', type: 'docker', icon: Server, copy: 'Containerized projects with Dockerfile, ports, logs, and runner controls.', tags: ['containers', 'images', 'ports'], tone: 'indigo' },
  { title: 'Gradio', type: 'gradio', icon: Wand2, copy: 'Python UI apps with app.py, requirements.txt, live preview, and runtime logs.', tags: ['python', 'app.py', 'models'], tone: 'violet' },
  { title: 'Static', type: 'static', icon: Code2, copy: 'HTML, CSS, JS, docs, landing pages, and preview-first web projects.', tags: ['html', 'css', 'assets'], tone: 'plum' }
];

function ProjectTypeCard({ project, onCreate, busy }) {
  const Icon = project.icon;
  return (
    <article className={`type-card ${project.tone}`}>
      <div className="type-card-top">
        <div className="type-icon"><Icon size={22} /></div>
        <button className="round-action" onClick={() => onCreate(project)} disabled={busy} aria-label={`Create ${project.title}`}>
          <ChevronDown size={18} className="rotate-corner" />
        </button>
      </div>
      <h3>{project.title}</h3>
      <p>{project.copy}</p>
      <div className="tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </article>
  );
}

export default function ProjectTypeCards({ onCreate, busy }) {
  return (
    <div className="type-grid">
      {projectTypes.map((project) => (
        <ProjectTypeCard key={project.title} project={project} onCreate={onCreate} busy={busy} />
      ))}
    </div>
  );
}
