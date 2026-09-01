import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Order enquiry', message: '' });
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const submit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: '', email: '', subject: 'Order enquiry', message: '' });
      toast('Message sent! Our team will reply within 24 hours.');
    }, 900);
  };

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">Support</span>
        <h1>CONTACT US</h1>
        <p>Questions, orders or just want to talk scents? We're listening.</p>
      </div>

      <div className="container contact-layout">
        <div className="contact-info">
          {[
            { icon: Mail, title: 'Email', lines: ['care@ndperfume.in', 'partners@ndperfume.in'] },
            { icon: Phone, title: 'Phone / WhatsApp', lines: ['+91 98765 43210', 'Mon–Sat, 10 AM – 7 PM'] },
            { icon: MapPin, title: 'Office', lines: ['ND Lifestyle Pvt. Ltd.', 'Rajkot, Gujarat, India'] },
            { icon: Clock, title: 'Support Hours', lines: ['Mon–Sat · 10:00 – 19:00 IST', 'Response within 24 hours'] },
          ].map((c, i) => (
            <div key={c.title} className="c-info-row glass">
              <span className="c-ic"><c.icon size={19} /></span>
              <div><strong>{c.title}</strong>{c.lines.map((l) => <p key={l}>{l}</p>)}</div>
            </div>
          ))}
        </div>

        <form className="contact-form" onSubmit={submit}>
          <h3 className="h3">SEND US A MESSAGE</h3>
          <div className="form-grid">
            <div className="field"><label>Your Name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>Email</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Subject</label>
              <select className="select" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                <option>Order enquiry</option>
                <option>Track my order</option>
                <option>Returns &amp; refunds</option>
                <option>Bulk / corporate gifting</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label>Message</label>
              <textarea className="textarea" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" />
            </div>
          </div>
          <button className="btn btn-gold" disabled={sending}>
            {sending ? <Loader2 size={15} className="spin" /> : <Send size={15} />} Send Message
          </button>
        </form>
      </div>
    </>
  );
}
