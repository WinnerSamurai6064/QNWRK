import { Save, X } from 'lucide-react';

export default function EditorModal({ file, value, setValue, onClose, onSave, saving }) {
  if (!file) return null;

  return (
    <div className="modal-backdrop">
      <section className="editor-modal">
        <header>
          <div>
            <p>Editing</p>
            <h3>{file.path}</h3>
          </div>
          <button className="ghost-icon" onClick={onClose} aria-label="Close editor"><X size={19} /></button>
        </header>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} spellCheck="false" />
        <footer>
          <button className="secondary" onClick={onClose}>Cancel</button>
          <button className="primary" onClick={onSave} disabled={saving}><Save size={18} /> {saving ? 'Saving...' : 'Save file'}</button>
        </footer>
      </section>
    </div>
  );
}
