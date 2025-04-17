# 🛒 E-commerce Backend (MVP) – NestJS, Prisma

This is a backend MVP for an e-commerce application built using **NestJS**, **Prisma**, and **PostgreSQL**, following modern backend practices. It includes essential features like authentication, email verification, product and order management, role-based access, and image handling via Cloudinary.

---

## 🚀 Features Implemented

### ✅ User Authentication & Authorization
- Register with email verification (expires in 10 minutes).
- Login & Logout with JWT tokens (stored in HTTP-only cookies).
- Password reset via email.
- Role-based access (Admin vs User) with `@AdminOnly()` decorator.

### 🛍️ Product Management
- Admin can add, update, delete products.
- Supports product image upload to **Cloudinary**.
- Product metadata stored in PostgreSQL via **Prisma**.

### 📦 Orders
- Users can place and manage their orders.
- Admin can view and update all orders.
- Each order includes details like products, quantity, total price, etc.

### 🎁 Coupons / Discounts
- Admin can create coupon codes with amount/type and expiry.
- Users can apply coupon during checkout.

### 📊 Admin Dashboard
- Basic statistics like total users, total orders, revenue, etc.

---

## 🧱 Tech Stack

- **Backend Framework:** [NestJS](https://nestjs.com)
- **ORM:** [Prisma](https://www.prisma.io)
- **Database:** PostgreSQL
- **Email:** Nodemailer (for verification and password reset)
- **File Uploads:** Cloudinary
- **Authentication:** JWT (Access & Refresh Tokens)
- **Validation:** Class-validator, Pipes
- **Deployment:** Docker (planned)

---

✅ **Completed**
 - Auth system with email verification and password reset

 - Product CRUD with image upload to Cloudinary

 - User & Admin roles with protected routes

 - Order and checkout flow

 - Coupon creation and validation

 - Admin dashboard stats

🧩 **Next Steps**
 - Payment integration (e.g., Stripe)

 - Product filters, pagination

 - Reviews & ratings

 - Dockerize and deploy to cloud

 - Full frontend integration
