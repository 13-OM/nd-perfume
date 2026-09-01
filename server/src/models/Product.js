const mongoose = require('mongoose');

/**
 * Product schema — the heart of the store.
 *
 * IMPORTANT: `bottleImage` (the individual bottle photo shown in the shop
 * grid) and `descriptionImage` (the promotional/storytelling image shown on
 * the product detail page) are TWO SEPARATE FIELDS by design.
 */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },

    description: { type: String, default: '' },
    shortDescription: { type: String, default: '' },

    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: 0, max: 100, default: 0 },

    category: { type: String, default: 'Unisex' }, // Men | Women | Unisex | Aquatic | Woody | Amber | Fresh | Oriental
    gender: { type: String, enum: ['Men', 'Women', 'Unisex'], default: 'Unisex' },
    fragranceType: { type: String, default: 'Fresh' }, // Aquatic | Woody | Amber | Fresh | Oriental | Floral | Spicy

    size: { type: String, default: '50 ML' },
    stock: { type: Number, default: 100, min: 0 },
    lowStockThreshold: { type: Number, default: 15 },

    bottleImage: { type: String, default: '' },      // ← bottle photo (shop grid)
    descriptionImage: { type: String, default: '' }, // ← promo/story image (PDP)
    galleryImages: { type: [String], default: [] },

    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Storytelling fields (PDP sections)
    topNotes: { type: [String], default: [] },
    heartNotes: { type: [String], default: [] },
    baseNotes: { type: [String], default: [] },
    perfectFor: { type: [String], default: [] },
    fragranceCharacter: { type: String, default: '' },
    usage: { type: String, default: '' },
    story: { type: String, default: '' },
    longevity: { type: String, default: '' },
    sillage: { type: String, default: '' },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, gender: 1, fragranceType: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

productSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('Product', productSchema);
