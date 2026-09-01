/** Generate a human-friendly order number like #ND2409012 */
function generateOrderNumber() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `ND${yy}${mm}${dd}${rand}`;
}

module.exports = { generateOrderNumber };
