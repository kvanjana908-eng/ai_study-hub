import React, { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Table, 
  Sigma, 
  Smile, 
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { generateMaterialSummary } from '../services/gemini';

export default function AISummarizer({ material }) {
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateSummary = async () => {
    if (!material?.content) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateMaterialSummary(material.content);
      setSummaryData(result);
    } catch (err) {
      setError(`Failed to generate summary: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopySummary = () => {
    if (!summaryData) return;
    const formatted = `TL;DR: ${summaryData.tldr}\n\nEXECUTIVE SUMMARY:\n${summaryData.executiveSummary}\n\nANALOGY:\n${summaryData.simplifiedAnalogy}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tab-viewport">
      {/* Top Banner */}
      <div className="glass-card" style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justify-content: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justify-content: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>AI Smart Summary & Key Insights</h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Dynamically generated TL;DR, core definitions, formulas, and intuitive analogies by Gemini AI.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {summaryData && (
            <>
              <button 
                className="btn-secondary" 
                onClick={handleCopySummary}
                style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}
              >
                {copied ? <Check size={16} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button 
                className="btn-secondary" 
                onClick={() => handleSpeak(summaryData.tldr + '. ' + summaryData.executiveSummary)}
                style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}
              >
                {isSpeaking ? <VolumeX size={16} style={{ color: 'var(--accent-rose)' }} /> : <Volume2 size={16} />}
                <span>{isSpeaking ? 'Stop Audio' : 'Read Summary'}</span>
              </button>
            </>
          )}

          <button
            className="btn-primary"
            onClick={handleGenerateSummary}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Gemini Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>{summaryData ? 'Regenerate Summary' : 'Generate Summary'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: 'var(--accent-rose)',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!summaryData && !isLoading && !error && (
        <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', maxWidth: '500px', margin: '2rem auto' }}>
          <Sparkles size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1rem', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Ready to Summarize Notebook</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Click the button above to have Gemini AI analyze your material and extract key formulas, definitions, and analogies.
          </p>
          <button className="btn-primary" onClick={handleGenerateSummary}>
            <Sparkles size={18} />
            <span>Generate Summary Now</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="ai-pulse-dot"></span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Gemini AI is reading and extracting core concepts...</span>
          </div>
        </div>
      )}

      {/* Summary View Content */}
      {summaryData && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* TL;DR Banner */}
          <div className="glass-card" style={{
            background: 'var(--bg-tertiary)',
            borderLeft: '4px solid var(--accent-secondary)',
            padding: '1.25rem'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-secondary)', marginBottom: '0.35rem' }}>
              ⚡ 1-Sentence TL;DR
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-primary)' }}>
              {summaryData.tldr}
            </p>
          </div>

          {/* Simplified ELI5 Analogy */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-amber)', marginBottom: '0.5rem' }}>
              <Smile size={18} />
              <span>ELI5 (Explain Like I'm 5) Analogy</span>
            </div>
            <p style={{ fontSize: '0.925rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
              {summaryData.simplifiedAnalogy}
            </p>
          </div>

          {/* Executive Summary */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
              <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Executive Summary</span>
            </div>
            <p style={{ fontSize: '0.925rem', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
              {summaryData.executiveSummary}
            </p>
          </div>

          {/* Key Concepts Table */}
          {summaryData.keyConcepts?.length > 0 && (
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
                <Table size={18} style={{ color: 'var(--accent-emerald)' }} />
                <span>Key Vocabulary & Core Concepts</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-medium)', textTransform: 'uppercase', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', width: '25%' }}>Term / Concept</th>
                      <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', width: '50%' }}>Definition</th>
                      <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', width: '25%' }}>Significance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.keyConcepts.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.75rem 0.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{item.term}</td>
                        <td style={{ padding: '0.75rem 0.8rem', color: 'var(--text-primary)' }}>{item.definition}</td>
                        <td style={{ padding: '0.75rem 0.8rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>{item.importance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Formulas and Rules */}
          {summaryData.formulasAndRules?.length > 0 && (
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
                <Sigma size={18} style={{ color: 'var(--accent-rose)' }} />
                <span>Formulas & Core Principles</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {summaryData.formulasAndRules.map((rule, idx) => (
                  <div key={idx} style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                      {rule.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      background: 'var(--bg-primary)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      color: '#a5b4fc',
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem'
                    }}>
                      {rule.expression}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      {rule.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
