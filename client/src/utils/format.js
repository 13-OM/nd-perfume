/** ₹ INR formatting */
export function inr(n) {
  const v = Number(n) || 0;
  return '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

/** Discount percentage between MRP and price */
export function discountPct(mrp, price) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Shipment estimate lines */
export function shippingNote(subtotal) {
  return subtotal >= 999 ? { cost: 0, note: 'Free shipping unlocked' } : { cost: 49, note: 'Free shipping above ₹999' };
}

/** Pretty date */
export function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
