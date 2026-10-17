import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    slug: String,
    size: Number,
    price: Number,
    qty: Number,
    image: String,
    accent: String,
  },
  { _id: false }
);

export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [itemSchema],
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' },
    },
    paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    paymentResult: { razorpayOrderId: String, razorpayPaymentId: String, demo: Boolean },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    timeline: [{ status: String, at: { type: Date, default: Date.now }, _id: false }],
    itemsPrice: Number,
    shippingPrice: Number,
    discount: { type: Number, default: 0 },
    couponCode: String,
    totalPrice: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
