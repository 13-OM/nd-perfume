import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { useState } from 'react';
import Rating from './Rating';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { inr, discountPct } from '../utils/format';
import { assetUrl } from '../utils/asset';

export default function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { ids, isWished, toggle } = useWishlist();
  const [quickView, setQuickView] = useState(false);
  const [added, setAdded] = useState(false);

  const wished = isWished(product._id);
  const discount = product.discount || discountPct(product.mrp, product.price);
  const pct = discount > 0 ? Math.round(discount) : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product._id, product.name);
  };

  const openQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickView(true);
  };

  return (
    <>
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to={`/product/${product.slug}`} className="card-link" aria-label={product.name}>
          <div className="card-media">
            <img
              src={assetUrl(product.bottleImage)}
              alt={`${product.name} — ${product.fragranceType} eau de parfum bottle`}
              loading="lazy"
              decoding="async"
            />
            <div className="card-badges">
              {product.newArrival && <span className="badge badge-new">New</span>}
              {product.bestseller && <span className="badge badge-best">Bestseller</span>}
              {pct > 0 && <span className="badge badge-discount">{pct}% OFF</span>}
            </div>

            <button
              className={`card-wish ${wished ? 'active' : ''}`}
              onClick={handleWish}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={17} fill={wished ? 'currentColor' : 'none'} className="wish-heart" />
            </button>

            <div className="card-quickview">
              <button className="qv-btn" onClick={openQuickView}>
                <Eye size={14} /> Quick View
              </button>
            </div>
          </div>

          <div className="card-body">
            <span className="card-cat">{product.fragranceType} · {product.size}</span>
            <h3 className="card-name">{product.name}</h3>
            <div className="card-rating">
              <Rating value={product.rating} size={13} />
              <span className="card-review-count">({product.reviewCount || 0})</span>
            </div>
            <div className="card-price">
              <span className="price-now">{inr(product.price)}</span>
              {product.mrp > product.price && (
                <span className="price-mrp">{inr(product.mrp)}</span>
              )}
            </div>
          </div>
        </Link>

        <div className="card-actions">
          <button className={`card-atc ${added ? 'added' : ''}`} onClick={handleAdd}>
            {added ? (
              <>
                <Check size={15} /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={15} /> Add to Cart
              </>
            )}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {quickView && (
          <QuickViewModal product={product} onClose={() => setQuickView(false)} onAdd={addItem} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- Quick View modal ---------- */
function QuickViewModal({ product, onClose, onAdd }) {
  const { ids, toggle } = useWishlist();
  const navigate = useNavigate();
  const wished = ids.includes(product._id);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="modal-panel qv-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="qv-grid">
          <div className="qv-media">
            <img src={assetUrl(product.bottleImage)} alt={product.name} />
          </div>
          <div className="qv-info">
            <span className="eyebrow">{product.fragranceType}</span>
            <h3 className="h3">{product.name}</h3>
            <Rating value={product.rating} count={product.reviewCount} showValue />
            <p className="muted" style={{ margin: '10px 0', fontSize: 14 }}>
              {product.shortDescription}
            </p>
            <div className="card-price" style={{ marginBottom: 6 }}>
              <span className="price-now">{inr(product.price)}</span>
              {product.mrp > product.price && <span className="price-mrp">{inr(product.mrp)}</span>}
              {product.discount > 0 && <span className="price-disc">{product.discount}% OFF</span>}
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
              Size: {product.size} · Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </p>
            <div className="qv-btns">
              <button
                className="btn btn-gold btn-sm"
                onClick={() => {
                  onAdd(product, 1);
                  onClose();
                }}
              >
                <ShoppingBag size={14} /> Add to Cart
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate(`/product/${product.slug}`)}
              >
                View Details
              </button>
              <button
                className="qv-wish"
                onClick={() => toggle(product._id, product.name)}
                aria-label="Toggle wishlist"
              >
                <Heart size={18} fill={wished ? 'currentColor' : 'none'} color={wished ? 'var(--danger)' : 'var(--muted)'} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
