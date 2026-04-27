import React from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Camera } from 'lucide-react';

interface AICoachProps {
  messages: any[];
  chatInput: string;
  isListening: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onSendMessage: (query?: string) => void;
  onVoiceInput: () => void;
  onFileScan: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (val: string) => void;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const AICoach: React.FC<AICoachProps> = ({
  messages,
  chatInput,
  isListening,
  messagesEndRef,
  onSendMessage,
  onVoiceInput,
  onFileScan,
  onInputChange
}) => {
  return (
    <motion.section 
      id="chat"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      style={{ margin: '80px 0' }}
      aria-labelledby="chat-heading"
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 id="chat-heading" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Official Election <span className="gradient-text">Helpdesk</span> (AI Assisted)</h2>
        <p style={{ color: 'var(--text-muted)' }}>Ask questions about Indian elections, get step-by-step guidance, create calendar reminders, or find your nearest election office.</p>
      </div>

      <div className="glass-panel chat-container" style={{ maxWidth: '800px', margin: '0 auto' }} role="region" aria-label="AI Chat Interface">
        <div 
          className="chat-messages" 
          style={{ maxHeight: '400px' }} 
          role="log" 
          aria-live="polite" 
          aria-relevant="additions"
        >
          {messages.map(msg => (
            <div key={msg.id} className={`chat-bubble ${msg.type}`} role="article">
              {msg.type === 'bot' && <div style={{ color: 'var(--navy)', fontWeight: 600, fontSize: '0.8rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }} aria-hidden="true">🏛️ Official Helpdesk</div>}
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div 
          style={{ padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}
          aria-label="Quick action queries"
        >
          {[
            { label: "AM I ELIGIBLE?", query: "Am I eligible to vote?" },
            { label: "REGISTER TO VOTE", query: "How do I register to vote online?" },
            { label: "FIND MY BOOTH", query: "Where is my polling booth?" },
            { label: "ABOUT NOTA", query: "What is NOTA?" },
            { label: "LOK SABHA", query: "Tell me about Lok Sabha elections" },
            { label: "PANCHAYAT", query: "How do panchayat elections work?" }
          ].map((btn, i) => (
            <button 
              key={i} 
              className="btn btn-outline btn-sm" 
              style={{ fontSize: '0.7rem', fontWeight: 700 }}
              onClick={() => onSendMessage(btn.query)}
              aria-label={`Ask AI: ${btn.query}`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="chat-input-area" style={{ position: 'relative' }}>
          <input 
            type="text" 
            className="chat-input" 
            placeholder={isListening ? "Listening..." : "Ask about Indian elections..."} 
            value={chatInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
            disabled={isListening}
            style={{ paddingRight: '120px' }}
            aria-label="Type your election question"
            aria-disabled={isListening}
          />
          <div style={{ position: 'absolute', right: '70px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
            <button 
              className={`chat-action-btn ${isListening ? 'active' : ''}`} 
              onClick={onVoiceInput}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              style={{ background: isListening ? 'var(--saffron)' : 'transparent', color: isListening ? 'white' : 'var(--text-muted)', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
            >
              <Mic size={20} aria-hidden="true" />
            </button>
            <label 
              style={{ cursor: 'pointer', padding: '8px', color: 'var(--text-muted)' }} 
              aria-label="Scan election document image"
            >
              <Camera size={20} aria-hidden="true" />
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={onFileScan} 
                aria-label="Upload document image"
              />
            </label>
          </div>
          <button 
            className="chat-send" 
            onClick={() => onSendMessage()}
            aria-label="Send question"
          >
            <Send size={20} aria-hidden="true" />
          </button>
        </div>
        <div style={{ padding: '8px 24px', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)' }} aria-hidden="true">
          Powered by Google Gemini AI
        </div>
      </div>
    </motion.section>
  );
};
