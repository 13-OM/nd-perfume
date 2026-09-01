# ND PERFUME — Premium E-Commerce Prototype

> **Luxury without complexity.** A presentation-ready, full-stack perfume e-commerce
> prototype for **ND Perfume**, marketed by **ND Lifestyle Pvt. Ltd.**

![ND Perfume](client/public/images/brand-cutout.webp)

---

## ✨ What's inside

| Layer | Tech | Where |
|---|---|---|
| **Storefront (frontend)** | React 18 · Vite · React Router · Framer Motion · Lucide icons | `client/` |
| **REST API (backend)** | Node.js · Express · JWT · Multer | `server/` |
| **Database** | MongoDB (Atlas-ready via Mongoose) | `server/src/models` |

The prototype includes everything a client demo needs:

- 🏠 **Home** — animated hero with floating particles, signature collection,
  shop-by-fragrance categories, "Why ND", brand story, CTA and FAQ accordion
- 🛍️ **Shop** — search, filters (category / gender / fragrance type / price / rating /
  availability), 6 sort modes, responsive 4→3→2 column grid, quick view, wishlist, badges
- 🧴 **Product pages** — bottle image gallery, buy box, tabs (description / fragrance
  profile / usage / shipping), the **promotional "discover the fragrance" image**,
  story section, perfect-for & character chips, related products, recently viewed
- 🛒 **Cart** — drawer + full page, quantity controls, coupons (`WELCOME10`, `FIRST15`, `ND500`)
- 💳 **Checkout** — 4-step flow (details → address → summary → payment),
  online (simulated) or COD, order confirmation with `#NDXXXXXX`
- 📦 **Track Order** — order ID + mobile lookup with a 6-step timeline
  (Placed → Confirmed → Packed → Shipped → Out for Delivery → Delivered), built to
  plug into Delhivery/Shiprocket later
- 👤 **Accounts** — register / login / forgot password, dashboard with profile,
  orders, wishlist and saved addresses
- 🔐 **Admin panel** at `/admin` — dashboard stats, product CRUD with **separate
  bottle & description image uploads**, order status management, customers, coupons,
  FAQs and banners
- ⚙️ **Scalable data model** — every product comes from MongoDB; the schema already
  supports 30–40+ products without touching the frontend

---

## 🚀 Quick start (local)

