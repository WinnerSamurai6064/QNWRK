import { Box, ListFilter, Settings, TerminalSquare } from 'lucide-react';

export default function WorkspaceTabs({ activeTab, setActiveTab }) {
  return (
    <nav className="tabs">
      <a className={activeTab === 'app' ? 'active' : ''} onClick={() => setActiveTab('app')}><Box size={20} /> App</a>
      <a className={activeTab === 'files' ? 'active' : ''} onClick={() => setActiveTab('files')}><ListFilter size={20} /> Files</a>
      <a className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}><TerminalSquare size={20} /> Logs</a>
      <a className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}><Settings size={20} /> Settings</a>
    </nav>
  );
}
