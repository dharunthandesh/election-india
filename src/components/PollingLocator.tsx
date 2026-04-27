import React from 'react';
import { motion } from 'framer-motion';

interface PollingLocatorProps {
  searchResults: any[];
  onSearch: (query: string) => void;
  onOpenInMaps: (name: string, address: string) => void;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const PollingLocator: React.FC<PollingLocatorProps> = ({
  searchResults,
  onSearch,
  onOpenInMaps
}) => {
  return (
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
            onClick={() => {
              const query = (document.getElementById('booth-search') as HTMLInputElement).value;
              if (query) onSearch(query);
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
                  onClick={() => onOpenInMaps(loc.name, loc.address)}
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
  );
};
