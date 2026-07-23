import React, { useState } from 'react';
import { X, Key, Cpu, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, getStoredModel, setStoredModel } from '../services/gemini';

export default function SettingsModal({ onClose, onUpdate }) {
  const [apiKey, setApiKey] = useState(getStoredApiKey() || '');
  const [selectedModel, setSelectedModel] = useState(getStoredModel() || 'gemini-2.0-flash');
  const [testStatus, setTestStatus] = useState(null); // { type: 'success' | 'error', msg: string }
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = () => {
    setStoredApiKey(apiKey);
    setStoredModel(selectedModel);
    onUpdate();
    onClose();
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus({ type: 'error', msg: 'Please enter an API key to test.' });
      return;
    }

    setIsTesting(true);
    setTestStatus(null);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello Gemini! Respond with "OK".' }] }]
        })
      });

      if (response.ok) {
        setTestStatus({ type: 'success', msg: 'Connection successful! Gemini API is active.' });
      } else {
        const errText = await response.text();
        setTestStatus({ type: 'error', msg: `Connection failed (${response.status}): ${errText.substring(0, 100)}` });
      }
    } catch (e) {
      setTestStatus({ type: 'error', msg: `Network error: ${e.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Key size={22} style={{ color: 'var(--accent-primary)' }} />
            <span>Gemini API Settings</span>
          </h2>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Google Gemini API Key
            </label>
            <input 
              type="password"
              placeholder="AQ.Ab8RN6LQuCZBBJcXySzw..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 0.9rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-mono)'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
              Pre-populated with your configured key. Your key is stored securely in local browser storage.
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Gemini AI Model Engine
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'inherit'
              }}
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended - Ultra Fast)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Reliable)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
            </select>
          </div>

          {testStatus && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              background: testStatus.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${testStatus.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              color: testStatus.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)'
            }}>
              {testStatus.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span>{testStatus.msg}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              className="btn-secondary"
              onClick={handleTestConnection}
              disabled={isTesting}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <RefreshCw size={16} className={isTesting ? 'spinner' : ''} />
              <span>Test Connection</span>
            </button>

            <button
              className="btn-primary"
              onClick={handleSave}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Check size={16} />
              <span>Save & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
