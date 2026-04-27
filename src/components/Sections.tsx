import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MapPin, CalendarDays, Bot, Video } from 'lucide-react';

interface HeroProps {
  title: string;
  description: string;
  onAskAI: () => void;
  onWatchVideos: () => void;
}

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

export const Hero: React.FC<HeroProps> = ({ title, description, onAskAI, onWatchVideos }) => (
  <motion.section 
    initial="hidden"
    animate="visible"
    variants={fadeIn}
    style={{ textAlign: 'center', margin: '80px 0', position: 'relative' }}
  >
    <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,153,51,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: -1 }}></div>
    <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-1px', lineHeight: 1.1 }}>
      {title}
    </h1>
    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 40px' }}>
      {description}
    </p>
    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
      <button className="btn btn-primary" onClick={onAskAI}>
        <Bot size={20} /> Ask AI Assistant
      </button>
      <button className="btn btn-outline" onClick={onWatchVideos}>
        <Video size={20} /> Watch Video Guides
      </button>
    </div>
  </motion.section>
);

export const FeatureGrid: React.FC = () => (
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
);
