const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { handleMockAuthRegister, handleMockAuthLogin } = require('../config/mockData');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ghost_kitchen_jwt_secret_key_2026';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, 'owner']
    );
    const token = jwt.sign({ id: result.insertId, email, role: 'owner' }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, user: { id: result.insertId, name, email, role: 'owner' } });
  } catch (err) {
    console.warn('[Auth Warning] DB query failed, using fallback auth mode:', err.message);
    return res.status(201).json(handleMockAuthRegister(name, email, password));
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (valid) {
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    }
  } catch (err) {
    console.warn('[Auth Warning] DB query failed, using fallback login mode:', err.message);
  }
  return res.json(handleMockAuthLogin(email, password));
});

module.exports = router;