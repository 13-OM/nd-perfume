const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    slug: String,
    bottleImage: String,
    price: { type: Number, required: true },
    mrp: Number,
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const addressSnapshot = new mongoose.Schema(
  {
    fullName: String,
    mobile: String,
    email: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestEmail: String,

    items: [orderItemSchema],

    subtotal: Number,
    discount: Number,
    couponCode: String,
    couponDiscount: Number,
    shipping: Number,
    total: Number,

    paymentMethod: {
      type: String,
      enum: ['online', 'cod'],
      default: 'online',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    // Razorpay payment information
    razorpayOrderId: {
      type: String,
      default: '',
    },

    razorpayPaymentId: {
      type: String,
      default: '',
    },

    razorpaySignature: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: [
        'placed',
        'confirmed',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'placed',
    },

    address: addressSnapshot,

    tracking: {
      provider: { type: String, default: '' },
      trackingId: { type: String, default: '' },
      timeline: [
        {
          status: String,
          label: String,
          timestamp: Date,
          note: String,
        },
      ],
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1 });

module.exports = mongoose.model('Order', orderSchema);