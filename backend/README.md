# AssetFlow ERP — Backend API Service

Production-ready backend API service for **AssetFlow – Enterprise Asset & Resource Management System** implemented in Express.js, TypeScript, and Prisma.

## 🚀 Key Features
- **12 Functional Modules**: Auth, Departments, Employees, Locations, Categories, Assets, Allocations, Bookings, Maintenance, Audits, Notifications, Activity Logs.
- **Strict Role-Based Security**: Handled via Express middlewares mapped to user roles (Admin, Asset Manager, Department Head, Employee, Auditor, Technician).
- **Overlapping Bookings Prevention**: GiST exclusion checks at the database layer (PostgreSQL) and validation at the API layer.
- **Double Allocations Protection**: Handled using partial unique index constraints in the database.
- **Real-time Updates**: Real-time push notifications, dashboard KPI changes, and booking alerts using Socket.io (with JWT authentication).
- **Interactive Documentation**: Swagger UI docs generated from annotations.
- **Custom Error Handling**: Automatic mapping of DB engine error codes (Prisma Client errors) to semantic HTTP exceptions.

---

## 🛠️ Tech Stack
- **Runtime & Language**: Node.js & TypeScript
- **Framework**: Express.js
- **Database client**: Prisma ORM (mapped to PostgreSQL 15+)
- **Validation**: Zod
- **Real-time Sockets**: Socket.io
- **Logs**: Winston Logger
- **Security**: Helmet, CORS, Cookie-parser, Express-rate-limit

---

## ⚙️ Setup and Installation

### 1. Prerequisite
Ensure you have **Node.js >= 18.0.0** and **PostgreSQL 15+** installed.

### 2. Configure Environment variables
Copy the template `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```
Ensure you update `DATABASE_URL` with your actual credentials:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/assetflow?schema=public"
JWT_SECRET="supersecretkeyassetflow"
JWT_REFRESH_SECRET="supersecretrefreshkeyassetflow"
```

### 3. Initialize Sockets & DB Migrations
Ensure the PostgreSQL extensions are enabled and schema constraints exist:
```bash
# Install packages
npm install

# Build Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate dev --name init

# Create manual SQL schemas for GiST and partial indexes
npx prisma migrate dev --create-only --name add_constraints
# Paste contents from prisma/sql/manual_constraints.sql into the generated file.

# Create database reporting views
npx prisma migrate dev --create-only --name create_views
# Paste contents from prisma/sql/reporting_views.sql into the generated file.

# Deploy migration
npx prisma migrate dev

# Seed defaults (6 roles and 1 system admin)
npx prisma db seed
```

### 4. Running the application
```bash
# Development mode (nodemon auto-reload)
npm run dev

# Build production distribution
npm run build

# Start production server
npm run start
```

---

## 📖 API Documentation
Once the server starts running, open your web browser and navigate to:
```
http://localhost:5000/api/docs
```
This serves the interactive Swagger specification where you can test all API endpoints.

---

## 📁 Sockets Events Reference

- `notification:new` (channel for real-time notifications by user ID / role)
- `booking:created` (broadcast to alert users of new resource bookings)
- `booking:cancelled` (broadcast to alert users of schedule cancellations)
- `maintenance:assigned` (direct alert to technician)
- `dashboard:kpi_update` (broadcast dashboard aggregate recalculations)
