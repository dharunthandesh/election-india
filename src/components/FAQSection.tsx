import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQSectionProps {
  faqs: readonly any[];
  activeFaq: number | null;
  faqTitle: string;
  onToggleFaq: (idx: number) => void;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const FAQSection: React.FC<FAQSectionProps> = ({ 
  faqs, 
  activeFaq, 
  faqTitle, 
  onToggleFaq 
}) => {
  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      style={{ maxWidth: '800px', margin: '0 auto 80px' }}
    >
      <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '40px' }}>{faqTitle}</h2>
      <div className="faq-list">
        {faqs.map((faq, idx) => (
          <div key={idx} className="faq-item">
            <button 
              className="faq-question" 
              onClick={() => onToggleFaq(idx)}
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
  );
};
