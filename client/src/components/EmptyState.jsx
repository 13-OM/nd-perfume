import { ShoppingBag, Heart, SearchX, PackageOpen } from 'lucide-react';

const ICONS = { cart: ShoppingBag, heart: Heart, search: SearchX, box: PackageOpen };

export default function EmptyState({ icon = 'cart', title, subtitle, children }) {
  const Icon = ICONS[icon] || ShoppingBag;
  return (
    <div className="empty-state">
      <div className="es-icon">
        <Icon size={34} strokeWidth={1.4} />
      </div>
      <h3 className="h3">{title}</h3>
      {subtitle && <p style={{ maxWidth: 420 }}>{subtitle}</p>}
      {children}
    </div>
  );
}
