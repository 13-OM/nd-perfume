import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react';
import { api } from '../api/client';
import { useDebounce } from '../hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import { SkeletonGrid } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'bestseller', label: 'Best Selling' },
];

const PRICE_BANDS = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 – ₹1,200', min: 1000, max: 1200 },
  { label: '₹1,200 – ₹1,500', min: 1200, max: 1500 },
  { label: 'Above ₹1,500', min: 1500, max: 99999 },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState(null);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState({ categories: [], genders: [], fragranceTypes: [] });
  const [sort, setSort] = useState('featured');
  const [search, setSearch] = useState(params.get('search') || '');
  const debouncedSearch = useDebounce(search, 350);
  const [mobileFilters, setMobileFilters] = useState(false);
  const toast = useToast();

  const gender = params.get('gender') || '';
  const fragranceType = params.get('fragranceType') || '';
  const category = params.get('category') || '';
  const priceBand = params.get('price') || '';
  const minRating = params.get('rating') || '';
  const availability = params.get('availability') || '';

  const fetchProducts = useCallback(() => {
    const qs = new URLSearchParams();
    qs.set('limit', '20');
    qs.set('sort', sort);
    if (debouncedSearch) qs.set('search', debouncedSearch);
    if (gender) qs.set('gender', gender);
    if (fragranceType) qs.set('fragranceType', fragranceType);
    if (category) qs.set('category', category);
    if (priceBand) {
      const band = PRICE_BANDS.find((b) => b.label === priceBand);
      if (band) {
        qs.set('minPrice', String(band.min));
        qs.set('maxPrice', String(band.max));
      }
    }
    if (minRating) qs.set('rating', minRating);
    if (availability) qs.set('availability', availability);

    setProducts(null);
    api
      .get(`/products?${qs}`)
      .then((d) => {
        setProducts(d.products);
        setTotal(d.total);
        setFacets(d.facets);
      })
      .catch((e) => {
        toast(e.message, 'error');
        setProducts([]);
      });
  }, [sort, debouncedSearch, gender, fragranceType, category, priceBand, minRating, availability, toast]);

  useEffect(() => fetchProducts(), [fetchProducts]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: false });
  };

  const activeFilterCount = [gender, fragranceType, category, priceBand, minRating, availability].filter(Boolean).length;

  const heading = useMemo(() => {
    if (gender) return `${gender} Fragrances`;
    if (fragranceType) return `${fragranceType} Fragrances`;
    if (category) return `${category}`;
    if (debouncedSearch) return `Results for “${debouncedSearch}”`;
    return 'Shop All Fragrances';
  }, [gender, fragranceType, category, debouncedSearch]);

  const Filters = (
    <div className="filters">
      <div className="filter-group">
        <h4>Category</h4>
        {['Men', 'Women', 'Unisex'].map((g) => (
          <label key={g} className="f-check">
            <input type="checkbox" checked={gender === g} onChange={() => setParam('gender', gender === g ? '' : g)} />
            <span>{g}</span>
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4>Fragrance Type</h4>
        {(facets.fragranceTypes.length ? facets.fragranceTypes : ['Aquatic', 'Woody', 'Amber', 'Fresh', 'Oriental', 'Floral']).map((t) => (
          <label key={t} className="f-check">
            <input type="checkbox" checked={fragranceType === t} onChange={() => setParam('fragranceType', fragranceType === t ? '' : t)} />
            <span>{t}</span>
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4>Price Range</h4>
        {PRICE_BANDS.map((b) => (
          <label key={b.label} className="f-check">
            <input type="radio" name="price" checked={priceBand === b.label} onChange={() => setParam('price', priceBand === b.label ? '' : b.label)} />
            <span>{b.label}</span>
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4>Rating</h4>
        {['4.5', '4.0', '3.5'].map((r) => (
          <label key={r} className="f-check">
            <input type="checkbox" checked={minRating === r} onChange={() => setParam('rating', minRating === r ? '' : r)} />
            <span>{r}★ & above</span>
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4>Availability</h4>
        <label className="f-check">
          <input type="checkbox" checked={availability === 'in_stock'} onChange={() => setParam('availability', availability === 'in_stock' ? '' : 'in_stock')} />
          <span>In stock only</span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button className="btn btn-dark btn-block btn-sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">The Collection</span>
        <h1>{heading}</h1>
        <p>{total} fragrance{total !== 1 ? 's' : ''} available</p>
      </div>

      <div className="container shop-layout">
        <aside className="shop-side">{Filters}</aside>

        <div className="shop-main">
          <div className="shop-toolbar">
            <div className="shop-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search in fragrances…"
                aria-label="Search products"
              />
              {search && (
                <button onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>
              )}
            </div>
            <div className="shop-sort">
              <SlidersHorizontal size={15} />
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="sort-chev" />
            </div>
            <button className="filter-toggle" onClick={() => setMobileFilters(true)}>
              <SlidersHorizontal size={16} /> Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </button>
          </div>

          {!products ? (
            <SkeletonGrid count={8} />
          ) : products.length === 0 ? (
            <EmptyState
              icon="search"
              title="No fragrances found"
              subtitle="Try adjusting your filters or search for a different scent."
            >
              <button className="btn btn-outline btn-sm" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                Reset Filters
              </button>
            </EmptyState>
          ) : (
            <div className="product-grid">
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="modal-backdrop" onClick={() => setMobileFilters(false)}>
          <div className="modal-panel mf-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mf-head">
              <h3 className="h3">Filters</h3>
              <button className="icon-btn" onClick={() => setMobileFilters(false)}><X size={20} /></button>
            </div>
            <div className="mf-body">{Filters}</div>
            <div className="mf-foot">
              <button className="btn btn-gold btn-block" onClick={() => setMobileFilters(false)}>Show Results</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
