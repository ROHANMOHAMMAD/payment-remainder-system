# Smart Payment Reminder System - Setup Guide

## Quick Start (Development Mode)

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Setup Backend

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Update .env with your database credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/payment_system

# 5. Run the backend server
npm start
```

Backend will run on `http://localhost:5000`

### Setup Frontend

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Open index.html in browser
# or run a simple HTTP server:
python -m http.server 3000
# or
npx http-server -p 3000
```

Frontend will run on `http://localhost:3000`

### Database Setup

```bash
# 1. Connect to PostgreSQL
psql -U postgres -h localhost

# 2. Create database
CREATE DATABASE payment_system;

# 3. Run schema
\connect payment_system
\i database/schema.sql
```

## Docker Setup (Production)

```bash
# 1. Build and start all services
docker-compose up -d

# 2. Check services
docker ps

# 3. Access:
#    Frontend: http://localhost:3000
#    Backend: http://localhost:5000
#    Database: localhost:5432
#    Redis: localhost:6379
```

## Default Login

Create an account or use:
- **Email:** admin@example.com
- **Password:** admin123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer

### Payments
- `POST /api/payments` - Record payment

### Reminders
- `GET /api/reminders` - Get reminders

## Features

✓ User authentication (JWT)
✓ Customer management
✓ Invoice creation & tracking
✓ Real-time updates (Socket.io)
✓ Payment tracking
✓ Automated reminders (configurable)
✓ Dark theme UI
✓ Responsive design
✓ PostgreSQL database
✓ Redis caching

## Project Structure

```
project/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── invoices.js
│   │   ├── customers.js
│   │   ├── payments.js
│   │   └── reminders.js
│   ├── middleware/
│   │   └── auth.js
│   ├── index.js
│   ├── db.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   └── index.html
├── database/
│   └── schema.sql
├── docker-compose.yml
├── README.md
└── er-diagram.html
```

## Next Steps

1. Configure WhatsApp integration for SMS reminders
2. Integrate Razorpay for payment processing
3. Set up email notifications
4. Add automated reminder scheduling
5. Deploy to production (AWS, Azure, Heroku)

## Support

For issues or questions, refer to the API documentation or README.md
