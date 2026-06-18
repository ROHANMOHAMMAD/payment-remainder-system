import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get reminders for business
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { businessId } = req.user;
    const result = await pool.query(
      `SELECT rl.* FROM REMINDER_LOGS rl
       JOIN INVOICES i ON rl.invoice_id = i.id
       WHERE i.business_id = $1
       ORDER BY rl.sent_at DESC`,
      [businessId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get reminders error:', err);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

export default router;
