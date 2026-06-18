## Express.js Server Summary

Everything is configured and ready to run!

### Start the Backend

```bash
cd backend
npm install
npm start
```

Server will start on **http://localhost:5000**

#### Routes Available:
- `GET  /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET  /api/invoices` - Get invoices
- `POST /api/invoices` - Create invoice
- `PUT  /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET  /api/customers` - Get customers
- `POST /api/customers` - Add customer
- `POST /api/payments` - Record payment
- `GET  /api/reminders` - Get reminders

### WebSocket Events (Real-time)

- `join-business` - Join business room
- `invoice-created` - New invoice broadcast
- `invoice-updated` - Invoice update broadcast
- `invoice-deleted` - Invoice deletion broadcast

### Environment Variables

Set in `backend/.env`:
```
PORT=5000
JWT_SECRET=your_secret_here
DATABASE_URL=postgresql://user:pass@localhost:5432/payment_system
REDIS_URL=redis://localhost:6379
```

### Database Setup

1. Create PostgreSQL database
2. Run schema from `database/schema.sql`
3. Update DATABASE_URL in `.env`

### Testing API

Use curl or Postman:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","companyName":"My Co"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Get Invoices (use token from login)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/invoices
```

### Features Implemented

✅ JWT Authentication
✅ User Registration & Login
✅ Customer Management
✅ Invoice CRUD
✅ Payment Recording
✅ Reminder Tracking
✅ Real-time Socket.io Updates
✅ PostgreSQL Integration
✅ Error Handling
✅ CORS Enabled

Ready to deploy!
