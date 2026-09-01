import { Link } from 'react-router-dom';
import { Sparkles, Gem, Award, HeartHandshake, ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Particles from '../components/Particles';
import { assetUrl } from '../utils/asset';

export default function About() {
  return (
    <>
      <div className="page-head">
        <span className="eyebrow">Our Story</span>
        <h1>THE ESSENCE OF <span className="gold-text">ND</span></h1>
        <p>Modern fragrance design, premium presentation, memorable scents.</p>
      </div>

      <section className="section-tight">
        <div className="container story-grid">
          <Reveal className="story-visual">
            <img src={assetUrl('/images/bottle-aqua-veil.webp')} alt="Aqua Veil perfume bottle" loading="lazy" />
          </Reveal>
          <Reveal className="story-copy" delay={100}>
            <span className="eyebrow">Who we are</span>
            <h2 className="h2">LUXURY WITHOUT COMPLEXITY</h2>
            <p>
              ND Perfume, marketed by <strong>ND Lifestyle Pvt. Ltd.</strong>, was founded on a
              simple belief — that a great fragrance should be accessible, honest and beautifully
              crafted. No noise. No gimmicks. Just scent that speaks for you.
            </p>
            <p className="muted">
              Each perfume in our collection is composed as a small work of art: balanced top,
              heart and base notes, thoughtful packaging, and a character designed for real life —
              from boardrooms to weddings, from morning coffee to midnight conversations.
            </p>
            <p className="muted">
              We're building a house of Indian fragrances for the world — starting with five
              signature scents and growing every season.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Values" title="WHAT WE STAND FOR" />
          <div className="why-grid">
            {[
              { icon: Sparkles, title: 'Craft', text: 'Carefully balanced Eau de Parfum compositions with premium, long-lasting ingredients.' },
              { icon: Gem, title: 'Presentation', text: 'Elegant bottles and packaging designed to be kept, admired and gifted.' },
              { icon: Award, title: 'Honesty', text: 'Transparent pricing with genuine MRP savings — no inflated discounts.' },
              { icon: HeartHandshake, title: 'Customer-first', text: 'Fast dispatch, easy returns and real humans on support.' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="why-card glass">
                  <span className="why-ic"><f.icon size={22} strokeWidth={1.5} /></span>
                  <h3 className="h3" style={{ fontSize: '1.3rem' }}>{f.title}</h3>
                  <p className="muted" style={{ fontSize: 14.5 }}>{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <Particles count={16} className="cta-particles" />
        <div className="container center">
          <Reveal>
            <h2 className="display" style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}>READY TO MEET YOUR SIGNATURE?</h2>
            <p className="muted" style={{ maxWidth: 520, margin: '16px auto 30px' }}>
              Explore the collection and find the scent that feels like you.
            </p>
            <Link to="/shop" className="btn btn-gold">Shop Collection <ArrowRight size={15} /></Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
