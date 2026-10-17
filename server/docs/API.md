# REST API Reference

Base URL: `http://localhost:5000/api` · Format: JSON · Errors: `{ "message": "..." }` with a 4xx/5xx status.

**Auth:** protected routes need `Authorization: Bearer <accessToken>`. The refresh token is an httpOnly cookie (`/api/auth` path).

## Auth

| Method | Path | Access | Body / notes |
|---|---|---|---|
| POST | `/auth/register` | Public | `{ name, email, password (min 8) }` → `{ user, accessToken }` |
| POST | `/auth/login` | Public | `{ email, password }` → `{ user, accessToken }` |
| POST | `/auth/refresh` | Cookie | Rotates refresh cookie, returns new `accessToken` |
| POST | `/auth/logout` | Public | Clears refresh cookie |
| GET | `/auth/me` | User | Current user |
| GET | `/auth/wishlist` | User | Populated wishlist products |
| GET | `/auth/wishlist/ids` | User | `{ wishlist: [productId] }` |
| PUT | `/auth/wishlist/:productId` | User | Toggles; returns `{ wishlist, added }` |

## Products

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/products` | Public | Query: `q, family, gender, minPrice, maxPrice, featured, sort (new, price_asc, price_desc, rating), page, limit` → `{ items, page, pages, total }` |
| GET | `/products/:idOrSlug` | Public | Full product with reviews |
| POST | `/products` | Admin | See product body below |
| PUT | `/products/:id` | Admin | Same body; removed images are deleted from storage |
| DELETE | `/products/:id` | Admin | Also deletes images |
| POST | `/products/upload` | Admin | `multipart/form-data`, field `image` (max 5 MB) → `{ url, publicId }` |
| POST | `/products/:id/reviews` | User | `{ rating 1-5, comment? }` (one per user) |

Product body:
```json
{
  "name": "Noir Oud", "brand": "Atelier", "description": "...",
  "family": "Woody", "gender": "Unisex", "accent": "#7a3b12", "featured": true,
  "notes": { "top": "Saffron, Black pepper", "heart": "Oud", "base": "Amber" },
  "sizes": [{ "ml": 50, "price": 5200, "stock": 20 }],
  "images": [{ "url": "https://...", "publicId": "atelier/abc" }]
}
```
Families: `Woody, Floral, Oriental, Fresh, Citrus, Gourmand`.

## Orders

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/orders` | User | `{ items:[{product,size,qty}], shippingAddress, paymentMethod: "razorpay" or "cod", couponCode? }`. Prices are recalculated on the server; stock is reserved atomically (409 if insufficient) |
| POST | `/orders/coupon` | User | `{ code, subtotal }` → `{ code, percent, discount }` |
| GET | `/orders/mine` | User | Own orders, newest first |
| GET | `/orders/:id` | Owner/Admin | Single order |
| PUT | `/orders/:id/cancel` | Owner | Only while `pending` or `processing`; restocks items |
| GET | `/orders/admin/all` | Admin | Query: `status, page, limit` |
| PUT | `/orders/admin/:id/status` | Admin | `{ status }` (`pending, processing, shipped, delivered, cancelled`) |

Shipping: free when the amount after discount is ₹3,000 or more, otherwise ₹99.

## Payments

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/payment/create` | User | `{ orderId }` → Razorpay order details, or `{ demo: true }` if no keys |
| POST | `/payment/verify` | User | `{ orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }` (or `{ orderId, demo: true }` in demo mode). Verifies HMAC-SHA256 signature, marks order paid (idempotent) |
| POST | `/payment/webhook` | Razorpay | Raw body + `X-Razorpay-Signature`; confirms `payment.captured` / `order.paid` |

## Admin

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/stats` | Revenue, paid orders, average order, customers, products, 30-day sales series, status counts, top 5 products, low-stock sizes, 6 recent orders |
| GET | `/admin/customers` | Customers with order count and total spent |

## Other

`GET /health` → `{ ok: true }`

## Status codes

`400` validation · `401` not signed in/expired · `403` wrong role or not your resource · `404` not found · `409` duplicate or out of stock · `429` too many login attempts
