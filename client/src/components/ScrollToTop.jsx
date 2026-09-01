import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to top on route change (except when hash present) */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}
