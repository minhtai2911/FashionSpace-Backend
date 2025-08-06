# FashionSpace-Backend

A RESTful API backend for the **FashionSpace** fashion e-commerce platform — fully supporting key operations such as user management, product categories, products, orders, reviews, shopping cart, online payments, and analytics. Integrated with Dialogflow chatbot and a personalized product recommendation system based on user behavior. Also includes sentiment analysis to help admins better understand customer satisfaction and feedback trends.

---

## Table of Contents

* [Introduction](#introduction)
* [Main Features](#main-features)
* [Tech Stack](#tech-stack)
* [Setup & Run](#setup--run)
* [API Documentation (Swagger)](#api-documentation-swagger)

---

## Introduction

**FashionSpace‑Backend** is a RESTful API system that powers the backend of the FashionSpace e-commerce platform. The project aims to:

* Support three main user roles: **Admin**, **Customer**, and **Staff** (for order and review management).
* Enable full functionality from managing products, categories, orders, reviews, carts, payments to revenue analytics.
* Provide well-documented and testable APIs via Swagger UI.

---

## Main Features

### Customer

* Register/Login, forgot password, change password, update profile.
* Browse product listings, search by name or category, filter by rating and price.
* Manage shopping cart, create and track orders.
* Submit product reviews.
* Get assistance via chatbot (Dialogflow).

### Administrator (Admin)

* Create, update, archive products and categories.
* Manage all users on the system.
* View and analyze revenue statistics by time.

### Staff

* Manage customer orders.
* Review and moderate customer feedback.

---

## Tech Stack

* **Node.js** + **Express.js** — Build the RESTful API.
* **MongoDB** + **Mongoose** — NoSQL database for data storage.
* **JWT (JSON Web Token)** + **OAuth2** — Authentication & authorization.
* **Dialogflow** — AI chatbot integration for customer interaction.
* **Tensorflow** — Personalized product recommendation system.
* **Hugging Face** — Sentiment analysis of customer reviews.
* **Redis** — Data caching for performance.
* **Swagger UI** — API documentation and testing.
* **Dotenv** — Manage environment variables.
* **Multer & Cloudinary** — Image upload and cloud storage.

---

## Setup & Run

### 1. Clone the repository:

```bash
git clone https://github.com/minhtai2911/FashionSpace-Backend.git
cd FashionSpace-Backend
```

### 2. Install dependencies:

```bash
npm install
```

### 3. Create the .env file from the example:

```bash
cp .env.example .env
```

> Fill in required values such as: `PORT`, `DB_URL`, `ACCESS_TOKEN_SECRET`, `CLOUDINARY_API_KEY`,...

### 4. Start the server:

```bash
npm run dev          # chế độ development
npm run production   # chế độ production
```

---

## API Documentation (Swagger)

* Access it at: `https://fashionspace-api.onrender.com/api-docs/`
* Clean and well-organized API grouped by features.
