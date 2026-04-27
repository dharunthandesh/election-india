import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Vote, 
  MessageSquare, 
  MapPin, 
  CalendarDays, 
  ChevronDown, 
  ChevronUp,
  Send,
  Globe,
  Bot
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function App() {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Namaste! I am your AI Civic Assistant. How can I help you with the upcoming elections?' }
  ]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Add user message
    const newUserMsg = { id: Date.now(), type: 'user', text: chatInput };
    setMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    
    // Mock bot response
    setTimeout(() => {
      let botResponse = 'I can help you find your polling booth, check your voter ID status, or explain the voting process. What would you like to know?';
      
      const lowerInput = chatInput.toLowerCase();
      if (lowerInput.includes('where') || lowerInput.includes('booth') || lowerInput.includes('location')) {
        botResponse = 'You can find your exact polling booth on the Voter Information Slip or by searching your EPIC number on the official ECI portal.';
      } else if (lowerInput.includes('register') || lowerInput.includes('apply')) {
        botResponse = 'To register as a new voter, you need to fill out Form 6 online via the NVSP website or the Voter Helpline App.';
      } else if (lowerInput.includes('document') || lowerInput.includes('id') || lowerInput.includes('carry')) {
        botResponse = 'You should carry your Voter ID (EPIC) card. If unavailable, an Aadhaar card, PAN card, or Passport are also accepted at the polling booth.';
      }

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: botResponse 
      }]);
    }, 1200);
  };

  const timelineEvents = [
    { title: 'Voter Registration', desc: 'Ensure your name is on the electoral roll. Apply via Form 6.' },
    { title: 'Candidate Nominations', desc: 'Candidates file their affidavits and declare their assets.' },
    { title: 'Polling Day', desc: 'Cast your vote at your designated polling booth. Bring valid ID.' },
    { title: 'Counting & Results', desc: 'Votes are tallied and the final results are declared by the ECI.' }
  ];

  const faqs = [
    { q: 'How do I check if my name is on the voter list?', a: 'You can verify your name on the electoral roll by visiting the official National Voters Services Portal (NVSP) and searching by your EPIC number or personal details.' },
    { q: 'What documents do I need to carry to vote?', a: 'You must carry your Voter ID (EPIC) card. If you don\'t have it, you can bring other approved IDs like an Aadhaar Card, PAN Card, or Passport.' },
    { q: 'Where is my polling booth?', a: 'Your polling booth details are available on your Voter Information Slip. You can also find it online through the Voter Helpline App or the ECI website.' },
  ];

  return (
    <div>
      <header className="app-header container">
        <div className="logo">
          <Vote className="text-saffron" size={32} color="#FF9933" />
          <span>Vote<span className="gradient-text-saffron">India</span></span>
        </div>
        <button className="btn btn-outline" style={{ padding: '8px 16px', borderRadius: '20px' }}>
          <Globe size={18} /> English
        </button>
      </header>

      <main className="container" style={{ paddingBottom: '80px' }}>
        {/* Hero Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          style={{ textAlign: 'center', margin: '80px 0', position: 'relative' }}
        >
          <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,153,51,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: -1 }}></div>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Empowering Your <br />
            <span className="gradient-text">Civic Duty</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 40px' }}>
            Your comprehensive, AI-powered guide to navigating the Indian electoral process. Stay informed, get answers, and make your voice heard.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })}>
              <Bot size={20} /> Ask AI Assistant
            </button>
            <button className="btn btn-outline" onClick={() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })}>
              View Timeline
            </button>
          </div>
        </motion.section>

        {/* Feature Grid */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="feature-grid"
        >
          <motion.div variants={fadeIn} className="glass-panel feature-card">
            <div className="feature-icon-wrapper bg-saffron-light">
              <MessageSquare size={28} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>AI Civic Coach</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Get instant, accurate answers to any election-related questions powered by advanced conversational AI.</p>
          </motion.div>
          
          <motion.div variants={fadeIn} className="glass-panel feature-card" style={{ transform: 'translateY(-20px)' }}>
            <div className="feature-icon-wrapper bg-blue-light">
              <MapPin size={28} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Smart Locator</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Easily find your designated polling booth, district election office, or voter registration center.</p>
          </motion.div>

          <motion.div variants={fadeIn} className="glass-panel feature-card">
            <div className="feature-icon-wrapper bg-green-light">
              <CalendarDays size={28} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Timely Alerts</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Sync election dates, registration deadlines, and result days directly to your calendar.</p>
          </motion.div>
        </motion.section>

        {/* AI Assistant Section */}
        <motion.section 
          id="chat"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          style={{ margin: '80px 0' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Meet Your <span className="gradient-text">Saathi</span></h2>
            <p style={{ color: 'var(--text-muted)' }}>An intelligent assistant ready to guide you through the electoral process.</p>
          </div>

          <div className="glass-panel chat-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="chat-messages">
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id} 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`chat-bubble ${msg.type}`}
                >
                  {msg.text}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-area" onSubmit={handleSendChat}>
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Ask about voter registration, polling booths..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="chat-send">
                <Send size={20} />
              </button>
            </form>
          </div>
        </motion.section>

        {/* Timeline Section */}
        <motion.section 
          id="timeline"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          style={{ margin: '100px 0' }}
        >
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px' }}>Election <span className="gradient-text">Journey</span></h2>
          <div className="timeline">
            {timelineEvents.map((event, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="timeline-item"
              >
                <div className="timeline-dot"></div>
                <div className="glass-panel timeline-content">
                  <h3>{event.title}</h3>
                  <p>{event.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          style={{ maxWidth: '800px', margin: '0 auto 80px' }}
        >
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px' }}>Frequently Asked <span className="gradient-text">Questions</span></h2>
          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <button 
                  className="faq-question" 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  {faq.q}
                  {activeFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="faq-answer">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.section>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>© 2026 VoteIndia. An independent civic initiative.</p>
      </footer>
    </div>
  );
}
