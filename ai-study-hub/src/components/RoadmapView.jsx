import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Target, 
  BookOpen, 
  Loader2, 
  RefreshCw 
} from 'lucide-react';
import { generateRoadmap } from '../services/gemini';

export default function RoadmapView({ material, quizHistory = [] }) {
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRoadmap = async () => {
    if (!material) return;
    setLoading(true);
    setError('');
    try {
      const data = await generateRoadmap({
        materialContent: material.content,
        recentQuizScores: quizHistory.slice(-5)
      });
      setRoadmapData(data);
    } catch (err) {
      console.error('Failed to load study plan:', err);
      setError(`Could not generate Study Plan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [material?.id, quizHistory.length]);

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
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>
            Agent 6 • Personalized Study Planner
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
            AI Study Plan & Learning Roadmap
          </h2>
        </div>

        <button 
          className="btn-secondary"
          onClick={fetchRoadmap}
          disabled={loading}
          style={{ gap: '0.5rem' }}
        >
          {loading ? <Loader2 size={16} className="spinner" /> : <RefreshCw size={16} />}
          <span>Re-Plan Study Schedule</span>
        </button>
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

      {loading && !roadmapData && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', gap: '1rem' }}>
          <Loader2 size={40} className="spinner" style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Gemini Agent 6 is Building Study Plan...</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Calculating daily study blocks, revision intervals, and concept milestones.
          </p>
        </div>
      )}

      {roadmapData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Goal & Est Hours Summary Card */}
          <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  Target Mastery Goal
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {roadmapData.goal || `Master ${material?.title}`}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 700 }}>
                <Clock size={18} style={{ color: 'var(--accent-secondary)' }} />
                <span>Est. Time: {roadmapData.estimatedHours || 6} Hours</span>
              </div>
            </div>
          </div>

          {/* Daily Schedule Section */}
          {roadmapData.dailySchedule && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
                <span>Recommended Daily Study Plan</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                {roadmapData.dailySchedule.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                        {item.day}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        ⏳ {item.durationMin} mins
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {item.task}
                    </div>

                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      Focus: {item.focusTopic}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Roadmap Phases */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={18} style={{ color: 'var(--accent-emerald)' }} />
              <span>Phase-by-Phase Learning Roadmap</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {roadmapData.phases?.map((phase, idx) => (
                <div key={idx} style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  borderLeft: '4px solid var(--accent-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justify-content: 'center'
                      }}>
                        {phase.phaseNumber || idx + 1}
                      </div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                        {phase.title}
                      </h4>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {phase.objective}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                    {phase.topicsToCover?.map((top, tIdx) => (
                      <span key={tIdx} style={{
                        fontSize: '0.775rem',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '4px',
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        📌 {top}
                      </span>
                    ))}
                  </div>

                  {phase.recommendedAction && (
                    <div style={{ fontSize: '0.825rem', color: 'var(--accent-emerald)', fontWeight: 600, marginTop: '0.25rem' }}>
                      💡 Recommended Action: {phase.recommendedAction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
