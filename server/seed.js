import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Coupon from './models/Coupon.js';

const sizes = (a, b, c) => [
  { ml: 30, price: a, stock: 25 },
  { ml: 50, price: b, stock: 20 },
  { ml: 100, price: c, stock: 12 },
];

const products = [
  {
    name: 'Noir Oud', family: 'Woody', gender: 'Unisex', accent: '#7a3b12', featured: true,
    description: 'Smoked agarwood opens against a cold pinch of saffron, then settles into a long, resinous amber. Made for evenings that run late.',
    notes: { top: ['Saffron', 'Black pepper'], heart: ['Oud', 'Leather'], base: ['Amber', 'Patchouli'] }, sizes: sizes(3200, 5200, 8800),
  },
  {
    name: 'Amber Saffron', family: 'Oriental', gender: 'Unisex', accent: '#c47a1c', featured: true,
    description: 'Warm resin and spice wrapped around a glowing amber heart. Rich without being heavy.',
    notes: { top: ['Saffron', 'Cardamom'], heart: ['Amber', 'Rose'], base: ['Benzoin', 'Vanilla'] }, sizes: sizes(2900, 4800, 8200),
  },
  {
    name: 'Velvet Iris', family: 'Floral', gender: 'Women', accent: '#8a6fa8', featured: true,
    description: 'Powdery iris root with a soft suede finish. Quiet, close to the skin, hard to forget.',
    notes: { top: ['Bergamot', 'Pink pepper'], heart: ['Iris', 'Violet'], base: ['Suede', 'Musk'] }, sizes: sizes(2700, 4400, 7600),
  },
  {
    name: 'Cedar & Smoke', family: 'Woody', gender: 'Men', accent: '#4d5b3c', featured: true,
    description: 'Fresh-cut cedar and a thread of campfire smoke over dry vetiver.',
    notes: { top: ['Juniper', 'Lemon'], heart: ['Cedar', 'Incense'], base: ['Vetiver', 'Tonka'] }, sizes: sizes(2600, 4200, 7400),
  },
  {
    name: 'Midnight Jasmine', family: 'Floral', gender: 'Women', accent: '#2f3b5c',
    description: 'Night-blooming jasmine with a dark, almost inky green edge.',
    notes: { top: ['Mandarin', 'Green tea'], heart: ['Jasmine', 'Tuberose'], base: ['Sandalwood', 'Musk'] }, sizes: sizes(2800, 4600, 7900),
  },
  {
    name: 'Citrus Aurora', family: 'Citrus', gender: 'Unisex', accent: '#d9a21b',
    description: 'Sun on peel. Bright bergamot and grapefruit lifted by a clean, mineral musk.',
    notes: { top: ['Bergamot', 'Grapefruit'], heart: ['Neroli', 'Petitgrain'], base: ['White musk', 'Cedar'] }, sizes: sizes(2200, 3600, 6200),
  },
  {
    name: 'Rose Absolu', family: 'Floral', gender: 'Unisex', accent: '#9b2f45',
    description: 'Damask rose, deepened with raspberry and a dry, peppery oud shadow.',
    notes: { top: ['Raspberry', 'Pink pepper'], heart: ['Damask rose', 'Geranium'], base: ['Oud', 'Cashmere wood'] }, sizes: sizes(3000, 5000, 8500),
  },
  {
    name: 'Vanilla Ember', family: 'Gourmand', gender: 'Unisex', accent: '#a65a2a',
    description: 'Charred vanilla bean, toasted almond and a smoulder of tobacco leaf.',
    notes: { top: ['Almond', 'Cinnamon'], heart: ['Tobacco', 'Cacao'], base: ['Vanilla', 'Tonka'] }, sizes: sizes(2500, 4100, 7000),
  },
  {
    name: 'Sea Salt Linen', family: 'Fresh', gender: 'Unisex', accent: '#5b8fa3',
    description: 'Clean cotton, sea spray and driftwood. The smell of a window left open.',
    notes: { top: ['Sea salt', 'Lemon'], heart: ['Sage', 'Lily'], base: ['Driftwood', 'Musk'] }, sizes: sizes(2100, 3500, 6000),
  },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([Product.deleteMany({}), Order.deleteMany({}), Coupon.deleteMany({})]);
  for (const p of products) await Product.create(p);
  await Coupon.create({ code: 'WELCOME10', percent: 10, minOrder: 1000 });

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@atelier.com').toLowerCase();
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({ name: 'Store Admin', email: adminEmail, password: process.env.ADMIN_PASSWORD || 'Admin@12345', role: 'admin' });
  }
  if (!(await User.findOne({ email: 'customer@atelier.com' }))) {
    await User.create({ name: 'Demo Customer', email: 'customer@atelier.com', password: 'Customer@123', role: 'customer' });
  }
  console.log(`Seeded ${products.length} products, coupon WELCOME10, admin ${adminEmail}, customer customer@atelier.com`);
  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });
