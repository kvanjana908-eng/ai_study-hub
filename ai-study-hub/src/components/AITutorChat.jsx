import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  User, 
  Bot, 
  Zap, 
  Brain, 
  Code, 
  Loader2, 
  Globe, 
  Copy, 
  Check, 
  GraduationCap 
} from 'lucide-react';
import { askAITutor } from '../services/gemini';

export default function AITutorChat({ material }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I'm your **Agent 2 (Learning Assistant & AI Tutor)**. I have full context of **"${material?.title || 'your notebook'}"**. How can I help you master this material today?`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [persona, setPersona] = useState('socratic'); // 'socratic', 'feynman', 'exam_prep', 'math_coder'
  const [explanationLevel, setExplanationLevel] = useState('Intermediate'); // 'Beginner', 'Intermediate', 'Advanced'
  const [language, setLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading || !material) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: query.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const responseText = await askAITutor({
        materialContent: material.content,
        question: query.trim(),
        persona,
        explanationLevel,
        language,
        chatHistory: messages.slice(-8)
      });

      const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = { id: (Date.now() + 1).toString(), role: 'assistant', text: `⚠️ **AI Tutor Error:** ${err.message}` };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        text: `Chat history reset. Ready to study **"${material?.title}"**!`
      }
    ]);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*#$`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Persona options
  const personas = [
    { id: 'socratic', name: 'Socratic Tutor', icon: Brain, desc: 'Guided Q&A step-by-step' },
    { id: 'feynman', name: 'Feynman Technique', icon: Zap, desc: 'ELI5 simple analogies' },
    { id: 'exam_prep', name: 'Exam Drill Coach', icon: GraduationCap, desc: 'High-yield exam scoring points' },
    { id: 'math_coder', name: 'Math & Logic Expert', icon: Code, desc: 'Derivations & code implementation' }
  ];

  // Quick prompt suggestions
  const quickPrompts = [
    "Explain like I'm 10 years old (ELI5)",
    "Translate concepts to Malayalam",
    "Give 3 real-world practical examples",
    "Generate 5 exam & interview questions",
    "Derive the core formula step-by-step"
  ];

  return (
    <div className="tab-viewport" style={{ paddingBottom: '0' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify-content: 'space-between',
        paddingBottom: '0.85rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-secondary)', letterSpacing: '0.05em' }}>
            Agent 2 • Interactive Learning Assistant
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
            ChatGPT AI Study Companion
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={explanationLevel}
            onChange={(e) => setExplanationLevel(e.target.value)}
            style={{
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontFamily: 'inherit'
            }}
          >
            <option value="Beginner">Beginner (ELI5)</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced Deep Dive</option>
          </select>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontFamily: 'inherit'
            }}
          >
            <option value="English">🇬🇧 English</option>
            <option value="Malayalam">🇮🇳 Malayalam</option>
            <option value="Spanish">🇪🇸 Spanish</option>
            <option value="French">🇫🇷 French</option>
            <option value="German">🇩🇪 German</option>
            <option value="Hindi">🇮🇳 Hindi</option>
          </select>

          <button 
            className="btn-ghost" 
            onClick={handleClearChat}
            title="Reset conversation"
            style={{ padding: '0.45rem' }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Persona Selection Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.65rem',
        marginTop: '0.75rem'
      }}>
        {personas.map((p) => {
          const IconComp = p.icon;
          const isActive = persona === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setPersona(p.id)}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}
            >
              <IconComp size={18} style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: isActive ? 700 : 600, color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Messages Log */}
      <div style={{
        flex: 1,
        minHeight: '340px',
        maxHeight: '520px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem 0.5rem',
        marginTop: '0.5rem'
      }}>
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                gap: '0.85rem',
                justifyContent: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              {!isUser && (
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justify-content: 'center',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  <Bot size={18} />
                </div>
              )}

              <div style={{
                maxWidth: '82%',
                background: isUser ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: isUser ? '#fff' : 'var(--text-primary)',
                padding: '0.85rem 1.1rem',
                borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                border: isUser ? 'none' : '1px solid var(--border-subtle)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                position: 'relative'
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>

                {!isUser && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.65rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    <button 
                      className="btn-ghost"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      style={{ padding: '0.2rem 0.4rem', fontSize: '0.725rem' }}
                    >
                      {copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button 
                      className="btn-ghost"
                      onClick={() => handleSpeak(msg.text)}
                      style={{ padding: '0.2rem 0.4rem', fontSize: '0.725rem' }}
                    >
                      {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justify-content: 'center',
                  color: 'var(--text-primary)',
                  flexShrink: 0
                }}>
                  <User size={18} />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justify-content: 'center',
              color: '#fff'
            }}>
              <Bot size={18} />
            </div>
            <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Loader2 size={16} className="spinner" />
              <span>Gemini AI Tutor is formulating response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Strip */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        padding: '0.5rem 0'
      }}>
        {quickPrompts.map((promptText, idx) => (
          <button
            key={idx}
            className="btn-ghost"
            onClick={() => handleSend(promptText)}
            style={{
              whiteSpace: 'nowrap',
              fontSize: '0.775rem',
              padding: '0.35rem 0.65rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px'
            }}
          >
            ✨ {promptText}
          </button>
        ))}
      </div>

      {/* Input Box Bar */}
      <div style={{
        display: 'flex',
        gap: '0.65rem',
        padding: '0.75rem 0 1rem 0'
      }}>
        <input 
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask Gemini AI Tutor about "${material?.title || 'this topic'}"...`}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontFamily: 'inherit'
          }}
        />
        <button 
          className="btn-primary"
          onClick={() => handleSend()}
          disabled={isLoading || !inputQuery.trim()}
          style={{ padding: '0.75rem 1.25rem' }}
        >
          <Send size={18} />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
