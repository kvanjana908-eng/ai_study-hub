import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Flame, 
  Clock, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  RefreshCw, 
  Target, 
  BookOpen, 
  Loader2 
} from 'lucide-react';
import { generateAnalyticsInsights } from '../services/gemini';

export default function AnalyticsDashboard({ materials = [], quizHistory = [] }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await generateAnalyticsInsights({ materials, quizHistory });
      setInsights(data);
    } catch (err) {
      console.error('Failed to load learning analytics:', err);
      setError('Could not generate AI Analytics. Please ensure your Gemini key is configured in settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [materials.length, quizHistory.length]);

  // Compute stats fallback from quizHistory
  const avgQuizScore = quizHistory.length > 0 
    ? Math.round(quizHistory.reduce((acc, q) => acc + (q.overallScore || 0), 0) / quizHistory.length) 
    : 85;

  return (
    <div className="tab-viewport" style={{ gap: '1.5rem' }}>
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
            Agent 5 • Diagnostic Intelligence
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Learning Analytics & Mastery Diagnostic
          </h1>
        </div>

        <button 
          className="btn-secondary"
          onClick={fetchInsights}
          disabled={loading}
          style={{ gap: '0.5rem' }}
        >
          {loading ? <Loader2 size={16} className="spinner" /> : <RefreshCw size={16} />}
          <span>Re-Analyze Progress</span>
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

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justify-content: 'center'
          }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mastery Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {insights?.totalMasteryScore ?? avgQuizScore}%
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: 'var(--accent-amber)',
            display: 'flex',
            alignItems: 'center',
            justify-content: 'center'
          }}>
            <Flame size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Study Streak</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {insights?.studyStreakDays ?? 5} Days 🔥
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--accent-secondary)',
            display: 'flex',
            alignItems: 'center',
            justify-content: 'center'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Study Time</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {insights?.estimatedStudyHours ?? 14.5} hrs
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            justify-content: 'center'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quizzes Evaluated</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {quizHistory.length} completed
            </div>
          </div>
        </div>
      </div>

      {/* Main Diagnostic Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Strong vs Weak Concepts */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} style={{ color: 'var(--accent-emerald)' }} />
            <span>Concept Mastery Breakdown</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                💪 Strong Concepts
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(insights?.strongTopics || ['Core Principles', 'Definitions', 'Applications']).map((t, idx) => (
                  <span key={idx} style={{
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--accent-emerald)',
                    fontWeight: 600
                  }}>
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                ⚠️ Target Improvement Areas
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(insights?.weakTopics || ['Complex Equations', 'Edge Cases', 'Numerical Problems']).map((t, idx) => (
                  <span key={idx} style={{
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(244, 63, 94, 0.15)',
                    color: 'var(--accent-rose)',
                    fontWeight: 600
                  }}>
                    • {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '0.5rem',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            lineHeight: 1.5
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Knowledge Gap Diagnostic: </strong>
            <span style={{ color: 'var(--text-secondary)' }}>
              {insights?.knowledgeGapAnalysis || 'High comprehension in conceptual theory with opportunities for higher accuracy on numerical problem-solving.'}
            </span>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>AI Actionable Recommendations</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(insights?.aiActionableRecommendations || [
              'Review formula derivations using the Feynman Tutor persona in AI Tutor.',
              'Attempt a 10-question Hard difficulty quiz focusing on numerical problems.',
              'Review flashcards in 3D flip view to reinforce active recall.'
            ]).map((rec, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: 'var(--text-primary)'
              }}>
                <Target size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '0.15rem' }} />
                <span>{rec}</span>
              </div>
            ))}
          </div>

          {insights?.nextMilestoneGoal && (
            <div style={{
              marginTop: 'auto',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                🎯 Target Goal
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--text-primary)' }}>
                {insights.nextMilestoneGoal}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quiz History Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
          Recent Quiz Submissions & Performance Log
        </h3>

        {quizHistory.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No quiz attempts logged yet. Complete a quiz in the Dynamic Quiz tab to record real-time evaluation data!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Quiz Title</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Score</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Mastery Level</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Readiness</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {quizHistory.map((q, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600 }}>{q.title || 'Dynamic Quiz'}</td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: 700,
                        background: q.overallScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: q.overallScore >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                      }}>
                        {q.overallScore}%
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>{q.masteryLevel || 'Proficient'}</td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>{q.examReadinessScore ?? 88}%</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)' }}>{q.date || 'Just now'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
