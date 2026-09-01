import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowRight, PackageCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { inr } from '../utils/format';
import { assetUrl } from '../utils/asset';
import QtySelector from './QtySelector';

export default function CartDrawer() {
  const { items, counts, drawerOpen, closeDrawer, removeItem, updateQty } = useCart();
  const navigate = useNavigate();

  const go = (path) => {
    closeDrawer();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Shopping cart"
          >
            <div className="cd-head">
              <h3><ShoppingBag size={18} /> Your Cart <span className="cd-count">{counts.count}</span></h3>
              <button className="icon-btn" onClick={closeDrawer} aria-label="Close cart"><X size={20} /></button>
            </div>

            <div className="cd-body">
              {items.length === 0 ? (
                <div className="cd-empty">
                  <PackageCheck size={42} strokeWidth={1.2} />
                  <p>Your cart is empty</p>
                  <button className="btn btn-gold btn-sm" onClick={() => go('/shop')}>
                    Explore Fragrances <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <ul className="cd-items">
                  {items.map((i) => (
                    <motion.li
                      key={i.productId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="cd-item"
                    >
                      <button className="cd-img" onClick={() => go(`/product/${i.slug}`)}>
                        <img src={assetUrl(i.bottleImage)} alt={i.name} loading="lazy" />
                      </button>
                      <div className="cd-info">
                        <button className="cd-name" onClick={() => go(`/product/${i.slug}`)}>{i.name}</button>
                        <span className="cd-price">{inr(i.price)}</span>
                        <div className="cd-row">
                          <QtySelector quantity={i.quantity} onChange={(q) => updateQty(i.productId, q)} />
                          <button className="cd-remove" onClick={() => removeItem(i.productId)} aria-label={`Remove ${i.name}`}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="cd-foot">
                <div className="cd-sum">
                  <span>Subtotal</span>
                  <strong>{inr(counts.subtotal)}</strong>
                </div>
                {counts.savings > 0 && (
                  <div className="cd-save">You're saving {inr(counts.savings)} on this order</div>
                )}
                <button className="btn btn-gold btn-block" onClick={() => go('/checkout')}>
                  Proceed to Checkout <ArrowRight size={15} />
                </button>
                <button className="btn btn-dark btn-block" onClick={() => go('/cart')}>
                  View Full Cart
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
