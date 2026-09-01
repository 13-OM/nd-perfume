/**
 * assetUrl — resolves image paths that may come from three sources:
 *  1. Static client assets        → /images/xxx.png   (served by Vite)
 *  2. Admin uploads               → /uploads/xxx.png  (served by Express)
 *  3. Absolute external URLs      → https://…
 * In dev, /uploads is proxied by Vite. In production you should configure
 * your web server/CDN for the /uploads prefix.
 */
export function assetUrl(p = '') {
  if (!p) return '';
  if (/^(https?:)?\/\//.test(p)) return p;
  return p;
}
