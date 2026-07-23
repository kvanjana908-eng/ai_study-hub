import React, { useState, useEffect } from 'react';
import { Search, Sparkles, FileText, MessageSquare, HelpCircle, Layers, GitFork, Compass, Plus, BarChart2 } from 'lucide-react';

export default function CommandPaletteModal({
  onClose,
  materials,
  onSelectMaterial,
  onSelectTab,
  onOpenAddModal
}) {
  const [query, setQuery] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const actionItems = [
    { id: 'new-mat', label: 'Create New Study Notebook', icon: Plus, action: () => { onOpenAddModal(); onClose(); } },
    { id: 'nav-tutor', label: 'Launch AI Tutor Chat (Agent 2)', icon: MessageSquare, action: () => { onSelectTab('tutor'); onClose(); } },
    { id: 'nav-summary', label: 'Generate AI Summary (Agent 3)', icon: Sparkles, action: () => { onSelectTab('summary'); onClose(); } },
    { id: 'nav-quiz', label: 'Start Dynamic AI Quiz (Agent 4)', icon: HelpCircle, action: () => { onSelectTab('quiz'); onClose(); } },
    { id: 'nav-analytics', label: 'View Learning Analytics (Agent 5)', icon: BarChart2, action: () => { onSelectTab('analytics'); onClose(); } },
    { id: 'nav-cards', label: 'Open Flashcards Deck (Agent 3)', icon: Layers, action: () => { onSelectTab('flashcards'); onClose(); } },
    { id: 'nav-map', label: 'View Concept Mind Map (Agent 3)', icon: GitFork, action: () => { onSelectTab('mindmap'); onClose(); } },
    { id: 'nav-road', label: 'View Learning Roadmap (Agent 6)', icon: Compass, action: () => { onSelectTab('roadmap'); onClose(); } },
  ];

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(query.toLowerCase()) ||
    m.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = actionItems.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cmd-palette" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input-wrapper">
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="cmd-input"
            placeholder="Type a command or search notebook..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '0.5rem' }}>
          {/* Actions Section */}
          {filteredActions.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.4rem 0.75rem', textTransform: 'uppercase' }}>
                Quick Actions
              </div>
              {filteredActions.map((act) => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    className="cmd-item"
                    onClick={act.action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon size={16} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{act.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Notebook Materials Section */}
          {filteredMaterials.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.4rem 0.75rem', textTransform: 'uppercase' }}>
                Study Notebooks ({filteredMaterials.length})
              </div>
              {filteredMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="cmd-item"
                  onClick={() => {
                    onSelectMaterial(mat.id);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify-content: 'space-between',
                    padding: '0.6rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <FileText size={16} style={{ color: 'var(--text-secondary)' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{mat.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{mat.category}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
