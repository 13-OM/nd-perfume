import { Minus, Plus } from 'lucide-react';

export default function QtySelector({ quantity, onChange, max = 99 }) {
  return (
    <div className="qty">
      <button onClick={() => onChange(quantity - 1)} aria-label="Decrease quantity" disabled={quantity <= 1}>
        <Minus size={14} />
      </button>
      <span>{quantity}</span>
      <button onClick={() => onChange(quantity + 1)} aria-label="Increase quantity" disabled={quantity >= max}>
        <Plus size={14} />
      </button>
    </div>
  );
}
