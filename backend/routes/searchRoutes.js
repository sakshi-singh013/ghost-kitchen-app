const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing query param q' });
    const term = `%${q}%`;

    const [locations] = await pool.query(
      'SELECT id, city, area FROM locations WHERE city LIKE ? OR area LIKE ? LIMIT 10', [term, term]
    );
    const [cuisines] = await pool.query(
      'SELECT id, name FROM cuisines WHERE name LIKE ? LIMIT 10', [term]
    );
    const [restaurants] = await pool.query(
      'SELECT id, name, rating FROM restaurants WHERE name LIKE ? LIMIT 10', [term]
    );

    res.json({
      locations,
      cuisines,
      restaurants
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;