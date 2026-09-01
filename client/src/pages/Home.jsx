import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Clock, Gift, CalendarDays, ChevronDown, ArrowRight, Droplets,
  Flame, Wind, Sun, Moon, Gem,
} from 'lucide-react';
import Particles from '../components/Particles';
import SectionHeading from '../components/SectionHeading';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import { api } from '../api/client';
import { assetUrl } from '../utils/asset';
import { SkeletonGrid } from '../components/Skeleton';

const PERFUME_COLORS = {
  'Aqua Veil': 'var(--aqua)',
  'Aqua Desire': 'var(--aqua-deep)',
  'Amber Woods': 'var(--amber)',
  'Gold Aura': 'var(--gold-2)',
  'Next Level N19': '#8a7a5a',
};

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    api.get('/products/home').then((d) => setFeatured(d.featured)).catch(() => setFeatured([]));
    api.get('/faqs').then((d) => setFaqs(d.faqs)).catch(() => setFaqs([]));
  }, []);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero">
        <Particles className="hero-particles" />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="container hero-grid">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow">Marketed by ND Lifestyle Pvt. Ltd.</span>
            <h1 className="display hero-title">
              ND <span className="gold-text">PERFUME</span>
            </h1>
            <p className="hero-tag">SCENT YOUR SIGNATURE</p>
            <p className="hero-sub">
              Premium fragrances crafted to leave a lasting impression — modern, elegant and made
              for every moment that matters.
            </p>
            <div className="hero-btns">
              <Link to="/shop" className="btn btn-gold">Shop Collection</Link>
              <Link to="/shop#collections" className="btn btn-outline">Explore Fragrances</Link>
            </div>
            <div className="hero-stats">
              <div><strong>4.8★</strong><span>Avg. rating</span></div>
              <div><strong>50K+</strong><span>Happy noses</span></div>
              <div><strong>100%</strong><span>Eau de Parfum</span></div>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-ring" />
            <img
              src={assetUrl('/images/brand-cutout.webp')}
              alt="ND Perfume — premium fragrance bottles"
              className="hero-img"
            />
            <motion.div
              className="hero-chip chip-1 glass"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.7 }}
            >
              <Sparkles size={15} /> Eau de Parfum · 50 ML
            </motion.div>
            <motion.div
              className="hero-chip chip-2 glass"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.7 }}
            >
              <Gem size={15} /> Premium Craftsmanship
            </motion.div>
          </motion.div>
        </div>
        <div className="hero-scroll">
          <span>Scroll</span>
          <ChevronDown size={15} />
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <div className="marquee-group" key={k}>
              {['Aqua Veil', 'Aqua Desire', 'Amber Woods', 'Gold Aura', 'Next Level N19'].map((n) => (
                <span key={n} className="marquee-item">
                  <span className="dot" style={{ background: PERFUME_COLORS[n] }} />
                  {n.toUpperCase()}
                  <span className="star">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============ SIGNATURE FRAGRANCES ============ */}
      <section className="section" id="collections">
        <div className="container">
          <SectionHeading
            eyebrow="The Collection"
            title="OUR SIGNATURE FRAGRANCES"
            subtitle="Five scents, one standard — crafted in small batches for those who notice details."
          />
          {!featured ? (
            <SkeletonGrid count={5} />
          ) : (
            <div className="product-grid">
              {featured.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
          <div className="center mt-40">
            <Link to="/shop" className="btn btn-outline">
              View All Fragrances <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ SHOP BY FRAGRANCE ============ */}
      <section className="section section-alt">
        <div className="container">
          <SectionHeading
            eyebrow="Browse"
            title="SHOP BY FRAGRANCE"
            subtitle="Find the mood you want to wear — by gender or by scent family."
          />
          <div className="cat-grid">
            {[
              { name: 'Men', icon: Flame, to: '/shop?gender=Men', tint: 'var(--amber)' },
              { name: 'Women', icon: Sun, to: '/shop?gender=Women', tint: 'var(--gold-2)' },
              { name: 'Unisex', icon: Wind, to: '/shop?gender=Unisex', tint: 'var(--aqua)' },
              { name: 'Aquatic', icon: Droplets, to: '/shop?fragranceType=Aquatic', tint: 'var(--aqua)' },
              { name: 'Woody', icon: Flame, to: '/shop?fragranceType=Woody', tint: 'var(--amber)' },
              { name: 'Amber', icon: Moon, to: '/shop?fragranceType=Amber', tint: 'var(--gold-2)' },
              { name: 'Fresh', icon: Wind, to: '/shop?fragranceType=Fresh', tint: 'var(--aqua)' },
              { name: 'Oriental', icon: Gem, to: '/shop?fragranceType=Oriental', tint: 'var(--gold-2)' },
            ].map((c, i) => (
              <Reveal key={c.name} delay={i * 40}>
                <Link to={c.to} className="cat-card">
                  <span className="cat-ic" style={{ color: c.tint, borderColor: `${c.tint}55`, background: `${c.tint}11` }}>
                    <c.icon size={22} strokeWidth={1.6} />
                  </span>
                  <strong>{c.name}</strong>
                  <small>Explore collection →</small>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY ND ============ */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Why ND Perfume" title="CRAFTED FOR THE DISCERNING" />
          <div className="why-grid">
            {[
              { icon: Sparkles, title: 'Premium Fragrance', text: 'Carefully composed Eau de Parfum with balanced, lasting scent profiles.' },
              { icon: Clock, title: 'Long-Lasting', text: '6–12 hours of wear — from morning meetings to midnight moments.' },
              { icon: Gift, title: 'Elegant Packaging', text: 'Designed to be admired on your vanity, and gifted with pride.' },
              { icon: CalendarDays, title: 'Every Occasion', text: 'From daily confidence to celebrations — there is an ND scent for it.' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 70}>
                <div className="why-card glass">
                  <motion.span
                    className="why-ic"
                    initial={{ rotate: -12, scale: 0.9 }}
                    whileInView={{ rotate: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                  >
                    <f.icon size={24} strokeWidth={1.5} />
                  </motion.span>
                  <h3 className="h3" style={{ fontSize: '1.35rem' }}>{f.title}</h3>
                  <p className="muted" style={{ fontSize: 14.5 }}>{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BRAND STORY ============ */}
      <section className="section story-section">
        <div className="container story-grid">
          <Reveal className="story-visual">
            <img src={assetUrl('/images/bottle-gold-aura.webp')} alt="Gold Aura perfume bottle" loading="lazy" />
          </Reveal>
          <Reveal className="story-copy" delay={120}>
            <span className="eyebrow">Our Story</span>
            <h2 className="h2">THE ESSENCE OF <span className="gold-text">ND</span></h2>
            <p>
              ND Perfume, marketed by ND Lifestyle Pvt. Ltd., brings together modern fragrance
              design, premium presentation and memorable scents — created for everyday confidence
              and special occasions alike.
            </p>
            <p className="muted">
              Every bottle is a small statement: of taste, of intention, of the moment you walk
              into. We believe luxury should be simple to enjoy — no noise, no complexity, just
              scent that speaks for you.
            </p>
            <Link to="/about" className="btn btn-gold">Discover Our Story <ArrowRight size={15} /></Link>
          </Reveal>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="cta-section">
        <Particles count={18} className="cta-particles" />
        <div className="container center">
          <Reveal>
            <h2 className="display" style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)' }}>
              FIND YOUR <span className="gold-text">SIGNATURE SCENT</span>
            </h2>
            <p className="muted" style={{ maxWidth: 520, margin: '16px auto 30px' }}>
              Your scent is your silent introduction. Let it be unforgettable.
            </p>
            <Link to="/shop" className="btn btn-gold">Shop Now <ArrowRight size={15} /></Link>
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          <SectionHeading eyebrow="Help Center" title="FREQUENTLY ASKED QUESTIONS" />
          <div className="faq-list">
            {(faqs.length ? faqs : FALLBACK_FAQS).map((f, i) => (
              <Reveal key={f._id || i} delay={i * 40}>
                <div className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                    <span>{f.question}</span>
                    <ChevronDown size={17} className="faq-chev" />
                  </button>
                  <div className="faq-a" style={{ maxHeight: openFaq === i ? 320 : 0 }}>
                    <p>{f.answer}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="center muted mt-24" style={{ fontSize: 14 }}>
            Still have questions? <Link to="/contact" style={{ color: 'var(--gold-2)' }}>Contact our support team</Link>
          </p>
        </div>
      </section>
    </>
  );
}

const FALLBACK_FAQS = [
  { question: 'What fragrances do you offer?', answer: 'Aquatic, woody, amber and oriental Eau de Parfums — Aqua Veil, Aqua Desire, Amber Woods, Gold Aura and Next Level N19.' },
  { question: 'How long does the fragrance last?', answer: '6–12 hours depending on the scent and your skin type.' },
];
