/**
 * API client — thin fetch wrapper around the Express REST API.
 * Reads the token from localStorage, attaches x-guest-id for guest carts,
 * and normalizes errors so pages can show meaningful toasts.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getGuestId() {
  let id = localStorage.getItem('nd_guest_id');
  if (!id) {
    id = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('nd_guest_id', id);
  }
  return id;
}

export function getToken() {
  return localStorage.getItem('nd_token');
}
export function setToken(t) {
  if (t) localStorage.setItem('nd_token', t);
  else localStorage.removeItem('nd_token');
}
export function getAdminToken() {
  return localStorage.getItem('nd_admin_token');
}
export function setAdminToken(t) {
  if (t) localStorage.setItem('nd_admin_token', t);
  else localStorage.removeItem('nd_admin_token');
}

async function request(path, { method = 'GET', body, isAdmin = false, formData = false } = {}) {
  const headers = {};
  const token = isAdmin ? getAdminToken() : getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!formData) headers['Content-Type'] = 'application/json';
  headers['x-guest-id'] = getGuestId();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: formData ? body : body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = { success: false, message: 'Unexpected response from server' };
  }
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (p, opts) => request(p, { ...opts, method: 'GET' }),
  post: (p, body, opts) => request(p, { ...opts, method: 'POST', body }),
  put: (p, body, opts) => request(p, { ...opts, method: 'PUT', body }),
  patch: (p, body, opts) => request(p, { ...opts, method: 'PATCH', body }),
  del: (p, opts) => request(p, { ...opts, method: 'DELETE' }),
};
