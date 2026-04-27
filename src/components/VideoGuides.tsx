import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video } from 'lucide-react';

interface VideoGuidesProps {
  videos: any[];
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const VideoGuides: React.FC<VideoGuidesProps> = ({ videos }) => {
  return (
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
  );
};
