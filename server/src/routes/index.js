const router = require('express').Router();
const { protect, protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

const auth = require('../controllers/auth.controller');
const product = require('../controllers/product.controller');
const cart = require('../controllers/cart.controller');
const wishlist = require('../controllers/wishlist.controller');
const order = require('../controllers/order.controller');
const coupon = require('../controllers/coupon.controller');
const review = require('../controllers/review.controller');
const user = require('../controllers/user.controller');
const admin = require('../controllers/admin.controller');
const content = require('../controllers/content.controller');
const uploadCtrl = require('../controllers/upload.controller');

/* Health */
router.get('/health', (req, res) => res.json({ success: true, service: 'ND Perfume API', time: new Date() }));

/* Auth */
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/forgot-password', auth.forgotPassword);
router.post('/auth/reset-password', auth.resetPassword);
router.get('/auth/me', protect, auth.me);
router.post('/auth/admin-login', auth.adminLogin);

/* Products (public) */
router.get('/products', product.listProducts);
router.get('/products/home', product.getHome);
router.get('/products/collections', product.getCollections);
router.get('/products/slug/:slug', product.getProductBySlug);
router.get('/products/suggest-slug', product.getSuggestSlug);
router.get('/products/:id', product.getProductById);

/* Categories / FAQs / Banners (public) */
router.get('/categories', content.publicCategories);
router.get('/faqs', content.publicFaqs);
router.get('/banners', content.publicBanners);

/* Cart (guest via x-guest-id or logged in) */
router.get('/cart', cart.getCart);
router.post('/cart/add', cart.addToCart);
router.patch('/cart/update', cart.updateCart);
router.delete('/cart/:productId', cart.removeFromCart);
router.delete('/cart', cart.clearCart);

/* Wishlist */
router.get('/wishlist', wishlist.getWishlist);
router.post('/wishlist/:productId', wishlist.toggle);
router.delete('/wishlist/:productId', wishlist.remove);

/* Coupons */
router.post('/coupons/validate', coupon.validate);

/* Reviews */
router.get('/reviews/product/:productId', review.listByProduct);
router.post('/reviews', protect, review.create);

/* Orders */
router.post('/orders/checkout', order.checkout);
router.post('/orders/track', order.trackOrder);
router.get('/orders', protect, order.myOrders);
router.get('/orders/:orderNumber', protect, order.myOrder);

/* Users */
router.get('/users/me', protect, user.profile);
router.put('/users/me', protect, user.updateProfile);
router.put('/users/password', protect, user.changePassword);
router.get('/users/addresses', protect, user.getAddresses);
router.post('/users/addresses', protect, user.addAddress);
router.put('/users/addresses/:id', protect, user.updateAddress);
router.delete('/users/addresses/:id', protect, user.deleteAddress);
router.get('/users/orders', protect, user.myOrders);

/* Uploads (auth for now; admin in practice) */
router.post('/upload', protectAdmin, upload.single('image'), uploadCtrl.uploadSingle);
router.delete('/upload/:filename', protectAdmin, uploadCtrl.deleteFile);

/* ------------------------- ADMIN ------------------------- */
const adminRouter = require('express').Router();
adminRouter.use(protectAdmin);

adminRouter.get('/stats', admin.stats);

adminRouter.get('/products', admin.listAllProducts);
adminRouter.get('/products/:id', admin.getProduct);
adminRouter.post('/products', admin.createProduct);
adminRouter.put('/products/:id', admin.updateProduct);
adminRouter.delete('/products/:id', admin.deleteProduct);

adminRouter.get('/orders', admin.listOrders);
adminRouter.get('/orders/:id', admin.getOrder);
adminRouter.put('/orders/:id/status', admin.updateOrderStatus);

adminRouter.get('/customers', admin.listCustomers);
adminRouter.get('/customers/:id', admin.getCustomer);

adminRouter.get('/coupons', admin.listCoupons);
adminRouter.post('/coupons', admin.createCoupon);
adminRouter.put('/coupons/:id', admin.updateCoupon);
adminRouter.delete('/coupons/:id', admin.deleteCoupon);

adminRouter.get('/faqs', admin.listFaqs);
adminRouter.post('/faqs/:id?', admin.upsertFaq);
adminRouter.delete('/faqs/:id', admin.deleteFaq);

adminRouter.get('/banners', admin.listBanners);
adminRouter.post('/banners/:id?', admin.upsertBanner);
adminRouter.delete('/banners/:id', admin.deleteBanner);

adminRouter.get('/categories', admin.listCategories);
adminRouter.post('/categories/:id?', admin.upsertCategory);
adminRouter.delete('/categories/:id', admin.deleteCategory);

router.use('/admin', adminRouter);

module.exports = router;
