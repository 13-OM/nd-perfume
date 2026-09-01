/**
 * Seed script — populates MongoDB (Atlas or local) with demo data.
 *
 *   npm run seed --prefix server
 *
 * It is idempotent: existing documents are updated, new ones created.
 * Also creates the first admin user from ADMIN_EMAIL / ADMIN_PASSWORD (.env).
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');
const FAQ = require('../models/FAQ');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const AdminUser = require('../models/AdminUser');
const User = require('../models/User');
const { products, faqs, categories, banners, coupons } = require('./seedData');

async function upsertBySlug(Model, key, items) {
  let created = 0, updated = 0;
  for (const item of items) {
    const existing = await Model.findOne({ [key]: item[key] });
    if (existing) {
      await Model.updateOne({ _id: existing._id }, { $set: item });
      updated++;
    } else {
      await Model.create(item);
      created++;
    }
  }
  return { created, updated };
}

async function seed() {
  await connectDB();

  const p = await upsertBySlug(Product, 'slug', products);
  const c = await upsertBySlug(Category, 'slug', categories);
  const f = await upsertBySlug(FAQ, 'question', faqs);
  const b = await upsertBySlug(Banner, 'title', banners);
  const cp = await upsertBySlug(Coupon, 'code', coupons);

  // Admin user
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ndperfume.in').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  let admin = await AdminUser.findOne({ email: adminEmail });
  if (admin) {
    admin.password = adminPassword;
    admin.fullName = admin.fullName || 'ND Admin';
    await admin.save();
  } else {
    admin = await AdminUser.create({ fullName: 'ND Admin', email: adminEmail, password: adminPassword });
  }

  // Demo customer (optional)
  let demoUser = await User.findOne({ email: 'demo@ndperfume.in' });
  if (!demoUser) {
    demoUser = await User.create({
      fullName: 'Demo Customer',
      email: 'demo@ndperfume.in',
      mobile: '9876543210',
      password: 'Demo@123',
    });
  }

  console.log(`✔ Products: ${p.created} created, ${p.updated} updated`);
  console.log(`✔ Categories: ${c.created} created, ${c.updated} updated`);
  console.log(`✔ FAQs: ${f.created} created, ${f.updated} updated`);
  console.log(`✔ Banners: ${b.created} created, ${b.updated} updated`);
  console.log(`✔ Coupons: ${cp.created} created, ${cp.updated} updated`);
  console.log(`✔ Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`✔ Demo customer: demo@ndperfume.in / Demo@123`);

  await mongoose.disconnect();
  console.log('✔ Seed complete.');
}

seed().catch((err) => {
  console.error('✖ Seed failed:', err.message);
  process.exit(1);
});
