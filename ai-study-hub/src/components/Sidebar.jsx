import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Settings, 
  Sun, 
  Moon, 
  Search, 
  Sparkles, 
  Trash2, 
  Atom, 
  Dna, 
  Cpu, 
  FileText,
  Image as ImageIcon,
  FileCode,
  PanelLeftClose,
  PanelLeft,
  ChevronRight
} from 'lucide-react';

const iconMap = {
  Atom: Atom,
  Dna: Dna,
  Cpu: Cpu,
  FileText: FileText,
  Image: ImageIcon,
  FileCode: FileCode,
  BookOpen: BookOpen
};

export default function Sidebar({
  materials,
  activeMaterialId,
  onSelectMaterial,
  onOpenAddModal,
  onOpenSettings,
  onOpenCommandPalette,
  onDeleteMaterial,
  theme,
  onToggleTheme,
  isOpen,
  onToggleOpen
}) {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(filterQuery.toLowerCase())
  );

  if (!isOpen) {
    return (
      <div style={{
        width: '56px',
        height: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem 0',
        gap: '1rem',
        zIndex: 20
      }}>
        <button 
          className="btn-ghost" 
          onClick={onToggleOpen}
          title="Expand Sidebar"
          style={{ padding: '0.5rem' }}
        >
          <PanelLeft size={20} />
        </button>
        <button 
          className="btn-ghost"
          onClick={onOpenAddModal}
          title="New Study Material"
          style={{ color: 'var(--accent-primary)', padding: '0.5rem' }}
        >
          <Plus size={20} />
        </button>
      </div>
    );
  }

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 20
    }}>
      {/* Sidebar Header */}
      <div style={{
        padding: '1.25rem 1rem 0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justify-content: 'space-between',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justify-content: 'center',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
              MindSpark <span className="gradient-text">AI</span>
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Notion AI Study Workspace
            </span>
          </div>
        </div>

        <button 
          className="btn-ghost" 
          onClick={onToggleOpen}
          title="Collapse Sidebar"
          style={{ padding: '0.35rem' }}
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* Primary Action Button */}
      <div style={{ padding: '1rem' }}>
        <button 
          className="btn-primary" 
          onClick={onOpenAddModal}
          style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 1rem' }}
        >
          <Plus size={18} />
          <span>New Study Material</span>
        </button>
      </div>

      {/* Quick Search & Filter */}
      <div style={{ padding: '0 1rem 0.75rem 1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.45rem 0.75rem'
        }}>
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search notebook notes..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.825rem',
              width: '100%',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      {/* Study Materials Navigation Tree */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 0.5rem'
      }}>
        <div style={{
          fontSize: '0.725rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted)',
          padding: '0.5rem 0.75rem 0.25rem 0.75rem'
        }}>
          Study Notebooks ({filteredMaterials.length})
        </div>

        {filteredMaterials.length === 0 ? (
          <div style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}>
            No materials found.
          </div>
        ) : (
          filteredMaterials.map((mat) => {
            const IconComp = iconMap[mat.icon] || FileText;
            const isActive = mat.id === activeMaterialId;

            return (
              <div 
                key={mat.id}
                onClick={() => onSelectMaterial(mat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify-content: 'space-between',
                  padding: '0.6rem 0.75rem',
                  margin: '0.15rem 0',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
                className="sidebar-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                  <IconComp size={17} style={{
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    flexShrink: 0
                  }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {mat.title}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)'
                    }}>
                      {mat.category}
                    </div>
                  </div>
                </div>

                <button
                  className="btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMaterial(mat.id);
                  }}
                  title="Delete material"
                  style={{
                    padding: '0.2rem',
                    opacity: 0.5,
                    color: 'var(--accent-rose)'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Settings & Theme Toggle */}
      <div style={{
        padding: '0.75rem 1rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justify-content: 'space-between'
      }}>
        <button 
          className="btn-ghost" 
          onClick={onOpenSettings}
          style={{ gap: '0.5rem', fontSize: '0.825rem' }}
        >
          <Settings size={16} />
          <span>Gemini Settings</span>
        </button>

        <button 
          className="btn-ghost" 
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          style={{ padding: '0.4rem' }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </aside>
  );
}
