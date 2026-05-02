import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Copy, Check, Trash2, Loader2 } from 'lucide-react';
import { useAI } from '../hooks/useAI';

interface AskAIModalProps {
  onClose: () => void;
}

const TEMPLATE = `# persona\n\n\n# task\n\n\n# context\n\n\n# format\n\n`;

export const AskAIModal: React.FC<AskAIModalProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState(TEMPLATE);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { fetchRawAIResponse } = useAI();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const result = await fetchRawAIResponse(prompt);
      setResponse(result);
    } catch (error) {
      console.error('AI Error:', error);
      setResponse(`[SYSTEM ERROR]: ${error instanceof Error ? error.message : 'Unknown failure'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setPrompt('');
    textareaRef.current?.focus();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="modal-content glass-panel glow-border ask-ai-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div className="title-group">
            <Sparkles size={18} className="title-icon" />
            <h2 className="modal-title h-glow">Ask AI</h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </header>

        <div className="modal-body">
          <div className="input-section">
            <textarea
              ref={textareaRef}
              className="ai-textarea prompt-area"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              spellCheck={false}
            />
            <div className="textarea-footer">
              <button className="minimal-icon-btn" onClick={handleClear} title="Clear Prompt">
                <Trash2 size={18} />
              </button>
              <button 
                className="minimal-icon-btn highlight" 
                onClick={handleGenerate} 
                disabled={isLoading || !prompt.trim()}
                title="Generate"
              >
                {isLoading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>

          {response && (
            <div className="response-section" style={{ marginTop: '1.5rem' }}>
              <textarea
                className="ai-textarea response-area"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="AI response will appear here..."
                spellCheck={false}
              />
              <div className="textarea-footer" style={{ justifyContent: 'flex-end' }}>
                <button className="minimal-icon-btn" onClick={handleCopy} title="Copy to Clipboard">
                  {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .ask-ai-modal {
          max-width: 600px;
          width: 90%;
          background: rgba(2, 6, 23, 0.9);
          padding: 1.5rem;
          /* Advanced Containment to prevent background flashing */
          contain: content;
          isolation: isolate;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .title-icon {
          color: var(--accent);
        }
        .modal-title {
          font-family: var(--font-family);
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--accent);
          margin: 0;
        }
        .h-glow {
          text-shadow: 0 0 15px var(--accent);
        }
        .close-btn {
          color: var(--text-secondary);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .close-btn:hover {
          color: var(--urgent);
          transform: rotate(90deg);
        }
        .ai-textarea {
          width: 100%;
          background: rgba(2, 6, 23, 0.5);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 1rem;
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: 0.9rem;
          line-height: 1.5;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
          /* Performance Fixes: Prevent repaint flashes during scroll */
          overscroll-behavior: contain;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        .ai-textarea:focus {
          border-color: var(--accent);
        }
        .prompt-area {
          min-height: 150px;
        }
        .response-area {
          min-height: 200px;
          background: rgba(14, 165, 233, 0.05);
        }
        .textarea-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }
        .minimal-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 8px;
          border-radius: 4px;
          color: var(--text-secondary);
          transition: all 0.2s;
          cursor: pointer;
        }
        .minimal-icon-btn:hover:not(:disabled) {
          color: var(--text-primary);
          background: rgba(14, 165, 233, 0.1);
        }
        .minimal-icon-btn.highlight {
          color: var(--accent);
        }
        .minimal-icon-btn.highlight:hover:not(:disabled) {
          background: rgba(14, 165, 233, 0.15);
          box-shadow: 0 0 15px rgba(14, 165, 233, 0.2);
        }
        .minimal-icon-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
