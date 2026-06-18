## Frontend Dashboard Guide

Complete single-page application with real-time updates.

### Start the Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**

### Features

✅ **Authentication**
  - Registration form
  - Login form
  - JWT token management
  - Auto-redirect on login

✅ **Dashboard**
  - KPI cards (Total invoices, Amount due, Reminders sent, Customers)
  - Invoice management table
  - Customer directory
  - Real-time data updates

✅ **Invoice Management**
  - View all invoices
  - Create new invoice
  - Update invoice status
  - Delete invoice
  - Status badges (pending, paid, overdue)

✅ **Customer Management**
  - Add new customers
  - View customer list
  - Email and phone tracking

✅ **UI/UX**
  - Dark theme with modern design
  - Responsive layout
  - Modal dialogs
  - Loading states
  - Error handling
  - Real-time updates via Socket.io

### API Integration Points

The frontend connects to backend at `http://localhost:5000/api`

**Required Backend Running:**
- Install backend dependencies
- Run PostgreSQL database
- Start backend server

### LocalStorage

- Stores authentication token
- Stores businessId
- Persists login session

### Environment

No build process needed! Pure HTML/CSS/JavaScript.

Can be served with:
```bash
python -m http.server 3000
# or
npx http-server -p 3000
# or
node frontend/package.json scripts
```

### Default Test Account

Create one on first login:
- Email: test@example.com
- Password: test123
- Company: Test Company

Then add customers and create invoices!

### Troubleshooting

**"Cannot reach backend"**
- Ensure backend is running on :5000
- Check CORS is enabled
- Check firewall

**"Cannot create invoice"**
- Add customers first
- Check business ID is set
- Verify token is valid

**"Page not loading"**
- Clear browser cache
- Check console for errors
- Verify correct port 3000

Ready to use!
