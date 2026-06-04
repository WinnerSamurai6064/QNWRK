import { Copy, Heart, ListFilter, Menu, MoreVertical, RefreshCw } from 'lucide-react';

export function BrandMark() {
  return (
    <div className="brand-mark" aria-label="QNWRK logo">
      <span />
      <span />
      <span />
    </div>
  );
}

export default function WorkspaceHeader({ project, onRefresh }) {
  return (
    <>
      <div className="phone-top">
        <BrandMark />
        <span className="divider" />
        <span className="avatar" />
        <strong>VM / <b>{project?.name || 'QNWRK'}</b></strong>
        <Copy size={18} />
        <button className="like"><Heart size={18} /> like <span>0</span></button>
        <Menu size={26} />
      </div>

      <div className="phone-actions">
        <button className="running"><span /> {project ? 'Running' : 'Idle'}</button>
        <button onClick={onRefresh} aria-label="Refresh workspace"><RefreshCw size={20} /></button>
        <button aria-label="Workspace menu"><MoreVertical size={20} /></button>
      </div>
    </>
  );
}
