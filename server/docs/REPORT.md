# Atelier — Perfume E-Commerce Platform
## Project Report

### 1. Abstract

Atelier is a full-stack perfume e-commerce web application developed using the MERN stack. It provides an online platform where customers can explore perfumes, view product details, manage wishlists, and place orders. The application includes backend REST APIs, database integration, authentication, payment integration, and administrative functionality.

The project aims to provide a convenient and engaging online shopping experience while giving administrators tools to manage products and orders.

### 2. Introduction

E-commerce platforms allow customers to discover and purchase products online. Atelier focuses on perfume shopping by organizing products according to fragrance families, scent notes, sizes, and prices.

The application follows a client-server architecture. The React frontend communicates with a Node.js and Express backend, while MongoDB stores application data.

### 3. Objectives

- Develop a full-stack perfume e-commerce application.
- Provide product browsing and detailed product information.
- Implement user registration and login.
- Support wishlists and order management.
- Integrate coupon validation and payment functionality.
- Provide administrative tools for managing products and orders.
- Deploy the application and document its APIs and database structure.

### 4. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript/TypeScript as used in the project |
| Styling | Tailwind CSS and project CSS |
| Backend | Node.js and Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT-based authentication |
| Password security | bcryptjs |
| Payments | Razorpay integration, where configured |
| Image hosting | Cloudinary, where configured |
| Deployment | Vercel |
| Version control | Git and GitHub |

### 5. System Architecture

The application uses a client-server architecture.

1. **Frontend:** Displays the storefront, product information, customer account features, and administrative interface.
2. **Backend:** Exposes REST API endpoints, validates requests, applies authentication and authorization, and handles application logic.
3. **Database:** Stores users, products, orders, and coupons.
4. **External services:** MongoDB Atlas, Razorpay, and Cloudinary are used where configured.

### 6. Main Modules

#### 6.1 Authentication Module

Supports customer registration, login, logout, and authenticated account operations. Passwords are hashed before storage. Protected routes require authentication, and administrator operations require the appropriate role.

#### 6.2 Product Module

Manages perfume information, including product name, description, fragrance family, scent notes, available sizes, prices, stock, and images. Product listing and individual product retrieval are supported.

#### 6.3 Wishlist Module

Allows authenticated customers to manage their saved products.

#### 6.4 Order Module

Handles order creation, customer order history, order details, cancellation, coupon validation, and order status updates. Access to order operations should be restricted according to user ownership and administrator permissions.

#### 6.5 Payment Module

Includes backend endpoints for creating payments and verifying payment results. Razorpay test mode should be used during development, and payment verification must be performed on the backend.

#### 6.6 Administration Module

Provides protected endpoints for administrative statistics and customer information. Product management and order status management are also supported through the relevant protected APIs.

### 7. Database Design

The application uses MongoDB collections represented by Mongoose models.

- **User:** Stores name, email, hashed password, role, and wishlist references.
- **Product:** Stores perfume details, fragrance family, notes, sizes, prices, images, stock, and reviews.
- **Order:** Stores customer reference, ordered items, shipping address, payment details, pricing, and order status.
- **Coupon:** Stores coupon code, discount percentage, minimum order value, and active status.

The models use timestamps to record creation and update times.

### 8. Security Considerations

The application includes several security-related mechanisms:

- Password hashing using bcryptjs.
- Authentication middleware for protected routes.
- Role-based authorization for administrator operations.
- Rate limiting on registration and login endpoints.
- Server-side payment verification.
- Environment variables for sensitive configuration.
- CORS configuration for permitted frontend origins.

Security should be tested before the application is used in production.

### 9. Deployment

The application is deployed using Vercel, with MongoDB used for data storage.

- **Frontend:** https://cognevance-veloura-rywd.vercel.app/
- **Backend:** https://cognevance-veloura.vercel.app/
- **API health endpoint:** https://cognevance-veloura.vercel.app/api/health
- **GitHub repository:** https://github.com/anveez/cognevance_Veloura

The deployment guide contains configuration details and post-deployment checks.

### 10. Testing

The following tests should be performed and recorded based on actual results:

- Verify that the frontend loads correctly.
- Verify that the backend health endpoint responds.
- Test product listing and product details.
- Test customer registration and login.
- Test wishlist operations.
- Test order creation and order history.
- Test coupon validation.
- Test payment creation and verification using test credentials, if configured.
- Confirm that administrator endpoints reject unauthorized users.
- Check image uploads if image hosting is configured.

Only tests that have actually been performed successfully should be marked as passed.

### 11. Limitations

- Payment processing depends on valid payment-provider configuration.
- Image uploads depend on the configured image-hosting service.
- Production readiness requires additional security, reliability, and performance testing.
- External service availability may affect some application features.

### 12. Future Enhancements

Possible improvements include advanced perfume recommendations, more detailed analytics, enhanced product search, additional payment options, automated notifications, improved accessibility, and performance optimization.

### 13. Conclusion

Atelier demonstrates the development and deployment of a full-stack e-commerce application using the MERN stack. It combines a React-based user interface, REST APIs, MongoDB data storage, authentication, product management, order processing, and administrative functionality. The project also provides documentation for its API, database design, deployment, and testing.

### 14. Supporting Documentation

- `API.md` — REST API documentation.
- `DATABASE.md` — Database schema documentation.
- `DEPLOYMENT.md` — Deployment and configuration guide.
- `REPORT.md` — Project report.
