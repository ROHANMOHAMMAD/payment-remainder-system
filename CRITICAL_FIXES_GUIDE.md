# 🚀 CRITICAL SECURITY FIXES - IMPLEMENTATION GUIDE

**Goal:** Make your application production-ready in Phase 1 (1 week)  
**Estimated Time:** 12.5 hours

---

## PRIORITY 1: Password Validation (1 hour)

### File: `backend/routes/auth.js`

```javascript
// ADD THIS FUNCTION AT THE TOP OF FILE
const validatePassword = (password) => {
  const minLength = 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!password || password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters` };
  }
  if (!hasUppercase) {
    return { valid: false, error: 'Password must contain at least 1 uppercase letter' };
  }
  if (!hasLowercase) {
    return { valid: false, error: 'Password must contain at least 1 lowercase letter' };
  }
  if (!hasNumber) {
    return { valid: false, error: 'Password must contain at least 1 number' };
  }
  if (!hasSpecial) {
    return { valid: false, error: 'Password must contain at least 1 special character (!@#$%)' };
  }
  return { valid: true };
};

// REPLACE THIS SECTION (Lines 10-20):
// ❌ OLD
/*
router.post('/register', async (req, res) => {
  try {
    const { email, password, companyName } = req.body;

    if (!email || !password || !companyName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
*/

