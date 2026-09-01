const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // Men | Women | Unisex | Aquatic | Woody ...
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: { type: String, enum: ['gender', 'fragrance'], default: 'fragrance' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
