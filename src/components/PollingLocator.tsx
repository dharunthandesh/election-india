import React from 'react';
import { motion } from 'framer-motion';

interface PollingLocatorProps {
  searchResults: any[];
  onSearch: (query: string) => void;
  onLocateMe: () => void;
  onOpenInMaps: (name: string, address: string) => void;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const PollingLocator: React.FC<PollingLocatorProps> = ({
  searchResults,
  onSearch,
  onLocateMe,
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
          <h2 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: '8px' }}>Smart Polling Locator</h2>
          <p style={{ color: 'var(--text-muted)' }}>Find your nearest polling booth, district election office, or voter registration centre in seconds.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Enter city, area or PIN code (e.g. New Delhi)..." 
              id="booth-search"
              style={{ background: '#f8fafc', color: '#0f172a', borderColor: '#e2e8f0', width: '100%' }}
              onKeyDown={(e) => e.key === 'Enter' && onSearch((document.getElementById('booth-search') as HTMLInputElement).value)}
            />
          </div>
          <button 
            className="btn"
            style={{ background: '#000080', color: 'white', padding: '0 24px', fontWeight: 600 }}
            onClick={() => {
              const query = (document.getElementById('booth-search') as HTMLInputElement).value;
              if (query) onSearch(query);
            }}
          >
            SEARCH
          </button>
          <button 
            className="btn btn-outline"
            style={{ borderColor: '#000080', color: '#000080', padding: '0 24px', fontWeight: 600 }}
            onClick={onLocateMe}
          >
            LOCATE ME
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: searchResults.length > 0 ? '1fr 1fr' : '1fr', gap: '24px' }}>
          {searchResults.length > 0 && (
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '12px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Search Results ({searchResults.length})
              </p>
              {searchResults.map((loc: any, i: number) => (
                <div key={i} className="glass-panel" style={{ background: '#f1f5f9', padding: '20px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '4px', fontWeight: 700 }}>{loc.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '12px', lineHeight: 1.4 }}>{loc.address}</p>
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ color: '#000080', borderColor: '#000080', fontWeight: 700, borderRadius: '4px' }}
                    onClick={() => onOpenInMaps(loc.name, loc.address)}
                  >
                    OPEN IN GOOGLE MAPS ↗
                  </button>
                </div>
              ))}
            </div>
          )}

          <div id="map-container" className="locator-map" style={{ border: '1px solid #e2e8f0', minHeight: '400px', borderRadius: '8px', background: '#e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
              {searchResults.length > 0 ? 'Loading Map...' : 'Enter a location or click "Locate Me" to see nearby election resources on the map.'}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
