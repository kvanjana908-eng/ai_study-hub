import React from 'react';
import { 
  FileText, 
  MessageSquare, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  GitFork, 
  Compass, 
  Command,
  KeyCheck,
  Key,
  BarChart2
} from 'lucide-react';
import { getStoredApiKey } from '../services/gemini';

export default function TopBar({
  activeMaterial,
  activeTab,
  onTabChange,
  onOpenCommandPalette,
  onOpenSettings
}) {
  const apiKey = getStoredApiKey();
  const isKeyConfigured = Boolean(apiKey);

  const tabs = [
    { id: 'overview', label: 'Notebook Notes', icon: FileText },
    { id: 'tutor', label: 'AI Tutor Chat', icon: MessageSquare },
    { id: 'summary', label: 'AI Summary', icon: Sparkles },
    { id: 'quiz', label: 'Dynamic Quiz', icon: HelpCircle },
    { id: 'analytics', label: 'Learning Analytics', icon: BarChart2 },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'mindmap', label: 'Concept Map', icon: GitFork },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Compass }
  ];

  return (
    <header className="top-navbar">
      <div className="top-nav-left">
        {activeMaterial ? (
          <div className="material-title-badge">
            <span style={{ color: 'var(--accent-primary)' }}>📚</span>
            <span>{activeMaterial.title}</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Select or create study material
          </span>
        )}

        {/* Workspace Tab Buttons */}
        <nav className="nav-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Command Palette Trigger */}
        <button
          className="btn-secondary"
          onClick={onOpenCommandPalette}
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.5rem' }}
          title="Command Palette (Ctrl+K)"
        >
          <Command size={14} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <kbd style={{
              background: 'var(--bg-primary)',
              padding: '0.1rem 0.3rem',
              borderRadius: '4px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)'
            }}>Ctrl</kbd>
            <kbd style={{
              background: 'var(--bg-primary)',
              padding: '0.1rem 0.3rem',
              borderRadius: '4px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)'
            }}>K</kbd>
          </span>
        </button>

        {/* Gemini API Key Indicator */}
        <button
          onClick={onOpenSettings}
          style={{
            padding: '0.35rem 0.65rem',
            borderRadius: '20px',
            background: isKeyConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: isKeyConfigured ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
            color: isKeyConfigured ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer'
          }}
          title="Click to configure Gemini API Key"
        >
          {isKeyConfigured ? <KeyCheck size={14} /> : <Key size={14} />}
          <span>{isKeyConfigured ? 'Gemini 2.0 Active' : 'Configure Gemini Key'}</span>
        </button>
      </div>
    </header>
  );
}
