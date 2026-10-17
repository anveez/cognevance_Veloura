# Deployment Guide (free tiers)

Order: **database → API → frontend → connect them.**

## 1. MongoDB Atlas
1. Create a free M0 cluster at mongodb.com/atlas.
2. Database Access → add a user with a strong password.
3. Network Access → allow `0.0.0.0/0` (or your host's IPs).
4. Connect → Drivers → copy the connection string, replace `<password>`, and add the database name: `mongodb+srv://user:pass@cluster.mongodb.net/atelier`.
5. Seed it once from your computer: set that `MONGO_URI` in `server/.env`, then run `npm run seed`. Set `ADMIN_PASSWORD` to something strong before seeding, and change the demo customer password.

## 2. API on Render (or Railway)
1. Push the project to GitHub.
2. Render → New → Web Service → pick the repo, set **Root Directory** to `server`.
3. Build command `npm install`, start command `npm start`.
4. Environment variables:

| Variable | Value |
|---|---|
| NODE_ENV | production |
| MONGO_URI | your Atlas string |
| JWT_ACCESS_SECRET / JWT_REFRESH_SECRET | long random strings |
| CLIENT_URL | your frontend URL (set after step 3), e.g. `https://atelier.vercel.app` |
| CLOUDINARY_* | your Cloudinary values (recommended: Render's disk is not permanent, so local uploads would be lost) |
| RAZORPAY_* | your keys (use test keys first) |

5. Note the URL, e.g. `https://atelier-api.onrender.com`. Check `/api/health`.

## 3. Frontend on Vercel (or Netlify)
1. Vercel → New Project → same repo, **Root Directory** `client`. Framework: Vite.
2. Environment variable: `VITE_API_URL` = `https://atelier-api.onrender.com` (no trailing slash, no `/api`).
3. `client/vercel.json` (included) makes page refreshes work with React Router. For Netlify, `client/public/_redirects` (included) does the same.

## 4. Connect them
Set `CLIENT_URL` on the API to the final Vercel URL (comma-separate multiple origins) and redeploy. Cookies use `SameSite=None; Secure` in production, so both sites must use HTTPS (the free hosts do).

## 5. Razorpay webhook
Dashboard → Webhooks → URL `https://atelier-api.onrender.com/api/payment/webhook`, event `payment.captured`, secret = `RAZORPAY_WEBHOOK_SECRET`.

## Checklist
- [ ] Admin password changed
- [ ] Secrets are random and not in Git (`.env` is git-ignored)
- [ ] Test order with Razorpay test card
- [ ] Image upload works (Cloudinary)
- [ ] Lighthouse run on the live site (aim for 90+)

Free Render services sleep after inactivity, so the first request can take about 30 seconds.

## Performance already built in
Route-level code splitting, lazy admin/chart bundles, gzip on the API, long-cache static uploads, indexed queries. To go further, add `f_auto,q_auto` to Cloudinary URLs and a Redis cache for `/products`.
