/**
 * assetUrl — resolves image paths that may come from three sources:
 *  1. Static client assets        → /images/xxx.png   (served by Vite)
 *  2. Admin uploads               → /uploads/xxx.png  (served by Express)
 *  3. Absolute external URLs      → https://…
 * In dev, /uploads is proxied by Vite. In production you should configure
 * your web server/CDN for the /uploads prefix.
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

const SERVER_BASE = API_BASE.replace(/\/api\/?$/, '');

export function assetUrl(p = '') {
  if (!p) return '';

  // Absolute URL
  if (/^(https?:)?\/\//.test(p)) return p;

  // Admin-uploaded images are served by Express
  if (p.startsWith('/uploads/')) {
    return `${SERVER_BASE}${p}`;
  }

  // Static client images
  return p;
}
