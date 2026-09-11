const express = require('express');
const pool = require('../config/db');
const {
  getMockDashboard,
  mockCuisines,
  mockOpportunities
} = require('../config/mockData');
const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(order_value), 0) AS totalRevenue FROM orders WHERE status = 'completed'`
    );
    const [[{ totalOrders }]] = await pool.query(`SELECT COUNT(*) AS totalOrders FROM orders`);
    const [[{ totalRestaurants }]] = await pool.query(`SELECT COUNT(*) AS totalRestaurants FROM restaurants`);
    const [[{ totalLocations }]] = await pool.query(`SELECT COUNT(*) AS totalLocations FROM locations`);
    const [[{ avgRating }]] = await pool.query(`SELECT ROUND(AVG(rating), 2) AS avgRating FROM restaurants`);

    const [revenueByCity] = await pool.query(`
      SELECT l.city, ROUND(SUM(o.order_value), 2) AS revenue
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      JOIN locations l ON r.location_id = l.id
      WHERE o.status = 'completed'
      GROUP BY l.city
      ORDER BY revenue DESC
    `);

    const [ordersByStatus] = await pool.query(`
      SELECT status, COUNT(*) AS count FROM orders GROUP BY status
    `);

    res.json({
      kpis: { totalRevenue, totalOrders, totalRestaurants, totalLocations, avgRating },
      revenueByCity,
      ordersByStatus
    });
  } catch (err) {
    console.warn('[Dashboard Warning] DB query failed, returning mock dashboard:', err.message);
    res.json(getMockDashboard());
  }
});

router.get('/cuisines', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT cu.id, cu.name,
             COUNT(DISTINCT r.id) AS restaurantCount,
             ROUND(SUM(o.order_value), 2) AS totalRevenue,
             ROUND(AVG(r.rating), 2) AS avgRating
      FROM cuisines cu
      LEFT JOIN restaurants r ON r.cuisine_id = cu.id
      LEFT JOIN orders o ON o.restaurant_id = r.id AND o.status = 'completed'
      GROUP BY cu.id
      ORDER BY totalRevenue DESC
    `);
    res.json(rows);
  } catch (err) {
    console.warn('[Cuisines Warning] DB query failed, returning fallback cuisines:', err.message);
    res.json(mockCuisines);
  }
});

router.get('/opportunity', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.city, l.area, cu.name AS cuisine,
             d.demand_score, c.competition_score,
             ROUND(d.demand_score - c.competition_score, 2) AS opportunityIndex
      FROM demand d
      JOIN competition c ON c.location_id = d.location_id AND c.cuisine_id = d.cuisine_id
      JOIN locations l ON l.id = d.location_id
      JOIN cuisines cu ON cu.id = d.cuisine_id
      ORDER BY opportunityIndex DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (err) {
    console.warn('[Opportunity Warning] DB query failed, returning fallback opportunities:', err.message);
    res.json(mockOpportunities);
  }
});

module.exports = router;