Requirements: **Node.js 18+**, **MongoDB** (local install or free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

```bash
# 1. Install dependencies (root + server + client)
npm install
npm run install:all

# 2. Configure the backend environment
cd server
cp .env.example .env
#   → set MONGODB_URI (Atlas or local), JWT_SECRET, admin credentials

# 3. Seed the database with demo data (products, FAQs, coupons, banners, admin)
npm run seed

# 4. Run everything (API on :5000 + storefront on :5173)
cd ..
npm run dev
```

Open **http://localhost:5173**

> **Demo accounts**
> - Customer: `demo@ndperfume.in` / `Demo@123`
> - Admin: `admin@ndperfume.in` / `Admin@123` (login at `http://localhost:5173/admin`)
> - Coupons: `WELCOME10`, `FIRST15`, `ND500`

---

## 🔌 Connecting MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Whitelist your IP (`0.0.0.0/0` for demos) and create a DB user.
3. Copy the connection string into `server/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ndperfume
```

4. `npm run seed` populates Atlas with all demo data.
5. Done — the app now runs fully database-driven. **Credentials never appear in
   frontend code**; the browser only ever talks to the Express API.

---

## 🗂️ Project structure

```
nd-perfume/
├── package.json                 # root scripts (dev, seed, install:all)
├── client/                      # React + Vite storefront
│   ├── public/
│   │   ├── images/              # supplied product bottles, promo images, brand cutout
│   │   └── fonts/               # self-hosted Cormorant Garamond + Jost (works offline)
│   └── src/
│       ├── api/client.js        # fetch wrapper (JWT, guest-id, error normalization)
│       ├── context/             # Auth · Cart · Wishlist · Toast
│       ├── components/          # Navbar, Footer, ProductCard, QuickView, CartDrawer…
│       ├── pages/               # Home, Shop, ProductDetail, Cart, Checkout, Account…
│       ├── admin/               # AdminLogin, Dashboard, Products, Orders, Coupons…
│       └── styles/              # design-system CSS (global.css + components.css)
└── server/                      # Express REST API
    ├── .env.example
    └── src/
        ├── config/db.js         # Mongoose connection
        ├── models/              # User, Product, Order, Cart, Wishlist, Coupon,
        │                        # Category, Review, FAQ, Banner, AdminUser, Address
        ├── middleware/          # auth (JWT), admin, upload (Multer), errorHandler
        ├── controllers/         # business logic per resource
        ├── routes/index.js      # all REST endpoints
        ├── seed/                # seedData.js + seed.js (idempotent)
        └── server.js
```

---

## 🧠 Product image rule (as specified)

Every product has **two independent image fields** in the database:

```js
bottleImage:      '/images/bottle-aqua-veil.webp'   // used in the SHOP GRID + cards
descriptionImage: '/images/desc-aqua-veil.webp'     // used on the PRODUCT PAGE (story section)
```

- The **shop grid shows only bottle images** — promo images never appear in cards.
- The **product page** leads with the bottle, then showcases the promotional image
  under *"Discover the Fragrance"*.
- In the **Admin → Add/Edit Product** form you upload each image separately, so the
  two are managed independently.

The five seeded products use the supplied photos:

| Product | Bottle | Promo/story image |
|---|---|---|
| Aqua Veil | `bottle-aqua-veil.webp` | `desc-aqua-veil.webp` |
| Aqua Desire | `bottle-aqua-desire.webp` | `desc-aqua-desire.webp` |
| Amber Woods | `bottle-amber-woods.webp` | `desc-amber-woods.webp` |
| Gold Aura | `bottle-gold-aura.webp` | `desc-gold-aura.webp` |
| Next Level N19 | `bottle-next-level-n19.webp` | `desc-next-level-n19.webp` |

Brand asset: `brand-cutout.webp` (transparent bottle cutout, used in the hero).

---

## 🔗 REST API overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register|login|forgot-password|reset-password|admin-login` · `GET /api/auth/me` |
| Products | `GET /api/products` (filters/sort/search/pagination) · `GET /api/products/home` · `GET /api/products/slug/:slug` |
| Cart | `GET /api/cart` · `POST /api/cart/add` · `PATCH /api/cart/update` · `DELETE /api/cart/:productId` |
| Wishlist | `GET /api/wishlist` · `POST /api/wishlist/:productId` (toggle) |
| Orders | `POST /api/orders/checkout` · `POST /api/orders/track` · `GET /api/orders` |
| Coupons | `POST /api/coupons/validate` |
| Reviews | `GET /api/reviews/product/:id` · `POST /api/reviews` |
| Users | `GET/PUT /api/users/me` · `PUT /api/users/password` · addresses CRUD · `GET /api/users/orders` |
| Content | `GET /api/faqs` · `GET /api/banners` · `GET /api/categories` |
| Admin (JWT, admin role) | `/api/admin/stats|products|orders|customers|coupons|faqs|banners|categories` |
| Uploads | `POST /api/upload` (admin) → serves `/uploads/...` |

All protected routes use **JWT** (`Authorization: Bearer <token>`); passwords are
hashed with **bcrypt**; admin uses a separate `AdminUser` collection with `aud: 'admin'`
tokens; inputs are validated and errors return a consistent `{ success: false, message }`
shape.

---

## 🎨 Design system

- **Palette** — black (`#0a0a0c`), gold gradient (`#b8860b → #e8c766 → #f5e3a3`),
  ivory text, deep aqua for aquatic scents, warm amber for woody scents.
- **Typography** — Cormorant Garamond (display serif) + Jost (geometric sans),
  **self-hosted** so the site renders identically offline / in sandboxed previews.
- **Motion** — subtle scroll reveals, floating gold particles, card hover elevation
  + image zoom, cart drawer slide, wishlist heart pop, navbar shrink-on-scroll,
  skeleton loaders. Respects `prefers-reduced-motion`.
- **Responsive** — mobile-first; product grid 4 → 3 → 2 columns; hamburger menu,
  filter drawer and full-width layouts under 768px.

---

## 📦 Environment variables

`server/.env` (see `server/.env.example`):

```
MONGODB_URI       # Atlas or local MongoDB connection string
PORT              # API port (default 5000)
JWT_SECRET        # long random string
JWT_EXPIRES_IN    # e.g. 7d
CLIENT_ORIGIN     # CORS allow-list for the storefront
ADMIN_EMAIL       # first admin created by the seed script
ADMIN_PASSWORD    # first admin password
DELHIVERY_API_KEY # placeholder for future shipping integration
RAZORPAY_KEY_ID   # placeholder for future live payments
RAZORPAY_KEY_SECRET
```

`client/.env.example`:

```
VITE_API_URL      # optional; defaults to '/api' (proxied by Vite in dev)
```

---

## 🧪 Testing / notes

- **Payments are simulated** — no real credentials are needed or stored.
- **Order tracking is simulated** — status advances on a timeline; the
  `Order.tracking.provider` field is the seam for Delhivery/Shiprocket.
- **Seed is idempotent** — run `npm run seed` any time to reset demo content.
- Production build: `npm run build` (client) → serve `client/dist` + `server`.

---

© 2026 ND Perfume · Marketed by ND Lifestyle Pvt. Ltd. — prototype build.
