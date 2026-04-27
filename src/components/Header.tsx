import React from 'react';
import { Vote, User, Globe } from 'lucide-react';

interface HeaderProps {
  currentLang: string;
  isUserLoggedIn: boolean;
  isTranslating: boolean;
  onLanguageChange: (lang: string) => void;
  onToggleLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentLang, 
  isUserLoggedIn, 
  isTranslating, 
  onLanguageChange, 
  onToggleLogin 
}) => {
  return (
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
          onClick={onToggleLogin}
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
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            <option value="en" style={{ background: '#1a1a2e' }}>English</option>
            <option value="hi" style={{ background: '#1a1a2e' }}>हिन्दी (Hindi)</option>
            <option value="te" style={{ background: '#1a1a2e' }}>తెలుగు (Telugu)</option>
            <option value="ta" style={{ background: '#1a1a2e' }}>தமிழ் (Tamil)</option>
            <option value="bn" style={{ background: '#1a1a2e' }}>বাংলা (Bengali)</option>
            <option value="mr" style={{ background: '#1a1a2e' }}>मराठी (Marathi)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
