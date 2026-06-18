# Smart Payment Reminder System

A complete, production-ready payment reminder and invoice management system built with modern technologies.

## 🎯 Features

✅ **User Authentication** - JWT-based secure authentication  
✅ **Customer Management** - Add and manage customers  
✅ **Invoice Tracking** - Create, update, and track invoices  
✅ **Real-time Updates** - Socket.io for live data updates  
✅ **Payment Recording** - Track payments and payment methods  
✅ **Reminder System** - Automated payment reminders  
✅ **Dark Theme UI** - Modern, responsive interface  
✅ **PostgreSQL Database** - Reliable data persistence  
✅ **Redis Caching** - High-performance caching layer  
✅ **Docker Support** - Easy deployment with Docker

## 🚀 Quick Start

### Option 1: Docker (Recommended)

**Prerequisites:** Docker & Docker Compose installed

```bash
# Clone/Download project and navigate to root
cd /path/to/project

# Start all services
docker-compose up -d

# Wait 30 seconds for database initialization, then access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/health

# View logs
docker-compose logs -f
```

### Option 2: Local Development

**Prerequisites:** 
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

```bash
# Terminal 1 - Database (if running locally)
psql -U postgres
CREATE DATABASE payment_system;
\connect payment_system
\i database/schema.sql

# Terminal 2 - Backend
cd backend
npm install
npm start
# Backend runs on http://localhost:5000

# Terminal 3 - Frontend
cd frontend
npm install
npm start
# Frontend runs on http://localhost:3000
```

## 📝 Default Credentials

When you first access the application, create a new account or use:

- **Email:** admin@example.com
- **Password:** admin123

## 📂 Project Structure

```
payment-reminder-system/
├── backend/
│   ├── routes/              # API routes
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── invoices.js     # Invoice management
│   │   ├── customers.js    # Customer management
│   │   ├── payments.js     # Payment recording
│   │   └── reminders.js    # Reminder logs
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── index.js            # Server entry point
│   ├── db.js               # Database connection
│   ├── package.json
│   ├── .env                # Configuration
│   └── Dockerfile
├── frontend/
│   ├── index.html          # Frontend single-page app
│   └── package.json
├── database/
│   └── schema.sql          # Database schema
├── docker-compose.yml      # Docker configuration
├── README.md               # This file
├── SETUP.md                # Detailed setup guide
└── package.json            # Root package.json
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register           Register new user
POST   /api/auth/login              Login user
```

### Invoices
```
GET    /api/invoices                Get all invoices
POST   /api/invoices                Create new invoice
PUT    /api/invoices/:id            Update invoice
DELETE /api/invoices/:id            Delete invoice
```

### Customers
```
GET    /api/customers               Get all customers
POST   /api/customers               Create new customer
```

### Payments
```
POST   /api/payments                Record payment
```

### Reminders
```
GET    /api/reminders               Get reminder logs
```

## 🔐 Environment Variables

**Backend (.env or docker-compose.yml):**
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/payment_system
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d
FRONTEND_URL=http://localhost:3000
WHATSAPP_TOKEN=your_whatsapp_token
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
```

## 🛠️ Available Scripts

From root directory:

```bash
npm install-all              # Install all dependencies
npm run dev                  # Run backend + frontend together
npm run docker-up           # Start Docker services
npm run docker-down         # Stop Docker services
npm run docker-logs         # View Docker logs

# Or from specific directories:
cd backend && npm start      # Backend only
cd frontend && npm start     # Frontend only
```

## 🗄️ Database

**Technology:** PostgreSQL 15

**Tables:**
- `BUSINESSES` - Company information
- `USERS` - User accounts and authentication
- `CUSTOMERS` - Customer information
- `INVOICES` - Invoice records
- `PAYMENTS` - Payment transactions
- `REMINDER_LOGS` - Reminder history
- `AUDIT_LOGS` - System audit trail
- `NOTIFICATION_TEMPLATES` - Reminder templates

## 📊 Dashboard Features

- **KPI Cards** - Total invoices, amount due, reminders sent, customer count
- **Invoice Management** - View, create, update, delete invoices
- **Customer Directory** - Manage customer information
- **Real-time Updates** - Live data synchronization
- **Status Tracking** - Pending, paid, overdue, partial payment status

## 🔄 Real-time Features

Uses Socket.io for real-time updates:
- Invoice creation/updates broadcast to connected clients
- Real-time reminder notifications
- Live dashboard updates

## 🚢 Deployment

### Docker (Recommended)
```bash
docker-compose up -d
```

### Cloud Platforms

**AWS:**
```bash
# Deploy with AWS ECS, RDS for PostgreSQL, ElastiCache for Redis
```

**Azure:**
```bash
# Deploy with Container Instances, Azure Database for PostgreSQL
```

**Heroku:**
```bash
heroku login
heroku create your-app-name
git push heroku main
```

## 🧪 Testing

API endpoints can be tested using:
- Postman (import API collection)
- curl/httpie from terminal
- Built-in Frontend UI

## 📝 License

MIT License - Feel free to use for personal and commercial projects

## 🤝 Support

For issues, questions, or contributions:
1. Check [SETUP.md](SETUP.md) for detailed setup
2. Review API endpoints documentation
3. Check backend/frontend logs for errors

## 🔮 Future Enhancements

- [ ] WhatsApp integration for SMS reminders
- [ ] Email notification system
- [ ] Advanced analytics and reporting
- [ ] Multi-currency support
- [ ] Automated payment scheduling
- [ ] Mobile app (React Native)
- [ ] Two-factor authentication
- [ ] Invoice templates
- [ ] Bulk operations
- [ ] API rate limiting

---

**Made with ❤️ for payment professionals**
