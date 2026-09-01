import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, TrendingUp } from 'lucide-react';
import { api } from '../api/client';
import { useDebounce } from '../hooks/useDebounce';
import { assetUrl } from '../utils/asset';
import { inr } from '../utils/format';

/** Full-screen search overlay with live product results */
export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(q, 250);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQ('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    api
      .get(`/products?search=${encodeURIComponent(debounced)}&limit=6`)
      .then((d) => alive && setResults(d.products))
      .catch(() => alive && setResults([]))
      .finally(() => alive && setLoading(false));
    return () => (alive = false);
  }, [debounced]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const go = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="so-inner">
            <div className="so-bar">
              <Search size={20} className="so-ic" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search fragrances — try “Aqua” or “Woods”…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && q.trim()) go(`/shop?search=${encodeURIComponent(q.trim())}`);
                }}
                aria-label="Search products"
              />
              <button className="icon-btn" onClick={onClose} aria-label="Close search"><X size={22} /></button>
            </div>

            <div className="so-results">
              {loading && (
                <div className="so-loading">
                  {[1, 2, 3].map((i) => (
                    <div className="skeleton" key={i} style={{ height: 64 }} />
                  ))}
                </div>
              )}

              {!loading && debounced.trim() && results.length === 0 && (
                <p className="so-none">No fragrances found for “{debounced}”.</p>
              )}

              {!debounced.trim() && (
                <div className="so-suggest">
                  <p className="so-label"><TrendingUp size={14} /> Popular searches</p>
                  <div className="so-chips">
                    {['Aqua', 'Amber', 'Gold', 'N19', 'Woods'].map((t) => (
                      <button key={t} className="chip" onClick={() => setQ(t)}>{t}</button>
                    ))}
                  </div>
                </div>
              )}

              {results.length > 0 && (
                <ul className="so-list">
                  {results.map((p) => (
                    <li key={p._id}>
                      <button className="so-item" onClick={() => go(`/product/${p.slug}`)}>
                        <img src={assetUrl(p.bottleImage)} alt={p.name} loading="lazy" />
                        <span className="so-meta">
                          <strong>{p.name}</strong>
                          <small>{p.fragranceType} · {p.size}</small>
                        </span>
                        <span className="so-price">{inr(p.price)}</span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button className="so-more" onClick={() => go(`/shop?search=${encodeURIComponent(debounced)}`)}>
                      View all results for “{debounced}” →
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
