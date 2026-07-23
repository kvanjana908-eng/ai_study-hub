import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  RefreshCw, 
  Code, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Layers 
} from 'lucide-react';
import { generateMindMap } from '../services/gemini';

export default function MindMapView({ material }) {
  const [mindMapData, setMindMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('visual'); // 'visual' or 'mermaid'
  const [copied, setCopied] = useState(false);

  const fetchMindMap = async () => {
    if (!material) return;
    setLoading(true);
    setError('');
    try {
      const data = await generateMindMap({ materialContent: material.content });
      setMindMapData(data);
    } catch (err) {
      console.error('Mind Map Generation Error:', err);
      setError(`Failed to generate Mind Map: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMindMap();
  }, [material?.id]);

  const handleCopyMermaid = () => {
    if (!mindMapData?.mermaidDiagram) return;
    navigator.clipboard.writeText(mindMapData.mermaidDiagram);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tab-viewport">
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify-content: 'space-between',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-purple)', letterSpacing: '0.05em' }}>
            Agent 3 • Mind Maps & Concept Diagrams
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Interactive AI Mind Map & Hierarchy
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '0.2rem' }}>
            <button
              className={`btn-ghost ${viewMode === 'visual' ? 'active' : ''}`}
              onClick={() => setViewMode('visual')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                background: viewMode === 'visual' ? 'var(--accent-purple)' : 'transparent',
                color: viewMode === 'visual' ? '#fff' : 'var(--text-primary)'
              }}
            >
              <Layers size={14} />
              <span>Visual Tree</span>
            </button>
            <button
              className={`btn-ghost ${viewMode === 'mermaid' ? 'active' : ''}`}
              onClick={() => setViewMode('mermaid')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                background: viewMode === 'mermaid' ? 'var(--accent-purple)' : 'transparent',
                color: viewMode === 'mermaid' ? '#fff' : 'var(--text-primary)'
              }}
            >
              <Code size={14} />
              <span>Mermaid Diagram</span>
            </button>
          </div>

          <button className="btn-secondary" onClick={fetchMindMap} disabled={loading} style={{ gap: '0.4rem' }}>
            {loading ? <Loader2 size={16} className="spinner" /> : <RefreshCw size={16} />}
            <span>Re-Generate</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: 'var(--accent-rose)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem'
        }}>
          {error}
        </div>
      )}

      {loading && !mindMapData && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', gap: '1rem' }}>
          <Loader2 size={40} className="spinner" style={{ color: 'var(--accent-purple)' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Gemini Agent 3 is Mapping Concepts...</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Extracting core subject, primary branches, and sub-node relationships.
          </p>
        </div>
      )}

      {mindMapData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Visual Concept Tree View */}
          {viewMode === 'visual' && (
            <div className="glass-card" style={{ padding: '1.5rem', minHeight: '420px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                {/* Root Node */}
                <div style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                  textAlign: 'center',
                  maxWidth: '360px'
                }}>
                  {mindMapData.root?.label || material?.title}
                  <div style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.9, marginTop: '0.25rem' }}>
                    {mindMapData.root?.description}
                  </div>
                </div>

                {/* Primary Branch Nodes Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1.25rem',
                  width: '100%'
                }}>
                  {mindMapData.root?.children?.map((branch, bIdx) => (
                    <div key={bIdx} style={{
                      padding: '1.1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      borderTop: `4px solid ${branch.color || 'var(--accent-primary)'}`,
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        🌿 {branch.label}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {branch.description}
                      </div>

                      {/* Sub-children */}
                      {branch.children && branch.children.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                          {branch.children.map((sub, sIdx) => (
                            <div key={sIdx} style={{
                              padding: '0.4rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--bg-input)',
                              fontSize: '0.775rem',
                              color: 'var(--text-primary)'
                            }}>
                              • <strong>{sub.label}:</strong> {sub.description}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mermaid Diagram Code View */}
          {viewMode === 'mermaid' && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Mermaid.js Diagram Source String
                </span>
                <button className="btn-secondary" onClick={handleCopyMermaid} style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied Code' : 'Copy Mermaid Code'}</span>
                </button>
              </div>

              <pre style={{
                background: 'var(--bg-input)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                overflowX: 'auto',
                lineHeight: 1.6
              }}>
                {mindMapData.mermaidDiagram || `graph TD\n  Root["${material?.title}"]\n  Root --> Concept1["Core Principles"]\n  Root --> Concept2["Applications"]`}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
