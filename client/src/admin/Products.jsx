import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Star } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { inr } from '../utils/format';
import { assetUrl } from '../utils/asset';

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const load = useCallback((q = '') => {
    setProducts(null);
    api.get(`/admin/products${q ? `?search=${encodeURIComponent(q)}` : ''}`, { isAdmin: true })
      .then((d) => setProducts(d.products))
      .catch((e) => toast(e.message, 'error'));
  }, [toast]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/admin/products/${p._id}`, { isAdmin: true });
      toast(`${p.name} deleted`);
      load(search);
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <div>
      <div className="admin-head">
        <h1>Products</h1>
        <Link to="/admin/products/new" className="btn btn-gold btn-sm"><Plus size={15} /> Add Product</Link>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" />
        </div>
        <span className="muted">{products?.length || 0} products</span>
      </div>

      {!products ? (
        <div className="admin-panel"><div className="skeleton" style={{ height: 300 }} /></div>
      ) : products.length === 0 ? (
        <div className="admin-panel"><p className="muted center" style={{ padding: 40 }}>No products found.</p></div>
      ) : (
        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Flags</th><th style={{ width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="a-prod">
                      <img src={assetUrl(p.bottleImage)} alt={p.name} loading="lazy" />
                      <div>
                        <strong>{p.name}</strong>
                        <span>{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td>{p.gender} · {p.fragranceType}</td>
                  <td><strong>{inr(p.price)}</strong> <s className="muted">{inr(p.mrp)}</s></td>
                  <td>
                    <span className={p.stock <= p.lowStockThreshold ? 'stock-low' : 'stock-ok'}>{p.stock}</span>
                  </td>
                  <td><Star size={13} style={{ color: 'var(--gold-2)' }} /> {p.rating}</td>
                  <td>
                    <div className="a-flags">
                      {p.featured && <span className="badge badge-feat">Featured</span>}
                      {p.bestseller && <span className="badge badge-best">Best</span>}
                      {p.newArrival && <span className="badge badge-new">New</span>}
                    </div>
                  </td>
                  <td>
                    <div className="a-actions">
                      <Link to={`/admin/products/${p._id}`} className="icon-btn" aria-label="Edit"><Pencil size={15} /></Link>
                      <button className="icon-btn danger" onClick={() => remove(p)} aria-label="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
