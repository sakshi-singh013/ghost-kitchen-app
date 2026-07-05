const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await pool.query(`SELECT COALESCE(SUM(order_value),0) AS totalRevenue FROM orders`);
    const [[{ totalRestaurants }]] = await pool.query(`SELECT COUNT(*) AS totalRestaurants FROM restaurants`);
    const [[{ totalLocations }]] = await pool.query(`SELECT COUNT(*) AS totalLocations FROM locations`);
    res.json({ totalRevenue, totalRestaurants, totalLocations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;