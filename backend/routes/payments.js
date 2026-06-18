import express from 'express';
import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Record payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { businessId } = req.user;
    const { invoiceId, amount, paymentMethod } = req.body;

    const paymentId = uuidv4();
    const result = await pool.query(
      `INSERT INTO PAYMENTS (id, invoice_id, amount, payment_method, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [paymentId, invoiceId, amount, paymentMethod, 'success']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Record payment error:', err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

export default router;
