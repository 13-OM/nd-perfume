import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { api } from '../api/client';
import Reveal from '../components/Reveal';

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    api.get('/faqs').then((d) => setFaqs(d.faqs)).catch(() => setFaqs([]));
  }, []);

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">Help Center</span>
        <h1>FREQUENTLY ASKED QUESTIONS</h1>
        <p>Everything you need to know about ND Perfume.</p>
      </div>

      <div className="container" style={{ maxWidth: 820, paddingBottom: 90 }}>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <Reveal key={f._id || i} delay={i * 30}>
              <div className={`faq-item ${open === i ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                  <span>{f.question}</span>
                  <ChevronDown size={17} className="faq-chev" />
                </button>
                <div className="faq-a" style={{ maxHeight: open === i ? 320 : 0 }}>
                  <p>{f.answer}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
