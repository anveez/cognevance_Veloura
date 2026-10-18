# Atelier — Deployment Guide

## 1. Deployment Overview

Atelier is a MERN-stack perfume e-commerce application. The current deployment uses Vercel for the frontend and backend, with MongoDB for persistent data storage.

### Live URLs

- **Frontend:** [https://cognevance-veloura-rywd.vercel.app/](https://cognevance-veloura-rywd.vercel.app/)
- **Backend:** [https://cognevance-veloura.vercel.app/](https://cognevance-veloura.vercel.app/)
- **Health endpoint:** [https://cognevance-veloura.vercel.app/api/health](https://cognevance-veloura.vercel.app/api/health)
- **GitHub repository:** [https://github.com/anveez/cognevance_Veloura](https://github.com/anveez/cognevance_Veloura)

These URLs retain their existing names even though the application brand is Atelier.

## 2. MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Add a database user with a strong password.
3. Configure network access for your deployment.
4. Copy the MongoDB connection string and replace its placeholders.
5. Add the connection string to the backend environment variable `MONGO_URI`.
6. Run the seed script only when needed and after checking its behavior.

Example connection string format:

`mongodb+srv://<username>:<password>@<cluster-host>/atelier`

Do not commit database credentials to GitHub. Avoid unrestricted network access where narrower access rules are practical.

## 3. Backend Deployment on Vercel

The backend is deployed at:

[https://cognevance-veloura.vercel.app/](https://cognevance-veloura.vercel.app/)

The health endpoint is:

[https://cognevance-veloura.vercel.app/api/health](https://cognevance-veloura.vercel.app/api/health)

To update the backend:

1. Commit and push changes to GitHub.
2. Open the backend project in Vercel.
3. Confirm the correct project root and routing configuration.
4. Configure the environment variables required by the application.
5. Redeploy and inspect the deployment logs.

Potential environment variables include:

| Variable             | Purpose                              |
| -------------------- | ------------------------------------ |
| `NODE_ENV`           | Runtime environment                  |
| `MONGO_URI`          | MongoDB connection string            |
| `JWT_ACCESS_SECRET`  | Access-token signing secret          |
| `JWT_REFRESH_SECRET` | Refresh-token signing secret         |
| `CLIENT_URL`         | Allowed frontend origin              |
| `CLOUDINARY_*`       | Image hosting configuration, if used |
| `RAZORPAY_*`         | Payment configuration, if used       |

Use the exact variable names required by the application code. Keep secrets in Vercel environment settings, not in the source code.

## 4. Frontend Deployment on Vercel

The frontend is deployed at:

[https://cognevance-veloura-rywd.vercel.app/](https://cognevance-veloura-rywd.vercel.app/)

To update it:

1. Push the latest frontend changes to GitHub.
2. Open the frontend project in Vercel.
3. Confirm that the root directory is set to `client` if the frontend is deployed separately.
4. Set `VITE_API_URL` to the backend base URL expected by the existing API client.
5. Redeploy and test the website.

The current backend base URL is:

`https://cognevance-veloura.vercel.app`

Check the existing API client before changing `VITE_API_URL`; some configurations expect a base URL without `/api`, while others include it.

## 5. Frontend and Backend Connection

Verify the following after deployment:

- The frontend sends requests to the correct backend.
- Backend CORS settings allow the deployed frontend origin.
- Authentication and cookies work across the deployed domains.
- Both applications use HTTPS.
- The backend health endpoint responds successfully.

## 6. Razorpay Payments

Use Razorpay test credentials during development.

Verify that payment signatures are checked server-side and that the backend confirms payment before marking an order as paid.

Configure a Razorpay webhook only if the backend implements the corresponding webhook endpoint. Confirm the actual endpoint in the code before registering it in the Razorpay dashboard.

Never expose payment secret keys in frontend code or public documentation.

## 7. Deployment Testing Checklist

- [ ] Frontend loads successfully.
- [ ] Backend health endpoint responds.
- [ ] Product listing and product details work.
- [ ] Registration and login work.
- [ ] Wishlist operations work.
- [ ] Cart and order creation work.
- [ ] Coupon validation works.
- [ ] Payment verification works in test mode, if configured.
- [ ] Admin dashboard is restricted to authorized administrators.
- [ ] Product image uploads work, if configured.
- [ ] Environment variables are configured securely.
- [ ] Demo credentials are changed before production use.

## 8. Troubleshooting

**Frontend cannot reach the API**

- Verify `VITE_API_URL`.
- Check the browser console and network requests.
- Confirm that the backend is deployed and CORS allows the frontend origin.

**API returns an error**

- Review Vercel deployment logs.
- Check MongoDB connectivity and environment variables.
- Verify API routing configuration.

**Authentication fails**

- Check token handling, cookie settings, HTTPS, and CORS configuration.

**Image upload fails**

- Verify upload middleware and Cloudinary settings, if applicable.

**Payment verification fails**

- Check the Razorpay test credentials and server-side verification logic.

## 9. Security Notes

- Never commit `.env` files or private credentials.
- Use strong administrator passwords and random JWT secrets.
- Verify payment status on the backend.
- Validate order ownership and administrator permissions.
- Avoid exposing sensitive customer data.
