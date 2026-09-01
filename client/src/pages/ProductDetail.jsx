import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, ShoppingBag, Zap, ChevronRight, Truck, RotateCcw, ShieldCheck,
  Droplets, Layers, Anchor, Sparkles,
} from 'lucide-react';
import { api } from '../api/client';
import Rating from '../components/Rating';
import QtySelector from '../components/QtySelector';
import ProductCard from '../components/ProductCard';
import { SkeletonGrid } from '../components/Skeleton';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { inr } from '../utils/format';
import { assetUrl } from '../utils/asset';
import Reveal from '../components/Reveal';

const RV_KEY = 'nd_recently_viewed';

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const { addItem } = useCart();
  const { ids, toggle } = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    setData(null);
    setQty(1);
    setActiveImg(0);
    setActiveTab('description');
    api
      .get(`/products/slug/${slug}`)
      .then((d) => {
        setData(d);
        // recently viewed
        setRecent(() => {
          const p = d.product;
          const entry = {
            _id: p._id, slug: p.slug, name: p.name, bottleImage: p.bottleImage,
            price: p.price, mrp: p.mrp, discount: p.discount, rating: p.rating,
            reviewCount: p.reviewCount, fragranceType: p.fragranceType, size: p.size,
          };
          const prev = JSON.parse(localStorage.getItem(RV_KEY) || '[]');
          const next = [entry, ...prev.filter((x) => x._id !== p._id)].slice(0, 6);
          localStorage.setItem(RV_KEY, JSON.stringify(next));
          return next;
        });
        document.title = `${d.product.name} — ND Perfume`;
      })
      .catch((e) => {
        toast(e.message, 'error');
        setData({ notFound: true });
      });
  }, [slug, toast]);

  if (!data) {
    return (
      <div className="container" style={{ paddingTop: 140 }}>
        <div className="pdp-loading">
          <div className="skeleton" style={{ height: 420, borderRadius: 16 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 34, width: '60%' }} />
            <div className="skeleton" style={{ height: 16, width: '40%', marginTop: 14 }} />
            <div className="skeleton" style={{ height: 90, width: '90%', marginTop: 24 }} />
            <div className="skeleton" style={{ height: 52, width: '70%', marginTop: 28 }} />
          </div>
        </div>
      </div>
    );
  }

  if (data.notFound) {
    return (
      <div className="container center" style={{ paddingTop: 160, paddingBottom: 80 }}>
        <h1 className="h2">Product not found</h1>
        <p className="muted mt-16">The fragrance you are looking for is unavailable.</p>
        <Link to="/shop" className="btn btn-gold mt-24">Back to Shop</Link>
      </div>
    );
  }

  const { product, related } = data;
  const wished = ids.includes(product._id);
  const images = [product.bottleImage, ...(product.galleryImages || [])].filter(Boolean);
  const discountPct = product.discount || (product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0);

  const buyNow = () => {
    addItem(product, qty, { silent: true });
    navigate('/checkout');
  };

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'notes', label: 'Fragrance Profile' },
    { id: 'usage', label: 'How to Use' },
    { id: 'shipping', label: 'Shipping & Returns' },
  ];

  return (
    <>
      <div className="container" style={{ paddingTop: 130 }}>
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span className="sep">/</span>
          <Link to="/shop">Shop</Link> <span className="sep">/</span>
          <span style={{ color: 'var(--gold-2)' }}>{product.name}</span>
        </nav>

        {/* ------- TOP: bottle + buy box ------- */}
        <div className="pdp-top">
          <motion.div
            className="pdp-media"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pdp-img-main">
              <img
                src={assetUrl(images[activeImg])}
                alt={`${product.name} eau de parfum — bottle`}
                key={images[activeImg]}
              />
            </div>
            {images.length > 1 && (
              <div className="pdp-thumbs">
                {images.map((img, i) => (
                  <button key={i} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                    <img src={assetUrl(img)} alt={`${product.name} view ${i + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            className="pdp-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow">{product.fragranceType} · {product.gender}</span>
            <h1 className="h2" style={{ marginTop: 10 }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
              <Rating value={product.rating} showValue size={16} />
              <span className="muted" style={{ fontSize: 13 }}>
                {product.reviewCount} verified review{product.reviewCount !== 1 ? 's' : ''}
              </span>
            </div>

            <p className="muted pdp-short">{product.shortDescription}</p>

            <div className="pdp-price">
              <span className="price-now">{inr(product.price)}</span>
              {product.mrp > product.price && <span className="price-mrp">{inr(product.mrp)}</span>}
              {discountPct > 0 && <span className="price-disc">{discountPct}% OFF</span>}
            </div>
            <p className="pdp-tax">Inclusive of all taxes · Free shipping above ₹999</p>

            <div className="pdp-meta">
              <div><span>Size</span><strong>{product.size}</strong></div>
              <div><span>Longevity</span><strong>{product.longevity || '6–8 hours'}</strong></div>
              <div><span>Sillage</span><strong>{product.sillage || 'Moderate'}</strong></div>
              <div><span>Stock</span><strong className={product.stock > 0 ? 'ok' : 'low'}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </strong></div>
            </div>

            <div className="pdp-qty-row">
              <span className="pdp-qty-label">Quantity</span>
              <QtySelector quantity={qty} onChange={setQty} max={Math.max(product.stock, 1)} />
            </div>

            <div className="pdp-btns">
              <button
                className="btn btn-gold"
                onClick={() => addItem(product, qty)}
                disabled={product.stock <= 0}
              >
                <ShoppingBag size={16} /> Add to Cart
              </button>
              <button className="btn btn-outline" onClick={buyNow} disabled={product.stock <= 0}>
                <Zap size={16} /> Buy Now
              </button>
              <button
                className={`pdp-wish ${wished ? 'active' : ''}`}
                onClick={() => toggle(product._id, product.name)}
                aria-label="Toggle wishlist"
              >
                <Heart size={20} fill={wished ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="pdp-assurances">
              <span><Truck size={16} /> Fast delivery</span>
              <span><RotateCcw size={16} /> 7-day returns</span>
              <span><ShieldCheck size={16} /> 100% authentic</span>
            </div>
          </motion.div>
        </div>

        {/* ------- INFO TABS ------- */}
        <div className="pdp-tabs">
          <div className="pdp-tabbar">
            {tabs.map((t) => (
              <button key={t.id} className={`pdp-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="pdp-tabpanel">
            {activeTab === 'description' && (
              <p className="muted" style={{ fontSize: 15.5, lineHeight: 1.9 }}>{product.description}</p>
            )}
            {activeTab === 'notes' && (
              <div className="notes-grid">
                {product.topNotes?.length > 0 && (
                  <div className="note-col">
                    <span className="note-ic"><Droplets size={17} /></span>
                    <h4>Top Notes</h4>
                    <p>{product.topNotes.join(' · ')}</p>
                  </div>
                )}
                {product.heartNotes?.length > 0 && (
                  <div className="note-col">
                    <span className="note-ic"><Layers size={17} /></span>
                    <h4>Heart Notes</h4>
                    <p>{product.heartNotes.join(' · ')}</p>
                  </div>
                )}
                {product.baseNotes?.length > 0 && (
                  <div className="note-col">
                    <span className="note-ic"><Anchor size={17} /></span>
                    <h4>Base Notes</h4>
                    <p>{product.baseNotes.join(' · ')}</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'usage' && (
              <p className="muted" style={{ fontSize: 15.5, lineHeight: 1.9 }}>
                {product.usage || 'Spray on pulse points — wrists, neck and behind the ears — from 15–20 cm away. Apply over moisturised skin for longer wear.'}
              </p>
            )}
            {activeTab === 'shipping' && (
              <div className="shipping-grid">
                <div><strong>Shipping</strong><p>Dispatched within 24 hours. Delivery in 3–7 business days across India. Free above ₹999.</p></div>
                <div><strong>Returns</strong><p>7-day return window for damaged or incorrect products. Unsealed fragrances can't be returned for hygiene reasons.</p></div>
                <div><strong>Payments</strong><p>UPI, cards, net banking and Cash on Delivery.</p></div>
              </div>
            )}
          </div>
        </div>

        {/* ------- STORYTELLING SECTIONS ------- */}
        <Reveal className="pdp-story">
          <div className="pdp-story-head">
            <span className="eyebrow">Storytelling</span>
            <h2 className="h3">DISCOVER THE FRAGRANCE</h2>
          </div>
          <div className="pdp-desc-img">
            <img
              src={assetUrl(product.descriptionImage)}
              alt={`${product.name} — fragrance story and character`}
              loading="lazy"
            />
          </div>
        </Reveal>

        {product.story && (
          <Reveal className="section-tight pdp-essence">
            <div className="pdp-essence-inner">
              <Sparkles size={22} style={{ color: 'var(--gold-2)' }} />
              <h3 className="h3">THE STORY BEHIND THE SCENT</h3>
              <p className="muted">{product.story}</p>
            </div>
          </Reveal>
        )}

        {(product.perfectFor?.length > 0 || product.fragranceCharacter) && (
          <Reveal className="section-tight">
            <div className="pdp-more">
              {product.perfectFor?.length > 0 && (
                <div>
                  <h4>PERFECT FOR</h4>
                  <div className="chips">
                    {product.perfectFor.map((p) => <span key={p} className="chip">{p}</span>)}
                  </div>
                </div>
              )}
              {product.fragranceCharacter && (
                <div>
                  <h4>FRAGRANCE CHARACTER</h4>
                  <p className="gold-text" style={{ fontSize: 19, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                    {product.fragranceCharacter}
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        )}

        {/* ------- YOU MAY ALSO LIKE ------- */}
        {related?.length > 0 && (
          <section className="section-tight">
            <div className="sec-head left" style={{ marginBottom: 30 }}>
              <span className="eyebrow">Complete the wardrobe</span>
              <h2 className="h3">YOU MAY ALSO LIKE</h2>
            </div>
            <div className="product-grid">
              {related.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ------- RECENTLY VIEWED ------- */}
        {recent.length > 1 && (
          <section className="section-tight">
            <div className="sec-head left" style={{ marginBottom: 30 }}>
              <span className="eyebrow">Pick up where you left off</span>
              <h2 className="h3">RECENTLY VIEWED</h2>
            </div>
            <div className="product-grid">
              {recent.slice(0, 4).map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
