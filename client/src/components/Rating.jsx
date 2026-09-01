import { Star } from 'lucide-react';

/** Star rating display + optional count */
export default function Rating({ value = 0, count, size = 15, showValue = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`Rated ${value} out of 5`}>
      {stars.map((s) => (
        <Star
          key={s}
          size={size}
          fill={s <= Math.round(value) ? 'currentColor' : 'none'}
          className={s <= Math.round(value) ? '' : 'off'}
        />
      ))}
      {showValue && <span style={{ marginLeft: 6, color: 'var(--muted)', fontSize: 13 }}>{value}</span>}
      {count !== undefined && (
        <span style={{ marginLeft: 4, color: 'var(--muted-2)', fontSize: 12 }}>({count})</span>
      )}
    </span>
  );
}
