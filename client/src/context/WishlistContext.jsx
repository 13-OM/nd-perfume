import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useToast } from './ToastContext';

const WL_KEY = 'nd_wishlist_v1';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(WL_KEY)) || [];
    } catch {
      return [];
    }
  });
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem(WL_KEY, JSON.stringify(ids));
  }, [ids]);

  const isWished = useCallback((productId) => ids.includes(productId), [ids]);

  const toggle = useCallback(
    (productId, productName) => {
      let added = false;
      setIds((prev) => {
        if (prev.includes(productId)) {
          return prev.filter((x) => x !== productId);
        }
        added = true;
        return [...prev, productId];
      });
      toast(
        added ? `${productName || 'Product'} added to wishlist` : `${productName || 'Product'} removed from wishlist`,
        added ? 'success' : 'success'
      );
      api.post(`/wishlist/${productId}`).catch(() => {});
    },
    [toast]
  );

  const remove = useCallback((productId) => {
    setIds((prev) => prev.filter((x) => x !== productId));
    api.del(`/wishlist/${productId}`).catch(() => {});
  }, []);

  const value = useMemo(() => ({ ids, isWished, toggle, remove }), [ids, isWished, toggle, remove]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
