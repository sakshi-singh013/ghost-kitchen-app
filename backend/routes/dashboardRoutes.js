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
router.get('/locations', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.*, 
        (SELECT AVG(d.demand_score) FROM demand d WHERE d.location_id = l.id) AS avgDemand,
        (SELECT AVG(c.competition_score) FROM competition c WHERE c.location_id = l.id) AS avgCompetition
      FROM locations l
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/cuisines', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT cu.name, COUNT(r.id) AS restaurantCount, COALESCE(SUM(o.order_value),0) AS totalRevenue
      FROM cuisines cu
      LEFT JOIN restaurants r ON r.cuisine_id = cu.id
      LEFT JOIN orders o ON o.restaurant_id = r.id
      GROUP BY cu.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/opportunity', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.city, l.area, cu.name AS cuisine, d.demand_score, c.competition_score,
        (d.demand_score - c.competition_score) AS opportunityIndex
      FROM demand d
      JOIN competition c ON c.location_id = d.location_id AND c.cuisine_id = d.cuisine_id
      JOIN locations l ON l.id = d.location_id
      JOIN cuisines cu ON cu.id = d.cuisine_id
      ORDER BY opportunityIndex DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;