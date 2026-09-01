/**
 * assetUrl — resolves image paths that may come from three sources:
 *  1. Static client assets        → /images/xxx.png   (served by Vite)
 *  2. Admin uploads               → /uploads/xxx.png  (served by Express)
 *  3. Absolute external URLs      → https://…
 * In dev, /uploads is proxied by Vite. In production you should configure
 * your web server/CDN for the /uploads prefix.
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

export function assetUrl(p = '') {
  if (!p) return '';

  // Already an absolute URL
  if (/^(https?:)?\/\//.test(p)) return p;

  // Admin-uploaded images live on the backend
  if (p.startsWith('/uploads/')) {
    return `${API_BASE}${p}`;
  }

  // Normal frontend static images
  return p;
}
