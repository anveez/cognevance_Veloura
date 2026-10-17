# Atelier: Full-Scale MERN E-Commerce Platform

A luxury perfume store with a customer storefront, payments, image uploads and an admin dashboard.

**Stack:** MongoDB · Express · React (Vite) · Node.js, Tailwind CSS, Framer Motion, Recharts, Zustand, Razorpay, Cloudinary.

## What is included

| Area | Features |
|---|---|
| Auth | Register/login, JWT access token (15 min) + rotating refresh token in an httpOnly cookie, role-based access (`customer`, `admin`), rate-limited login |
| Storefront | **Cinematic 3D scroll story on the home page** (Three.js: camera dives into the perfume, flies through rose petals and oud, bursts out as the cap lifts),  shop with filters/sort/pagination, product page with scent notes and reviews, wishlist, Ctrl+K instant search, **Scent Finder quiz** |
| Cart and orders | Persistent bag, free-shipping progress bar, coupons, server-side pricing, atomic stock reservation, order tracking, cancel with automatic restock |
| Payments | Razorpay (signature verification + webhook), cash on delivery, and a **demo mode** that works with no keys |
| Images | Admin uploads go to Cloudinary, or to `server/uploads` if Cloudinary is not configured |
| Admin | Dashboard (revenue chart, best sellers, status breakdown, low stock), product CRUD with photos, order management with status updates, customer list |
| Quality | Zod validation, Helmet, CORS allow-list, gzip, code-splitting, accessible (keyboard, skip link, reduced-motion) |

## Quick start

You need **Node 18+** and a MongoDB database (local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

```bash
# 1. Backend
cd server
cp .env.example .env        # then edit MONGO_URI and the two JWT secrets
npm install
npm run seed                # creates 9 perfumes, a coupon, an admin and a demo customer
npm run dev                 # API on http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                 # Store on http://localhost:5173
```

Generate strong secrets with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

**Demo logins (after seeding)**

| Role | Email | Password |
|---|---|---|
| Admin | admin@atelier.com | Admin@12345 |
| Customer | customer@atelier.com | Customer@123 |

Coupon: `WELCOME10` (10% off orders above ₹1,000). Change the admin password before deploying.

## Project structure

```
atelier/
├── server/
│   ├── config/        db connection
│   ├── models/        User, Product, Order, Coupon
│   ├── controllers/   auth, product, order, payment, admin
│   ├── routes/        route definitions
│   ├── middleware/    auth (protect/authorize), error handler
│   ├── utils/         tokens, upload (Cloudinary/local), pricing, helpers
│   ├── docs/          API.md, DATABASE.md, DEPLOYMENT.md, REPORT.md
│   ├── seed.js        sample data
│   └── server.js
└── client/
    └── src/
        ├── api/         axios client with silent token refresh
        ├── store/       auth, cart, wishlist, toast (Zustand)
        ├── components/  Navbar, Hero, Bottle, ScentFinder, CartDrawer, ...
        ├── pages/       Home, Shop, Product, Checkout, Orders, Auth, ...
        └── admin/       Dashboard, products, orders, customers
```

## Turning on real payments and cloud images

1. **Razorpay:** create a test account at razorpay.com, copy the Key ID and Secret into `server/.env`. For webhooks, add `https://YOUR-API/api/payment/webhook` in the Razorpay dashboard (event `payment.captured`) and put the secret in `RAZORPAY_WEBHOOK_SECRET`. Test card: `4111 1111 1111 1111`, any future date, any CVV.
2. **Cloudinary:** create a free account and fill the three `CLOUDINARY_*` values.

Restart the server after editing `.env`. With the keys empty, checkout runs in demo mode and uploads are saved locally.

## Documentation

- [API reference](server/docs/API.md)
- [Database schema](server/docs/DATABASE.md)
- [Deployment guide](server/docs/DEPLOYMENT.md)
- [Project report template](server/docs/REPORT.md)

## Using your own photos

Bottles are drawn as SVG so the project has no copyrighted images. In **Admin → Products**, upload real photos; the first photo replaces the illustrated bottle everywhere.

## The cinematic home page

The story lives in `client/src/components/CinematicStory.jsx`. The camera path is the `K` array at the top (progress, camera position, look target, fog, colour), and the on-screen words are the `cine-chap` blocks at the bottom. Change the copy, colours or bottle names there. It loads as a separate chunk, respects reduced-motion, and falls back to the simple hero if the device has no WebGL. For photoreal footage like the reference video, generate clips with an AI video tool and scrub them with scroll in place of the Three.js scene.

## Ideas to extend it

a real bottle model (.glb) in the 3D scene, order emails (Resend/Nodemailer), invoice PDFs, Redis caching, and a Claude-powered scent concierge that calls your product API from the server.
