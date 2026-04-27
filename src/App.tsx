import React, { useState, useEffect, useRef } from 'react';

// Components
import { Header } from './components/Header';
import { Hero, FeatureGrid } from './components/Sections';
import { AICoach } from './components/AICoach';
import { PollingLocator } from './components/PollingLocator';
import { ElectionReminders } from './components/ElectionReminders';
import { VideoGuides } from './components/VideoGuides';
import { FAQSection } from './components/FAQSection';

// Data & Services
import { ELECTION_FAQ } from './data/faq';
import { ElectionCoachService } from './services/gemini';
import { ElectionMapsService } from './services/maps';
import { ElectionTranslationService } from './services/translation';
import { ElectionCalendarService } from './services/calendar';
import { ElectionVoiceService } from './services/voice';
import { ElectionYoutubeService } from './services/youtube';
import { ElectionVisionService } from './services/vision';
import { ElectionSecurity } from './utils/security';

export default function App() {
  // --- State ---
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Namaste! I am your AI Civic Assistant. How can I help you with the upcoming elections?' }
  ]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [translatedContent, setTranslatedContent] = useState<any>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // --- Refs ---
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

  const faqs = ELECTION_FAQ;

  // --- Initialization ---
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
      if (sceneRef.current) sceneRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Handlers ---
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

  const handleSendChat = async (query?: string) => {
    const text = query || chatInput;
    if (!text.trim()) return;

    // Security: Rate Limit
    if (!ElectionSecurity.checkRateLimit('chat_send', 5, 60000)) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: 'You are sending messages too fast. Please wait a moment.' 
      }]);
      return;
    }

    // Security: Sanitize
    const sanitizedText = ElectionSecurity.sanitize(text);
    
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: sanitizedText }]);
    if (!query) setChatInput('');

    if (coachServiceRef.current) {
      try {
        const responseMsg = await coachServiceRef.current.chat(sanitizedText);
        const botText = responseMsg.content || responseMsg.text;
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: botText }]);
        if (voiceServiceRef.current) voiceServiceRef.current.speak(botText);
      } catch (error) {
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: 'Service unavailable. Please try again.' }]);
      }
    }
  };

  const handleVoiceInput = async () => {
    if (!voiceServiceRef.current) return;
    setIsListening(true);
    try {
      const transcript = await voiceServiceRef.current.listen();
      handleSendChat(transcript);
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
      handleSendChat(`Analyze this text: ${result}`);
    };
    reader.readAsDataURL(file);
  };

  const handleBoothSearch = async (query: string) => {
    // Security: Sanitize Query
    const cleanQuery = ElectionSecurity.cleanQuery(query);
    if (!cleanQuery) return;

    if (mapsServiceRef.current) {
      const res = await mapsServiceRef.current.searchPollingLocations(cleanQuery);
      if (res.ok) {
        setSearchResults(res.data);
        mapsServiceRef.current.initMap('map-container');
      }
    }
  };

  const handleLocateMe = async () => {
    if (!mapsServiceRef.current) return;
    const coords = await mapsServiceRef.current.getUserLocation();
    if (coords) {
      mapsServiceRef.current.initMap('map-container', coords, 15);
      const res = await mapsServiceRef.current.searchPollingLocations('polling booth');
      if (res.ok) setSearchResults(res.data);
    } else {
      alert("Location access denied. Please search manually.");
    }
  };

  const handleAddCalendar = (category: string) => {
    if (calendarServiceRef.current) {
      const event = calendarServiceRef.current.getAllReminders().find((r: any) => r.category === category);
      if (event) window.open(calendarServiceRef.current.generateCalendarLink(event), '_blank');
    }
  };

  // --- Render ---
  return (
    <div className="app-root">
      <a href="#main-content" className="skip-link">Skip to Main Content</a>
      <Header 
        currentLang={currentLang} 
        isUserLoggedIn={isUserLoggedIn}
        isTranslating={isTranslating}
        onLanguageChange={handleLanguageChange}
        onToggleLogin={() => setIsUserLoggedIn(!isUserLoggedIn)}
      />

      <main id="main-content" className="container" style={{ paddingBottom: '80px' }}>
        <div id="app" ref={sceneContainerRef} className="webgl-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -2, opacity: 0.3 }}></div>

        <Hero 
          title={translatedContent.heroTitle || "Empowering Your Civic Duty"}
          description={translatedContent.heroDesc || "Your comprehensive, AI-powered guide to navigating the Indian electoral process."}
          onAskAI={() => document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })}
          onWatchVideos={() => document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' })}
        />

        <FeatureGrid />

        <AICoach 
          messages={messages}
          chatInput={chatInput}
          isListening={isListening}
          messagesEndRef={messagesEndRef}
          onSendMessage={handleSendChat}
          onVoiceInput={handleVoiceInput}
          onFileScan={handleFileScan}
          onInputChange={setChatInput}
        />

        <PollingLocator 
          searchResults={searchResults}
          onSearch={handleBoothSearch}
          onLocateMe={handleLocateMe}
          onOpenInMaps={(name, addr) => window.open(mapsServiceRef.current.generateMapsLink(name + " " + addr), '_blank')}
        />

        <ElectionReminders onAddCalendar={handleAddCalendar} />

        <VideoGuides videos={videos} />

        <FAQSection 
          faqs={faqs}
          activeFaq={activeFaq}
          faqTitle={translatedContent.faqTitle || "Frequently Asked Questions"}
          onToggleFaq={(idx) => setActiveFaq(activeFaq === idx ? null : idx)}
        />
      </main>

      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>© 2026 VoteIndia. An independent civic initiative powered by Google Cloud.</p>
      </footer>
    </div>
  );
}
