import express from 'express';
import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';

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

// Create customer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { businessId } = req.user;
    const { name, email, phone } = req.body;

    const customerId = uuidv4();
    const result = await pool.query(
      `INSERT INTO CUSTOMERS (id, business_id, name, email, phone)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [customerId, businessId, name, email, phone]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

export default router;
