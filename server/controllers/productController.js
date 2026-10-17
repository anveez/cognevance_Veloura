import { z } from 'zod';
import Product, { FAMILIES } from '../models/Product.js';
import { HttpError, asyncHandler } from '../utils/http.js';
import { storeImage, removeImage } from '../utils/upload.js';

const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(v);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const listProducts = asyncHandler(async (req, res) => {
  const { q, family, gender, minPrice, maxPrice, featured, sort = 'new' } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 60);

  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(String(q).slice(0, 60)), 'i');
    filter.$or = [{ name: rx }, { brand: rx }, { description: rx }, { 'notes.top': rx }, { 'notes.heart': rx }, { 'notes.base': rx }];
  }
  if (family && FAMILIES.includes(family)) filter.family = family;
  if (gender) filter.gender = gender;
  if (featured === 'true') filter.featured = true;
  if (minPrice || maxPrice) {
    filter.minPrice = {};
    if (minPrice) filter.minPrice.$gte = Number(minPrice);
    if (maxPrice) filter.minPrice.$lte = Number(maxPrice);
  }

  const sorts = {
    new: { createdAt: -1 },
    price_asc: { minPrice: 1 },
    price_desc: { minPrice: -1 },
    rating: { rating: -1, numReviews: -1 },
  };

  const [items, total] = await Promise.all([
    Product.find(filter).select('-reviews').sort(sorts[sort] || sorts.new).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ items, page, pages: Math.ceil(total / limit), total });
});

export const getProduct = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const product = isObjectId(idOrSlug)
    ? await Product.findById(idOrSlug)
    : await Product.findOne({ slug: idOrSlug });
  if (!product) throw new HttpError(404, 'Product not found');
  res.json(product);
});

const csv = z.preprocess(
  (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : v),
  z.array(z.string()).default([])
);

const productSchema = z.object({
  name: z.string().trim().min(2).max(80),
  brand: z.string().trim().max(60).optional(),
  description: z.string().max(3000).optional(),
  family: z.enum(FAMILIES),
  gender: z.enum(['Unisex', 'Men', 'Women']).optional(),
  notes: z.object({ top: csv, heart: csv, base: csv }).optional(),
  sizes: z.array(z.object({
    ml: z.coerce.number().positive(),
    price: z.coerce.number().min(0),
    stock: z.coerce.number().int().min(0),
  })).min(1, 'Add at least one size'),
  images: z.array(z.object({ url: z.string().url(), publicId: z.string().optional() })).optional(),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  featured: z.boolean().optional(),
});

export const createProduct = asyncHandler(async (req, res) => {
  const data = productSchema.parse(req.body);
  const product = await Product.create(data);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const data = productSchema.parse(req.body);
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  const removed = (product.images || []).filter((old) => !(data.images || []).some((n) => n.url === old.url));
  product.set(data);
  await product.save();
  removed.forEach((img) => removeImage(img.publicId));
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  await product.deleteOne();
  product.images.forEach((img) => removeImage(img.publicId));
  res.json({ message: 'Product deleted' });
});

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Choose an image to upload');
  res.status(201).json(await storeImage(req, req.file));
});

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().max(1000).optional(),
  }).parse(req.body);

  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  if (product.reviews.some((r) => r.user.toString() === req.user._id.toString())) {
    throw new HttpError(400, 'You have already reviewed this product');
  }
  product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
  product.numReviews = product.reviews.length;
  product.rating = Math.round((product.reviews.reduce((a, r) => a + r.rating, 0) / product.numReviews) * 10) / 10;
  await product.save();
  res.status(201).json(product);
});
