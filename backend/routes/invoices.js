import express from 'express';
import pool from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
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

// Create invoice
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { businessId } = req.user;
    const { customerId, amount, dueDate, description } = req.body;

    const invoiceId = uuidv4();
    const result = await pool.query(
      `INSERT INTO INVOICES (id, business_id, customer_id, amount, due_date, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [invoiceId, businessId, customerId, amount, dueDate, description, 'pending']
    );

    // Real-time update
    io.to(`business-${businessId}`).emit('invoice-created', result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { businessId } = req.user;
    const { amount, dueDate, description, status } = req.body;

    const result = await pool.query(
      `UPDATE INVOICES SET amount = $1, due_date = $2, description = $3, status = $4
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
