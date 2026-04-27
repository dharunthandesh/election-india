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
  Bot,
  Mic,
  Video,
  Camera,
  User,
  Globe
} from 'lucide-react';

import { getAllTimelineEvents } from './data/timeline';
import { ELECTION_FAQ } from './data/faq';
import { ElectionCoachService } from './services/gemini';
import { ElectionMapsService } from './services/maps';
import { ElectionTranslationService } from './services/translation';
import { ElectionCalendarService } from './services/calendar';
import { ElectionVoiceService } from './services/voice';
import { ElectionYoutubeService } from './services/youtube';
import { ElectionVisionService } from './services/vision';

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
  const [isListening, setIsListening] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const coachServiceRef = useRef<any>(null);
  const mapsServiceRef = useRef<any>(null);
  const translationServiceRef = useRef<any>(null);
  const calendarServiceRef = useRef<any>(null);
  const voiceServiceRef = useRef<any>(null);
  const youtubeServiceRef = useRef<any>(null);
  const visionServiceRef = useRef<any>(null);
  const sceneContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);

  const [currentLang, setCurrentLang] = useState('en');
  const [translatedContent, setTranslatedContent] = useState<any>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const timelineEvents = getAllTimelineEvents();
  const faqs = ELECTION_FAQ;

  useEffect(() => {
    coachServiceRef.current = new ElectionCoachService();
    mapsServiceRef.current = new ElectionMapsService();
    mapsServiceRef.current.loadMapsApi();
    translationServiceRef.current = new ElectionTranslationService();
    calendarServiceRef.current = new ElectionCalendarService();
    voiceServiceRef.current = new ElectionVoiceService();
    youtubeServiceRef.current = new ElectionYoutubeService();
    visionServiceRef.current = new ElectionVisionService();

    youtubeServiceRef.current.fetchVoterEducationVideos().then(setVideos);

    import('./scene/ElectionScene').then(module => {
      if (sceneContainerRef.current) {
        sceneRef.current = new module.ElectionScene(sceneContainerRef.current);
      }
    });

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
      }
    };
  }, []);

  const handleLanguageChange = async (lang: string) => {
    if (lang === 'en') {
      setCurrentLang('en');
      setTranslatedContent({});
      return;
    }

    if (!translationServiceRef.current?.isConfigured()) {
      alert("Translation API key not configured. Using original text.");
      setCurrentLang('en');
      return;
    }

    setIsTranslating(true);
    setCurrentLang(lang);

    const textsToTranslate = [
      "Empowering Your Civic Duty",
      "Your comprehensive, AI-powered guide to navigating the Indian electoral process. Stay informed, get answers, and make your voice heard.",
      "Meet Your Saathi",
      "An intelligent assistant ready to guide you through the electoral process.",
      "Election Journey",
      "Frequently Asked Questions"
    ];

    try {
      const results = await translationServiceRef.current.translateBatch(textsToTranslate, lang);
      setTranslatedContent({
        heroTitle: results[0],
        heroDesc: results[1],
        chatTitle: results[2],
        chatDesc: results[3],
        timelineTitle: results[4],
        faqTitle: results[5]
      });
    } catch (error) {
      console.error("Translation error", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (query?: string) => {
    const text = query || chatInput;
    if (!text.trim()) return;
    
    // Add user message
    const newUserMsg = { id: Date.now(), type: 'user', text: text };
    setMessages(prev => [...prev, newUserMsg]);
    if (!query) setChatInput('');

    // AI Response logic
    if (coachServiceRef.current) {
      try {
        const responseMsg = await coachServiceRef.current.chat(text);
        const botText = responseMsg.content || responseMsg.text;
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          type: 'bot', 
          text: botText
        }]);

        // Text to Speech
        if (voiceServiceRef.current) {
          voiceServiceRef.current.speak(botText);
        }
      } catch (error) {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          type: 'bot', 
          text: 'Sorry, I am having trouble connecting to the service right now. Please try again later.' 
        }]);
      }
    } else {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: "I'm still initializing my knowledge base. Please try again in a few seconds." 
      }]);
    }
  };

  const handleVoiceInput = async () => {
    if (!voiceServiceRef.current) return;
    setIsListening(true);
    try {
      const transcript = await voiceServiceRef.current.listen();
      handleSend(transcript);
    } catch (e) {
      console.error('Voice input failed', e);
    } finally {
      setIsListening(false);
    }
  };

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !visionServiceRef.current) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: 'Scanning document...' }]);
      const result = await visionServiceRef.current.analyzeDocument(base64);
      handleSend(`Analyze this text from an election document: ${result}`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <header className="app-header container">
        <div className="logo">
          <Vote className="text-saffron" size={32} color="#FF9933" />
          <span>Vote<span className="gradient-text-saffron">India</span></span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {isTranslating && <div className="loader-small"></div>}
          <button 
            className="btn btn-outline" 
            style={{ padding: '8px 16px', borderRadius: '20px', background: 'transparent', color: 'white', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => setIsUserLoggedIn(!isUserLoggedIn)}
          >
            {isUserLoggedIn ? (
              <>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>JD</div>
                John Doe
              </>
            ) : (
              <>
                <User size={16} /> Sign in
              </>
            )}
          </button>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Globe size={18} color="rgba(255,255,255,0.6)" />
            <select 
              className="btn btn-outline" 
              style={{ padding: '8px 16px', borderRadius: '20px', background: 'transparent', color: 'white', border: '1px solid var(--border-glass)' }}
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="en" style={{ background: '#1a1a2e' }}>English</option>
              <option value="hi" style={{ background: '#1a1a2e' }}>हिन्दी (Hindi)</option>
              <option value="te" style={{ background: '#1a1a2e' }}>తెలుగు (Telugu)</option>
              <option value="ta" style={{ background: '#1a1a2e' }}>தமிழ் (Tamil)</option>
              <option value="bn" style={{ background: '#1a1a2e' }}>বাংলা (Bengali)</option>
              <option value="mr" style={{ background: '#1a1a2e' }}>మరాठी (Marathi)</option>
            </select>
          </div>
        </div>
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
            {translatedContent.heroTitle || "Empowering Your"} <br />
            <span className="gradient-text">Civic Duty</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 40px' }}>
            {translatedContent.heroDesc || "Your comprehensive, AI-powered guide to navigating the Indian electoral process. Stay informed, get answers, and make your voice heard."}
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
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Official Election <span className="gradient-text">Helpdesk</span> (AI Assisted)</h2>
            <p style={{ color: 'var(--text-muted)' }}>Ask questions about Indian elections, get step-by-step guidance, create calendar reminders, or find your nearest election office.</p>
          </div>

          <div className="glass-panel chat-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="chat-messages" style={{ maxHeight: '400px' }}>
              {messages.map(msg => (
                <div key={msg.id} className={`chat-bubble ${msg.type}`}>
                  {msg.type === 'bot' && <div style={{ color: 'var(--navy)', fontWeight: 600, fontSize: '0.8rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>🏛️ Official Helpdesk</div>}
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
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
                  onClick={() => handleSend(btn.query)}
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
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isListening}
                style={{ paddingRight: '120px' }}
              />
              <div style={{ position: 'absolute', right: '70px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
                <button 
                  className={`chat-action-btn ${isListening ? 'active' : ''}`} 
                  onClick={handleVoiceInput}
                  title="Voice Search"
                  style={{ background: isListening ? 'var(--saffron)' : 'transparent', color: isListening ? 'white' : 'var(--text-muted)', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
                >
                  <Mic size={20} />
                </button>
                <label style={{ cursor: 'pointer', padding: '8px', color: 'var(--text-muted)' }} title="Scan Document">
                  <Camera size={20} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileScan} />
                </label>
              </div>
              <button className="chat-send" onClick={() => handleSend()}>
                <Send size={20} />
              </button>
            </div>
            <div style={{ padding: '8px 24px', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)' }}>
              Powered by Google Gemini AI
            </div>
          </div>
        </motion.section>

        {/* 3D Election Journey Visualization Section */}
        <motion.section 
          id="3d-scene"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          style={{ margin: '80px 0' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Explore the <span className="gradient-text">Journey</span></h2>
            <p style={{ color: 'var(--text-muted)' }}>Interactive 3D visualization of the election process.</p>
          </div>
          <div 
            ref={sceneContainerRef} 
            className="glass-panel" 
            style={{ width: '100%', height: '600px', overflow: 'hidden', padding: 0, position: 'relative' }}
          >
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
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px' }}>{translatedContent.timelineTitle || "Election"} <span className="gradient-text">Journey</span></h2>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0 }}>{event.title}</h3>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        if (calendarServiceRef.current) {
                          const link = calendarServiceRef.current.generateCalendarLink({
                            title: event.title,
                            description: event.description,
                            startDate: '2026-05-15', // Sample date
                            isDeadline: false,
                            category: 'general'
                          });
                          window.open(link, '_blank');
                        }
                      }}
                    >
                      <CalendarDays size={14} /> Remind Me
                    </button>
                  </div>
                  <p>{event.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Polling Locator Section */}
        <motion.section 
          id="locator"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          style={{ margin: '80px 0' }}
        >
          <div className="glass-panel" style={{ padding: '40px' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: '8px' }}>Find Your Nearest Election Office</h2>
              <p style={{ color: 'var(--text-muted)' }}>Search for your nearest polling booth, district election office, or voter registration centre.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input 
                type="text" 
                className="chat-input" 
                placeholder="Enter city or PIN code (e.g. Chennai)..." 
                id="booth-search"
                style={{ background: '#f8fafc', color: '#0f172a', borderColor: '#e2e8f0' }}
              />
              <button 
                className="btn"
                style={{ background: '#000080', color: 'white' }}
                onClick={async () => {
                  const query = (document.getElementById('booth-search') as HTMLInputElement).value;
                  if (query && mapsServiceRef.current) {
                    const res = await mapsServiceRef.current.searchPollingLocations(query);
                    if (res.ok) {
                      setSearchResults(res.data);
                      mapsServiceRef.current.initMap('map-container');
                    }
                  }
                }}
              >
                SEARCH
              </button>
            </div>

            {searchResults.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Found {searchResults.length} result(s) for "{(document.getElementById('booth-search') as HTMLInputElement).value}"</p>
                {searchResults.map((loc: any, i: number) => (
                  <div key={i} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '4px' }}>{loc.name}</h3>
                    <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '12px' }}>{loc.address}</p>
                    <button 
                      className="btn btn-outline btn-sm" 
                      style={{ color: '#000080', borderColor: '#000080' }}
                      onClick={() => window.open(mapsServiceRef.current.generateMapsLink(loc.name + " " + loc.address), '_blank')}
                    >
                      OPEN IN GOOGLE MAPS ↗
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div id="map-container" className="locator-map" style={{ border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Search to initialize map
              </div>
            </div>
          </div>
        </motion.section>

        {/* Election Reminders Section */}
        <motion.section 
          id="reminders"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          style={{ margin: '80px 0' }}
        >
          <div className="glass-panel" style={{ padding: '40px' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '2rem', color: '#000080', display: 'flex', alignItems: 'center', gap: '12px' }}>
                📅 Election Reminders — Add to Google Calendar
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>Never miss a key election date. Click any reminder to add it directly to your Google Calendar.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { title: "Voter Registration Deadline — Check Eligibility", date: "Wednesday, 31 December 2025", category: 'registration' },
                { title: "Polling Day — Cast Your Vote", date: "Sunday, 15 February 2026", category: 'polling' },
                { title: "Vote Counting Day — Track Results", date: "Thursday, 19 February 2026", category: 'counting' },
                { title: "Model Code of Conduct Enforcement Begins", date: "Thursday, 15 January 2026", category: 'deadline' }
              ].map((reminder, i) => (
                <div key={i} className="reminder-card" style={{ borderLeft: `4px solid ${i === 0 ? '#f97d09' : i === 1 ? '#000080' : i === 2 ? '#046a38' : '#f97d09'}`, background: '#f1f5f9', padding: '24px', borderRadius: '4px' }}>
                  <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {i === 0 && '📝'} {i === 1 && '🗳️'} {i === 2 && '📊'} {i === 3 && '⚠️'} {reminder.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>{reminder.date}</p>
                  <button 
                    className="btn btn-outline" 
                    style={{ color: '#000080', borderColor: '#000080', padding: '8px 20px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}
                    onClick={() => {
                      if (calendarServiceRef.current) {
                        const event = calendarServiceRef.current.getAllReminders().find((r: any) => r.category === reminder.category);
                        if (event) {
                          window.open(calendarServiceRef.current.generateCalendarLink(event), '_blank');
                        }
                      }
                    }}
                  >
                    + ADD TO GOOGLE CALENDAR ↗
                  </button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Powered by Google Calendar. Dates are indicative — verify with eci.gov.in for confirmed schedules.
            </div>
          </div>
        </motion.section>

        {/* YouTube Video Guides Section */}
        <motion.section 
          id="videos"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          style={{ margin: '80px 0' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}><span className="gradient-text">Video</span> Guides</h2>
            <p style={{ color: 'var(--text-muted)' }}>Watch official voter education and guidance videos from the Election Commission of India.</p>
          </div>

          <div className="video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            <AnimatePresence>
              {videos.map((video, i) => (
                <motion.div 
                  key={video.id + i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10 }}
                  className="glass-panel"
                  style={{ overflow: 'hidden', padding: 0 }}
                >
                  <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Video size={24} color="white" />
                      </div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', lineHeight: 1.4 }}>{video.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Official ECI Guidance • {new Date(video.publishedAt).toLocaleDateString()}</p>
                    </div>
                  </a>
                </motion.div>
              ))}
            </AnimatePresence>
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
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px' }}>{translatedContent.faqTitle || "Frequently Asked Questions"}</h2>
          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <button 
                  className="faq-question" 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  {faq.question}
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
                        {faq.answer}
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
