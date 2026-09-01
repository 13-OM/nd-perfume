/** Product card skeleton (loading shimmer) */
export function ProductCardSkeleton() {
  return (
    <div className="card skeleton-card">
      <div className="skeleton" style={{ aspectRatio: '4 / 5', width: '100%', borderRadius: '12px' }} />
      <div className="sk-body">
        <div className="skeleton" style={{ height: 14, width: '70%' }} />
        <div className="skeleton" style={{ height: 12, width: '45%' }} />
        <div className="skeleton" style={{ height: 16, width: '55%' }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
