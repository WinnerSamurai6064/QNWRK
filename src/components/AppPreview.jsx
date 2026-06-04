export default function AppPreview({ project }) {
  if (!project) {
    return <div className="no-project-phone">Create a project to activate the iframe preview.</div>;
  }

  return (
    <div className="app-preview-wrap">
      <iframe title={`${project.name} preview`} src={project.previewPath} />
    </div>
  );
}
