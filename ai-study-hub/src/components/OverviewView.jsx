import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  Edit3, 
  Check, 
  Clock, 
  BarChart2, 
  Layers, 
  BookOpen, 
  Zap, 
  Loader2 
} from 'lucide-react';
import { explainConceptMultiLevel } from '../services/gemini';

export default function OverviewView({ material, onUpdateMaterial, onNavigateTab }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(material?.title || '');
  const [editedContent, setEditedContent] = useState(material?.content || '');

  // Multi-level explanation state
  const [explanationLevel, setExplanationLevel] = useState('Intermediate');
  const [multiLevelText, setMultiLevelText] = useState('');
  const [isGeneratingLevel, setIsGeneratingLevel] = useState(false);

  useEffect(() => {
    if (material) {
      setEditedTitle(material.title);
      setEditedContent(material.content);
      setMultiLevelText('');
    }
  }, [material?.id]);

  const handleFetchLevelExplanation = async (targetLevel) => {
    setExplanationLevel(targetLevel);
    if (!material) return;
    setIsGeneratingLevel(true);
    try {
      const expText = await explainConceptMultiLevel({
        materialContent: material.content,
        conceptName: material.title,
        level: targetLevel
      });
      setMultiLevelText(expText);
    } catch (err) {
      console.error('Multi-level explanation error:', err);
    } finally {
      setIsGeneratingLevel(false);
    }
  };

  if (!material) {
    return (
      <div className="tab-viewport" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Material Selected</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Select a study material from the sidebar or click "New Study Material" to get started.
          </p>
        </div>
      </div>
    );
  }

  const wordCount = editedContent.split(/\s+/).filter(Boolean).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const handleSave = () => {
    onUpdateMaterial({
      ...material,
      title: editedTitle,
      content: editedContent
    });
    setIsEditing(false);
  };

  return (
    <div className="tab-viewport">
      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify-content: 'space-between',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--accent-primary)',
            letterSpacing: '0.05em'
          }}>
            {material.category}
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {material.title}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isEditing ? (
            <button className="btn-primary" onClick={handleSave}>
              <Check size={16} />
              <span>Save Changes</span>
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => setIsEditing(true)}>
              <Edit3 size={16} />
              <span>Edit Notes</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <FileText size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Word Count</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{wordCount} words</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-secondary)' }}>
            <Clock size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Read Time</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>~{readTimeMin} min read</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <BarChart2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gemini AI Status</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>6 Agents Ready</div>
          </div>
        </div>
      </div>

      {/* AI Agent Quick Launch Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div 
          className="glass-card"
          onClick={() => onNavigateTab('summary')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--accent-primary)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
            <Sparkles size={16} />
            <span>Agent 3 Summary</span>
          </div>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Extract executive summary, formulas, & analogies.
          </p>
        </div>

        <div 
          className="glass-card"
          onClick={() => onNavigateTab('tutor')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--accent-secondary)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-secondary)' }}>
            <MessageSquare size={16} />
            <span>Agent 2 AI Tutor</span>
          </div>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Chat with Socratic, Feynman, & Exam Coach personas.
          </p>
        </div>

        <div 
          className="glass-card"
          onClick={() => onNavigateTab('quiz')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--accent-amber)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-amber)' }}>
            <HelpCircle size={16} />
            <span>Agent 4 AI Quiz</span>
          </div>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            MCQ, short/long answer, & numerical quizzes.
          </p>
        </div>

        <div 
          className="glass-card"
          onClick={() => onNavigateTab('analytics')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--accent-emerald)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-emerald)' }}>
            <BarChart2 size={16} />
            <span>Agent 5 Analytics</span>
          </div>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Mastery score %, weak areas, & diagnostics.
          </p>
        </div>
      </div>

      {/* Agent 2 Multi-Level Explanation Toggle Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={16} />
            <span>Agent 2 Explanation Depth Switcher</span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <button
                key={lvl}
                className="btn-ghost"
                onClick={() => handleFetchLevelExplanation(lvl)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.775rem',
                  fontWeight: explanationLevel === lvl ? 700 : 500,
                  background: explanationLevel === lvl ? 'var(--accent-primary)' : 'var(--bg-input)',
                  color: explanationLevel === lvl ? '#fff' : 'var(--text-primary)'
                }}
              >
                {lvl} {lvl === 'Beginner' ? '(ELI5)' : lvl === 'Advanced' ? '(Deep Dive)' : ''}
              </button>
            ))}
          </div>
        </div>

        {isGeneratingLevel ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.5rem 0' }}>
            <Loader2 size={16} className="spinner" />
            <span>Gemini Agent 2 is reformulating explanation for **{explanationLevel}** level...</span>
          </div>
        ) : multiLevelText ? (
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            color: 'var(--text-primary)'
          }}>
            {multiLevelText}
          </div>
        ) : (
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Click any level above (Beginner / Intermediate / Advanced) to generate a tailored explanation depth via Gemini.
          </div>
        )}
      </div>

      {/* Main Material Content View / Editor */}
      <div className="glass-card" style={{ flex: 1, minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        {material?.mediaUrl && (
          <div style={{
            marginBottom: '1.25rem',
            padding: '0.75rem',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
              📷 Attached Visual Reference Image
            </div>
            <img 
              src={material.mediaUrl} 
              alt={material.title} 
              style={{
                maxHeight: '320px',
                maxWidth: '100%',
                borderRadius: '8px',
                objectFit: 'contain'
              }}
            />
          </div>
        )}

        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          {isEditing ? 'Edit Notebook Content (Markdown Supported)' : 'Notebook Content'}
        </h3>

        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            style={{
              flex: 1,
              width: '100%',
              minHeight: '300px',
              padding: '1rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              resize: 'vertical'
            }}
          />
        ) : (
          <div style={{
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)'
          }}>
            {editedContent}
          </div>
        )}
      </div>
    </div>
  );
}
