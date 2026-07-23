import React, { useState } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  Award, 
  Clock, 
  BarChart2, 
  Loader2, 
  Check, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { generateQuiz, evaluateQuizAnswers } from '../services/gemini';
import confetti from 'canvas-confetti';

export default function AIQuizEngine({ material, onQuizCompleted }) {
  // Configuration State
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [selectedTypes, setSelectedTypes] = useState(['multiple_choice', 'short_answer', 'true_false', 'fill_in_blank']);

  // Quiz State
  const [quizData, setQuizData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Evaluation State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Quiz Generation
  const handleGenerateQuiz = async () => {
    if (!material) return;
    setErrorMsg('');
    setIsGenerating(true);
    setQuizData(null);
    setEvaluationResult(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const quiz = await generateQuiz({
        materialContent: material.content,
        numQuestions,
        difficulty,
        types: selectedTypes
      });
      setQuizData(quiz);
    } catch (err) {
      console.error('Quiz Generation Error:', err);
      setErrorMsg(`Failed to generate AI Quiz: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = (qId, answerValue) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: answerValue
    }));
  };

  const toggleType = (typeId) => {
    if (selectedTypes.includes(typeId)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(prev => prev.filter(t => t !== typeId));
      }
    } else {
      setSelectedTypes(prev => [...prev, typeId]);
    }
  };

  // Submit Quiz for AI Evaluation
  const handleSubmitQuiz = async () => {
    if (!quizData || isEvaluating) return;
    setErrorMsg('');
    setIsEvaluating(true);

    try {
      const evaluation = await evaluateQuizAnswers({
        materialContent: material.content,
        quizQuestions: quizData.questions,
        userAnswers
      });
      setEvaluationResult(evaluation);

      // Trigger Confetti if score >= 70%
      if (evaluation.overallScore >= 70) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }

      // Notify parent to log quiz history and update Study Plan
      if (onQuizCompleted) {
        onQuizCompleted({
          id: `quiz-${Date.now()}`,
          title: quizData.quizTitle || `${material.title} Quiz`,
          date: new Date().toLocaleDateString(),
          overallScore: evaluation.overallScore,
          masteryLevel: evaluation.masteryLevel,
          examReadinessScore: evaluation.examReadinessScore,
          difficulty,
          numQuestions: quizData.questions.length
        });
      }
    } catch (err) {
      console.error('Quiz Evaluation Error:', err);
      setErrorMsg(`Evaluation failed: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
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
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-amber)', letterSpacing: '0.05em' }}>
            Agent 4 & Agent 5 • Assessment & Evaluation
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Dynamic Gemini Quiz Engine
          </h2>
        </div>

        {quizData && (
          <button 
            className="btn-secondary" 
            onClick={handleGenerateQuiz}
            disabled={isGenerating || isEvaluating}
            style={{ gap: '0.4rem' }}
          >
            <RotateCcw size={16} />
            <span>Generate New Quiz</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: 'var(--accent-rose)',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem'
        }}>
          {errorMsg}
        </div>
      )}

      {/* State 1: Configuration & Generation Form */}
      {!quizData && !isGenerating && (
        <div className="glass-card" style={{ maxWidth: '640px', margin: '1rem auto', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-amber)' }} />
            <span>Configure AI Assessment</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Gemini AI will analyze <strong>"{material?.title}"</strong> and generate custom conceptual, fill-in-blanks, numerical, or short-answer questions.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Number of Questions Selector */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Number of Questions
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[5, 10, 20, 50].map((num) => (
                  <button
                    key={num}
                    className={`btn-ghost ${numQuestions === num ? 'active' : ''}`}
                    onClick={() => setNumQuestions(num)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: numQuestions === num ? 'var(--accent-primary)' : 'var(--bg-input)',
                      color: numQuestions === num ? '#fff' : 'var(--text-primary)',
                      border: '1px solid var(--border-medium)',
                      fontWeight: 700
                    }}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level Selector */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Difficulty Level
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['Easy', 'Intermediate', 'Hard', 'Mixed'].map((diff) => (
                  <button
                    key={diff}
                    className={`btn-ghost ${difficulty === diff ? 'active' : ''}`}
                    onClick={() => setDifficulty(diff)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: difficulty === diff ? 'var(--accent-amber)' : 'var(--bg-input)',
                      color: difficulty === diff ? '#000' : 'var(--text-primary)',
                      border: '1px solid var(--border-medium)',
                      fontWeight: 700
                    }}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Question Formats
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { id: 'multiple_choice', label: 'Multiple Choice (MCQ)' },
                  { id: 'true_false', label: 'True / False' },
                  { id: 'fill_in_blank', label: 'Fill in the Blanks' },
                  { id: 'short_answer', label: 'Short & Long Answer' },
                  { id: 'numerical', label: 'Scenario / Numerical' }
                ].map((typeObj) => {
                  const isChecked = selectedTypes.includes(typeObj.id);
                  return (
                    <div
                      key={typeObj.id}
                      onClick={() => toggleType(typeObj.id)}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: isChecked ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-input)',
                        border: isChecked ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        fontSize: '0.825rem',
                        fontWeight: isChecked ? 700 : 500,
                        display: 'flex',
                        alignItems: 'center',
                        justify-content: 'space-between'
                      }}
                    >
                      <span>{typeObj.label}</span>
                      {isChecked && <Check size={14} style={{ color: 'var(--accent-primary)' }} />}
                    </div>
                  );
                })}
              </div>
            </div>

            <button 
              className="btn-primary"
              onClick={handleGenerateQuiz}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.85rem' }}
            >
              <Sparkles size={18} />
              <span>Generate Dynamic AI Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* Loader */}
      {isGenerating && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', gap: '1rem' }}>
          <Loader2 size={40} className="spinner" style={{ color: 'var(--accent-amber)' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Gemini Agent 4 is Drafting Quiz...</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Creating {numQuestions} {difficulty} questions tailored strictly to your notebook material.
          </p>
        </div>
      )}

      {/* State 2: Taking Quiz */}
      {quizData && !evaluationResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quiz Header Info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Question {currentQuestionIndex + 1} of {quizData.questions.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontWeight: 700, textTransform: 'uppercase' }}>
              {difficulty} Level
            </div>
          </div>

          {/* Question Card */}
          {(() => {
            const currentQ = quizData.questions[currentQuestionIndex];
            const userAns = userAnswers[currentQ.id] || '';

            return (
              <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  Tag: {currentQ.conceptTag || 'Core Concept'} • Type: {currentQ.type.replace('_', ' ')}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.5 }}>
                  {currentQ.question}
                </h3>

                {/* Question Type Inputs */}
                {(currentQ.type === 'multiple_choice' || currentQ.type === 'true_false') && currentQ.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = userAns === opt;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleOptionSelect(currentQ.id, opt)}
                          style={{
                            padding: '0.85rem 1.1rem',
                            borderRadius: 'var(--radius-md)',
                            background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-input)',
                            border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: isSelected ? 700 : 500,
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}
                        >
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: isSelected ? '6px solid var(--accent-primary)' : '2px solid var(--border-medium)',
                            background: isSelected ? '#fff' : 'transparent'
                          }} />
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {(currentQ.type === 'short_answer' || currentQ.type === 'long_answer' || currentQ.type === 'fill_in_blank' || currentQ.type === 'numerical' || currentQ.type === 'scenario') && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Your Answer:
                    </label>
                    <textarea
                      rows={currentQ.type === 'long_answer' ? 5 : 3}
                      value={userAns}
                      onChange={(e) => handleOptionSelect(currentQ.id, e.target.value)}
                      placeholder="Type your response here. Gemini AI will evaluate your conceptual accuracy..."
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })()}

          {/* Question Navigation Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <button
              className="btn-secondary"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>

            {currentQuestionIndex < quizData.questions.length - 1 ? (
              <button
                className="btn-primary"
                onClick={() => setCurrentQuestionIndex(prev => Math.min(quizData.questions.length - 1, prev + 1))}
              >
                <span>Next Question</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={handleSubmitQuiz}
                disabled={isEvaluating}
                style={{ background: 'var(--accent-emerald)' }}
              >
                {isEvaluating ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    <span>Gemini Agent 5 is Grading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Submit & Evaluate Quiz</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* State 3: Quiz Evaluation Results */}
      {evaluationResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Overall Score Card */}
          <div className="glass-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary)' }}>
                  Agent 5 Evaluation Complete
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  Score: {evaluationResult.overallScore}%
                </h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Mastery Level: <strong>{evaluationResult.masteryLevel}</strong> • Exam Readiness: <strong>{evaluationResult.examReadinessScore}%</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button className="btn-primary" onClick={handleGenerateQuiz} style={{ padding: '0.65rem 1.1rem' }}>
                  <RotateCcw size={16} />
                  <span>Take Another Quiz</span>
                </button>
              </div>
            </div>
          </div>

          {/* Question Breakdown Feedback List */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Detailed Question Feedback & Misconception Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {evaluationResult.questionFeedback?.map((fb, idx) => {
                const origQ = quizData.questions.find(q => q.id === fb.questionId) || quizData.questions[idx];

                return (
                  <div key={idx} style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-tertiary)',
                    borderLeft: fb.isCorrect ? '4px solid var(--accent-emerald)' : '4px solid var(--accent-rose)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        Question {idx + 1}
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: fb.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: fb.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                      }}>
                        {fb.isCorrect ? 'Correct ✓' : 'Needs Review ✗'}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                      {origQ?.question}
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      <strong>Your Submission:</strong> {fb.userAnswer || '(Empty)'}
                    </div>

                    {!fb.isCorrect && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
                        <strong>Correct Concept Answer:</strong> {fb.correctAnswer}
                      </div>
                    )}

                    <div style={{ fontSize: '0.85rem', lineHeight: 1.5, background: 'var(--bg-input)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                      💡 <strong>Gemini Feedback:</strong> {fb.detailedFeedback}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
