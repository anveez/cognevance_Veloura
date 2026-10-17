# Database Schema (MongoDB / Mongoose)

## Entity relationships

```
User 1 ───< Order >─── * Product (via embedded order items)
User * ───> * Product (wishlist)
Product 1 ───< Review (embedded)
Coupon (standalone)
```

## users
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| name | String | required |
| email | String | required, unique, lowercase |
| password | String | bcrypt hash (12 rounds), `select: false` |
| role | String | `customer` (default) or `admin`; never accepted from the client |
| wishlist | [ObjectId → Product] | |
| createdAt, updatedAt | Date | |

## products
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| slug | String | unique, generated from name |
| brand | String | default `Atelier` |
| description | String | |
| family | String | Woody, Floral, Oriental, Fresh, Citrus, Gourmand |
| gender | String | Unisex, Men, Women |
| notes | { top[], heart[], base[] } | scent pyramid |
| sizes | [{ ml, price, stock }] | at least one |
| minPrice | Number | indexed; computed from sizes on save, used for sorting/filtering |
| images | [{ url, publicId }] | Cloudinary or local |
| accent | String | hex colour for the illustrated bottle |
| featured | Boolean | shown on home page |
| rating, numReviews | Number | maintained when a review is added |
| reviews | [{ user, name, rating 1-5, comment, createdAt }] | embedded, one per user |

## orders
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → User | indexed |
| items | [{ product, name, slug, size, price, qty, image, accent }] | snapshot of price/name at purchase time |
| shippingAddress | { fullName, phone, line1, city, state, postalCode, country } | |
| paymentMethod | String | `razorpay` or `cod` |
| isPaid, paidAt | Boolean, Date | |
| paymentResult | { razorpayOrderId, razorpayPaymentId, demo } | |
| status | String | pending, processing, shipped, delivered, cancelled (indexed) |
| timeline | [{ status, at }] | status history |
| itemsPrice, shippingPrice, discount, totalPrice | Number | computed on the server |
| couponCode | String | |

## coupons
| Field | Type | Notes |
|---|---|---|
| code | String | unique, uppercase |
| percent | Number | 1 to 90 |
| minOrder | Number | minimum subtotal |
| active | Boolean | |

## Indexes
`users.email` (unique) · `products.slug` (unique) · `products.minPrice` · `orders.user` · `orders.status`
