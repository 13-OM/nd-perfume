import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Rating from '../components/Rating';
import EmptyState from '../components/EmptyState';
import { inr } from '../utils/format';
import { assetUrl } from '../utils/asset';

export default function WishlistPage() {
  const { ids, remove } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState(null);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    api
      .get('/wishlist')
      .then((d) => setProducts(d.products.filter((p) => ids.includes(p._id))))
      .catch(() => setProducts([]));
  }, [ids]);

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">Saved for later</span>
        <h1>YOUR WISHLIST</h1>
        <p>{ids.length} fragrance{ids.length !== 1 ? 's' : ''} you love</p>
      </div>

      <div className="container" style={{ maxWidth: 980 }}>
        {!products ? (
          <div className="wish-grid">
            {[1, 2, 3].map((i) => <div className="skeleton" key={i} style={{ height: 300 }} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon="heart"
            title="Your wishlist is empty"
            subtitle="Tap the heart on any product to keep it here for later."
          >
            <Link to="/shop" className="btn btn-gold">Discover Fragrances <ArrowRight size={15} /></Link>
          </EmptyState>
        ) : (
          <ul className="wish-grid">
            {products.map((p) => (
              <li key={p._id} className="wish-card">
                <Link to={`/product/${p.slug}`} className="wish-img">
                  <img src={assetUrl(p.bottleImage)} alt={p.name} loading="lazy" />
                  <span className="wish-heart-ic"><Heart size={15} fill="currentColor" /></span>
                </Link>
                <div className="wish-info">
                  <span className="card-cat">{p.fragranceType} · {p.size}</span>
                  <Link to={`/product/${p.slug}`} className="wish-name">{p.name}</Link>
                  <Rating value={p.rating} count={p.reviewCount} size={12} />
                  <div className="card-price">
                    <span className="price-now">{inr(p.price)}</span>
                    {p.mrp > p.price && <span className="price-mrp">{inr(p.mrp)}</span>}
                  </div>
                </div>
                <div className="wish-actions">
                  <button className="btn btn-gold btn-sm" onClick={() => addItem(p, 1)}>
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                  <button className="wish-del" onClick={() => remove(p._id)} aria-label={`Remove ${p.name}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
