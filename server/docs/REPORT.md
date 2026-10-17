# Project Report: Atelier E-Commerce Platform

Fill in the brackets, add screenshots, and export to Word or PDF.

## 1. Introduction
**Problem:** [Small brands need an online store with secure payments and simple management.]
**Objective:** Build a full-stack e-commerce platform with authentication, product and order management, payments, image storage, analytics and deployment.
**Scope:** [Single-vendor perfume store; customers and one admin role.]

## 2. Technology stack
MongoDB, Express, React (Vite), Node.js · Tailwind CSS, Framer Motion, Recharts, Zustand · JWT, bcrypt, Zod · Razorpay · Cloudinary · MongoDB Atlas, Render, Vercel.

## 3. System architecture
[Insert diagram: Browser (React) → REST API (Express) → MongoDB Atlas; API → Razorpay, Cloudinary; Razorpay → webhook → API.]

## 4. Database design
See `DATABASE.md`. [Insert ER diagram.]

## 5. Module description
1. **Authentication and authorization:** JWT access + refresh tokens, bcrypt hashing, role middleware.
2. **Product management:** CRUD APIs, filters, search, admin panel.
3. **Cart and orders:** persistent cart, server-side pricing, atomic stock reservation, cancellation with restock.
4. **Payments:** Razorpay order creation, HMAC signature verification, webhook, COD.
5. **Frontend:** responsive React UI, hero, scent finder, instant search.
6. **Image uploads:** multer + Cloudinary.
7. **Analytics:** MongoDB aggregations feeding dashboard charts.
8. **Deployment:** Atlas, Render, Vercel.

## 6. API documentation
See `API.md`.

## 7. Security measures
Password hashing, short-lived access tokens, httpOnly refresh cookie, role checks on every admin route, input validation, rate limiting, Helmet headers, CORS allow-list, server-side price calculation, payment signature verification, upload type and size limits.

## 8. Testing
[List what you tested: registration/login, role access, checkout with test card, COD, cancel and restock, upload, admin status update. Add a table of test cases with expected and actual results.]

## 9. Screenshots
[Home, shop, product, cart, checkout, orders, admin dashboard, admin products, admin orders.]

## 10. Challenges and solutions
[Example: preventing overselling → atomic `$elemMatch` stock decrement with rollback. Example: confirming payments when the user closes the tab → webhook.]

## 11. Deployment links
Frontend: [URL] · API: [URL] · GitHub: [URL]

## 12. Conclusion and future scope
[Summary.] Future: order emails, invoices, 3D product viewer, AI scent concierge, multi-vendor support, reviews with photos.
