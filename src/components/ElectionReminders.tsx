import React from 'react';
import { motion } from 'framer-motion';

interface ElectionRemindersProps {
  onAddCalendar: (category: string) => void;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const ElectionReminders: React.FC<ElectionRemindersProps> = ({ onAddCalendar }) => {
  return (
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
                onClick={() => onAddCalendar(reminder.category)}
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
  );
};
