import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useToast } from './ToastContext';

const CART_KEY = 'nd_cart_v1';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const addItem = useCallback(
    (product, qty = 1, { silent = false } = {}) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product._id);
        if (existing) {
          return prev.map((i) =>
            i.productId === product._id ? { ...i, quantity: i.quantity + qty } : i
          );
        }
        return [
          ...prev,
          {
            productId: product._id,
            name: product.name,
            slug: product.slug,
            bottleImage: product.bottleImage,
            price: product.price,
            mrp: product.mrp,
            quantity: qty,
          },
        ];
      });
      if (!silent) {
        toast(`${product.name} added to cart`);
        setDrawerOpen(true);
      }
      // sync to server (best effort — works when API is up)
      api.post('/cart/add', { productId: product._id, quantity: qty }).catch(() => {});
    },
    [toast]
  );

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    api.del(`/cart/${productId}`).catch(() => {});
  }, []);

  const updateQty = useCallback(
    (productId, qty) => {
      if (qty < 1) return removeItem(productId);
      setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)));
      api.patch('/cart/update', { productId, quantity: qty }).catch(() => {});
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    api.del('/cart').catch(() => {});
  }, []);

  const counts = useMemo(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const mrpTotal = items.reduce((s, i) => s + (i.mrp || i.price) * i.quantity, 0);
    return { count, subtotal, mrpTotal, savings: mrpTotal - subtotal };
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, counts, drawerOpen, openDrawer, closeDrawer, addItem, removeItem, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
