import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

const sizeSchema = new mongoose.Schema(
  {
    ml: { type: Number, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

export const FAMILIES = ['Woody', 'Floral', 'Oriental', 'Fresh', 'Citrus', 'Gourmand'];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    brand: { type: String, default: 'Atelier' },
    description: { type: String, default: '' },
    family: { type: String, enum: FAMILIES, required: true },
    gender: { type: String, enum: ['Unisex', 'Men', 'Women'], default: 'Unisex' },
    notes: {
      top: [String],
      heart: [String],
      base: [String],
    },
    sizes: { type: [sizeSchema], validate: (v) => v.length > 0 },
    minPrice: { type: Number, index: true },
    images: [{ url: String, publicId: String }],
    accent: { type: String, default: '#c9a227' },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

productSchema.pre('validate', function (next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});

productSchema.pre('save', function (next) {
  if (this.sizes?.length) this.minPrice = Math.min(...this.sizes.map((s) => s.price));
  next();
});

export default mongoose.model('Product', productSchema);
