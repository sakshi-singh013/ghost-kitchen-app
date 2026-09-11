const express = require('express');
const pool = require('../config/db');
const { getMockMeta } = require('../config/mockData');
const router = express.Router();

router.get('/meta', async (req, res) => {
  try {
    const [cities] = await pool.query('SELECT DISTINCT city FROM locations ORDER BY city');
    const [areas] = await pool.query('SELECT id, city, area FROM locations ORDER BY city, area');
    const [cuisines] = await pool.query('SELECT id, name FROM cuisines ORDER BY name');
    res.json({
      cities: cities.map(c => c.city),
      areas,
      cuisines
    });
  } catch (err) {
    console.warn('[Meta Warning] DB query failed, returning fallback meta data:', err.message);
    res.json(getMockMeta());
  }
});

module.exports = router;