// ✅ NEW
router.post('/register', async (req, res) => {
  try {
    const { email, password, companyName } = req.body;

    if (!email || !password || !companyName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate password strength
    const pwdValidation = validatePassword(password);
    if (!pwdValidation.valid) {
      return res.status(400).json({ error: pwdValidation.error });
    }
```

**Test:**
```bash
# Test weak password
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"weak","companyName":"TestCo"}'
# Should return: "Password must be at least 12 characters"

# Test strong password
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"SecureP@ss123","companyName":"TestCo"}'
# Should succeed
```

---

## PRIORITY 2: Input Validation (2 hours)

### Install validation library:
```bash
cd backend
npm install joi email-validator
```

### File: `backend/middleware/validation.js` (CREATE NEW FILE)

```javascript
import Joi from 'joi';

export const schemas = {
  customer: Joi.object({
    name: Joi.string().min(3).max(255).required(),
    email: Joi.string().email().optional(),
    phone: Joi.string()
      .regex(/^\+?[1-9]\d{1,14}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Phone must be valid E.164 format (e.g., +14155552671)'
      }),
    address: Joi.string().max(500).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    zip: Joi.string().max(20).optional(),
    country: Joi.string().max(100).optional()
  }),

  invoice: Joi.object({
    customerId: Joi.string().uuid().required(),
    amount: Joi.number().positive().precision(2).required(),
    dueDate: Joi.date().iso().required().messages({
      'date.format': 'Due date must be ISO format (YYYY-MM-DD)'
    }),
    description: Joi.string().max(5000).optional(),
    status: Joi.string().valid('pending', 'sent', 'paid', 'overdue', 'cancelled').optional()
  }),

  payment: Joi.object({
    invoiceId: Joi.string().uuid().required(),
    amount: Joi.number().positive().precision(2).required(),
    paymentMethod: Joi.string()
      .valid('card', 'bank_transfer', 'check', 'cash', 'other')
      .optional()
  })
};

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }
    req.validatedData = value;
    next();
  };
};
```

### File: `backend/routes/customers.js` (UPDATE)

```javascript
import express from 'express';
import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';  // ADD THIS

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { businessId } = req.user;
    const result = await pool.query(
      'SELECT * FROM CUSTOMERS WHERE business_id = $1 ORDER BY name ASC',
      [businessId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create customer - ADD VALIDATION
router.post('/', 
  authenticateToken, 
  validate(schemas.customer),  // ADD THIS LINE
  async (req, res) => {
  try {
    const { businessId } = req.user;
    const { name, email, phone } = req.validatedData;  // USE req.validatedData

    const customerId = uuidv4();
    const result = await pool.query(
      `INSERT INTO CUSTOMERS (id, business_id, name, email, phone)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [customerId, businessId, name.trim(), email?.toLowerCase(), phone]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

export default router;
```

### File: `backend/routes/invoices.js` (UPDATE)

```javascript
import express from 'express';
import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';  // ADD THIS
import { io } from '../index.js';

const router = express.Router();

// Get all invoices
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { businessId } = req.user;
    const result = await pool.query(
      'SELECT * FROM INVOICES WHERE business_id = $1 ORDER BY created_at DESC',
      [businessId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get invoices error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Create invoice - ADD VALIDATION
router.post('/', 
  authenticateToken, 
  validate(schemas.invoice),  // ADD THIS LINE
  async (req, res) => {
  try {
    const { businessId } = req.user;
    const { customerId, amount, dueDate, description } = req.validatedData;  // USE req.validatedData

    const invoiceId = uuidv4();
    const result = await pool.query(
      `INSERT INTO INVOICES (id, business_id, customer_id, amount, due_date, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [invoiceId, businessId, customerId, amount, dueDate, description, 'pending']
    );

    io.to(`business-${businessId}`).emit('invoice-created', result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice - ADD VALIDATION
router.put('/:id', 
  authenticateToken, 
  validate(schemas.invoice),  // ADD THIS LINE
  async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req.user;
    const { amount, dueDate, description, status } = req.validatedData;  // USE req.validatedData

    const result = await pool.query(
      `UPDATE INVOICES SET amount = $1, due_date = $2, description = $3, status = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND business_id = $6 RETURNING *`,
      [amount, dueDate, description, status, id, businessId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    io.to(`business-${businessId}`).emit('invoice-updated', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update invoice error:', err);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Delete invoice
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req.user;

    await pool.query(
      'DELETE FROM INVOICES WHERE id = $1 AND business_id = $2',
      [id, businessId]
    );

    io.to(`business-${businessId}`).emit('invoice-deleted', { id });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    console.error('Delete invoice error:', err);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;
```

---

## PRIORITY 3: Authorization Checks in Payments (1 hour)

### File: `backend/routes/payments.js` (REPLACE ENTIRE FILE)

```javascript
import express from 'express';
import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// Record payment - ADD AUTHORIZATION CHECK
router.post('/', 
  authenticateToken, 
  validate(schemas.payment),
  async (req, res) => {
  try {
    const { businessId } = req.user;
    const { invoiceId, amount, paymentMethod } = req.validatedData;

    // ✅ CRITICAL: Verify invoice belongs to user's business
    const invoiceCheck = await pool.query(
      'SELECT id, amount FROM INVOICES WHERE id = $1 AND business_id = $2',
      [invoiceId, businessId]
    );

    if (invoiceCheck.rows.length === 0) {
      return res.status(403).json({ 
        error: 'Unauthorized: Invoice not found or does not belong to your business' 
      });
    }

    // ✅ Optional: Verify payment amount doesn't exceed invoice
    const invoice = invoiceCheck.rows[0];
    if (amount > invoice.amount) {
      return res.status(400).json({ 
        error: `Payment amount ($${amount}) cannot exceed invoice amount ($${invoice.amount})` 
      });
    }

    const paymentId = uuidv4();
    const result = await pool.query(
      `INSERT INTO PAYMENTS (id, invoice_id, amount, payment_method, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [paymentId, invoiceId, amount, paymentMethod || 'other', 'success']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Record payment error:', err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

export default router;
```

---

## PRIORITY 4: Rate Limiting (1 hour)

### Install rate limiter:
```bash
npm install express-rate-limit
```

### File: `backend/index.js` (UPDATE TOP SECTION)

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import rateLimit from 'express-rate-limit';  // ADD THIS
import authRoutes from './routes/auth.js';
import invoiceRoutes from './routes/invoices.js';
import customerRoutes from './routes/customers.js';
import paymentRoutes from './routes/payments.js';
import reminderRoutes from './routes/reminders.js';

dotenv.config();

// ✅ ADD RATE LIMITING
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Too many login attempts, please try again later'
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(generalLimiter);  // Apply general limiter to all routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes with specific limiters for auth
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reminders', reminderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// ... rest of file remains the same
```

---

## PRIORITY 5: Move Secrets from Docker Compose (30 min)

### File: `.env.production` (CREATE NEW FILE)

```bash
# ⚠️ NEVER commit this file to git!
# Generate these values securely

# Database
DB_USER=postgres
DB_PASSWORD=your_secure_db_password_here
DB_HOST=postgres
DB_PORT=5432
DB_NAME=payment_system

# JWT - Generate: openssl rand -base64 32
JWT_SECRET=your_secure_jwt_secret_here
JWT_REFRESH_SECRET=your_secure_refresh_secret_here
JWT_EXPIRY=15m

# Environment
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com

# Redis
REDIS_URL=redis://redis:6379

# Email (for later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourdomain.com
```

### File: `.gitignore` (UPDATE OR CREATE)

```
# Environment variables
.env
.env.local
.env.production
.env.*.local

# Dependencies
node_modules/
npm-debug.log
yarn-error.log

# Build outputs
dist/
build/
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db
```

### File: `docker-compose.yml` (UPDATE)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: payment-system-db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    networks:
      - payment-network

  redis:
    image: redis:7-alpine
    container_name: payment-system-redis
    ports:
      - "6379:6379"
    networks:
      - payment-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: payment-system-api
    env_file:
      - .env.production  # ✅ Load from file
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis
    networks:
      - payment-network

  frontend:
    image: node:18-alpine
    container_name: payment-system-frontend
    working_dir: /app
    volumes:
      - ./frontend:/app
    ports:
      - "3000:3000"
    command: node server.js
    networks:
      - payment-network

volumes:
  postgres_data:

networks:
  payment-network:
    driver: bridge
```

### To run in production:
```bash
# Generate secure secrets
export DB_PASSWORD=$(openssl rand -base64 24)
export JWT_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Save to .env.production
cat > .env.production << EOF
DB_USER=postgres
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=postgres
DB_PORT=5432
DB_NAME=payment_system
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRY=15m
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
REDIS_URL=redis://redis:6379
EOF

# Launch
docker-compose --env-file .env.production up -d
```

---

## PRIORITY 6: Socket.IO Authentication (1 hour)

### File: `backend/index.js` (UPDATE Socket.IO section)

```javascript
// ... imports
import jwt from 'jsonwebtoken';

// ... existing setup code

// ✅ ADD AUTHENTICATION MIDDLEWARE FOR SOCKET.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication failed: no token provided'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.businessId = decoded.businessId;
    next();
  } catch (err) {
    return next(new Error('Authentication failed: invalid token'));
  }
});

// Real-time events
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected to business ${socket.businessId}`);

  socket.on('join-business', (businessId) => {
    // ✅ VERIFY USER OWNS THIS BUSINESS
    if (socket.businessId !== businessId) {
      socket.emit('error', 'Unauthorized: You do not have access to this business');
      return;
    }
    
    socket.join(`business-${businessId}`);
    console.log(`User ${socket.userId} joined room business-${businessId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// ... export io
```

### Frontend update: `frontend/index.html` (Update Socket.IO connection)

Find this section:
```javascript
// ❌ OLD
const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

Replace with:
```javascript
// ✅ NEW
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

socket.on('connect_error', (error) => {
  if (error.message === 'Authentication failed: invalid token') {
    console.error('Socket auth failed - user should log in again');
    logout();
  }
});
```

---

## PRIORITY 7: HTTPS Enforcement (1 hour)

### File: `backend/index.js` (ADD AFTER CORS SETUP)

```javascript
// ✅ ADD HTTPS ENFORCEMENT
const enableHttpsMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
  }
  next();
};

// ✅ ADD SECURITY HEADERS
const addSecurityHeaders = (req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// Apply middlewares
app.use(enableHttpsMiddleware);
app.use(addSecurityHeaders);

// ... rest of app setup
```

---

## PRIORITY 8: CSRF Protection (2 hours)

### Install CSRF library:
```bash
npm install csurf cookie-parser
```

### File: `backend/index.js` (UPDATE)

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';  // ADD
import csurf from 'csurf';  // ADD
import { Server } from 'socket.io';
import http from 'http';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
// ... other imports

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ COOKIE PARSER MUST COME BEFORE CSRF
app.use(cookieParser());
app.use(express.json());

// ✅ CSRF PROTECTION
const csrfProtection = csurf({ cookie: false });

// Middleware
app.use(cors());
app.use(generalLimiter);
app.use(express.urlencoded({ extended: true }));

// ✅ GET CSRF TOKEN ENDPOINT
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ✅ PROTECT STATE-CHANGING ENDPOINTS
app.use('/api/invoices', csrfProtection);
app.use('/api/customers', csrfProtection);
app.use('/api/payments', csrfProtection);

// Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
// ... other routes

// Error handler for CSRF errors
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ error: 'CSRF token validation failed' });
  } else {
    next(err);
  }
});
```

### Frontend: `frontend/index.html` (UPDATE ALL FETCH CALLS)

```javascript
// ✅ GET CSRF TOKEN ON PAGE LOAD
let csrfToken = null;

async function getCsrfToken() {
  try {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    csrfToken = data.csrfToken;
  } catch (err) {
    console.error('Failed to get CSRF token', err);
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', getCsrfToken);

// ✅ UPDATE ALL FETCH CALLS TO INCLUDE CSRF TOKEN
async function createInvoice() {
  const response = await fetch('/api/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'X-CSRF-Token': csrfToken  // ADD THIS
    },
    body: JSON.stringify({
      customerId: invoiceData.customerId,
      amount: invoiceData.amount,
      dueDate: invoiceData.dueDate,
      description: invoiceData.description
    })
  });
  
  return response.json();
}
```

---

## PRIORITY 9: XSS Prevention in Frontend (2 hours)

### Install DOMPurify:
```html
<!-- Add to frontend/index.html HEAD section -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
```

### Frontend: `frontend/index.html` (SEARCH FOR AND REPLACE ALL innerHTML CALLS)

**Find all occurrences of `innerHTML` and replace:**

```javascript
// ❌ OLD - UNSAFE
function displayInvoices(invoices) {
  let html = '<table><tr><th>Amount</th><th>Status</th></tr>';
  invoices.forEach(inv => {
    html += `<tr><td>${inv.amount}</td><td>${inv.status}</td></tr>`;
  });
  document.getElementById('invoicesTable').innerHTML = html;
}

// ✅ NEW - SAFE
function displayInvoices(invoices) {
  const tbody = document.getElementById('invoicesTable').querySelector('tbody');
  tbody.innerHTML = '';
  
  invoices.forEach(inv => {
    const row = tbody.insertRow();
    const amountCell = row.insertCell(0);
    const statusCell = row.insertCell(1);
    
    // Use textContent which auto-escapes
    amountCell.textContent = `$${inv.amount}`;
    statusCell.textContent = inv.status;
  })
}
```

**Or use DOMPurify for complex HTML:**
```javascript
// ✅ USING DOMPURIFY
function displayRichContent(htmlContent) {
  const cleanHTML = DOMPurify.sanitize(htmlContent);
  document.getElementById('container').innerHTML = cleanHTML;
}
```

---

## PRIORITY 10: HttpOnly Cookies for JWT (1 hour)

### File: `backend/routes/auth.js` (UPDATE Login section)

```javascript
// ❌ OLD LOGIN RESPONSE
/*
res.json({ token, userId, businessId });
*/

// ✅ NEW LOGIN RESPONSE WITH HTTPONLY COOKIE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query(
      'SELECT * FROM USERS WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcryptjs.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, businessId: user.business_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    // ✅ SET HTTPONLY COOKIE INSTEAD
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // ✅ SEND ACCESS TOKEN IN RESPONSE (optional for backward compat)
    res.json({ userId: user.id, businessId: user.business_id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});
```

### File: `backend/middleware/auth.js` (UPDATE)

```javascript
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  // ✅ TRY COOKIE FIRST, THEN AUTHORIZATION HEADER
  let token = null;
  
  // Check cookie
  if (req.cookies && req.cookies.authToken) {
    token = req.cookies.authToken;
  }
  
  // Fallback to Authorization header for API clients
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
```

### Frontend: `frontend/index.html` (UPDATE FETCH CALLS)

```javascript
// ✅ NEW FETCH WITH CREDENTIALS
function makeAuthenticatedRequest(url, options = {}) {
  return fetch(url, {
    ...options,
    credentials: 'include'  // SEND COOKIES WITH REQUEST
  });
}

// Usage:
async function getInvoices() {
  const response = await makeAuthenticatedRequest('/api/invoices');
  return response.json();
}
```

---

## TESTING THE CRITICAL FIXES

### Test Script: `test-security.sh`

```bash
#!/bin/bash

echo "🧪 Testing Critical Security Fixes..."

# 1. Test password validation
echo "\n1️⃣ Testing password validation..."
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"weak","companyName":"Test"}' \
  | jq '.error'

# 2. Test rate limiting
echo "\n2️⃣ Testing rate limiting (should throttle after 5 attempts)..."
for i in {1..6}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"x@x.com","password":"x"}' \
    -H "X-Forwarded-For: 127.0.0.1" \
    | jq '.error'
done

# 3. Test authorization
echo "\n3️⃣ Testing authorization (should reject invalid business)..."
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"SecureP@ss123"}' \
  | jq -r '.token')

curl -X POST http://localhost:5000/api/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invoiceId":"fake-id","amount":"100"}' \
  | jq '.error'

echo "\n✅ Security tests completed"
```

---

## VERIFICATION CHECKLIST

✅ **After implementing all Priority 1-10 fixes:**

- [ ] Password validation works (rejects weak passwords)
- [ ] Input validation works (rejects invalid data)
- [ ] Authorization checks work (can't access other business data)
- [ ] Rate limiting works (throttles after limit)
- [ ] Secrets moved to .env.production
- [ ] Socket.IO requires token
- [ ] HTTPS enforced in production
- [ ] CSRF tokens required for state changes
- [ ] XSS prevented (using textContent)
- [ ] JWT in HttpOnly cookie

**Next:** Move to Phase 2 (Performance & Architecture)

