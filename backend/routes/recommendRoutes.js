const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.post('/recommend', async (req, res) => {
  try {
    const { budget, cuisines, city, area } = req.body;
    if (!budget || !cuisines || cuisines.length === 0) {
      return res.status(400).json({ error: 'budget and at least one cuisine are required' });
    }

    let query = `
      SELECT l.id AS location_id, l.city, l.area, l.avg_setup_cost,
             cu.id AS cuisine_id, cu.name AS cuisine,
             COALESCE(d.demand_score, 0) AS demand_score,
             (SELECT COUNT(*) FROM restaurants r WHERE r.location_id = l.id AND r.cuisine_id = cu.id) AS competitorCount
      FROM locations l
      CROSS JOIN cuisines cu
      LEFT JOIN demand d ON d.location_id = l.id AND d.cuisine_id = cu.id
      WHERE cu.name IN (?)
      AND l.avg_setup_cost <= ?
    `;
    const params = [cuisines, budget];

    if (city) { query += ` AND l.city = ?`; params.push(city); }
    if (area) { query += ` AND l.area = ?`; params.push(area); }

    const [rows] = await pool.query(query, params);

    const recommendations = rows
      .map(r => {
        // Competition score derived directly from real restaurant count: 0 competitors = 0 score, scales up to 10
        const competitionScore = Math.min(10, r.competitorCount * 2);
        const opportunityScore = parseFloat((r.demand_score - competitionScore).toFixed(2));
        return {
          city: r.city,
          area: r.area,
          cuisine: r.cuisine,
          estimatedSetupCost: r.avg_setup_cost,
          remainingBudget: parseFloat((budget - r.avg_setup_cost).toFixed(2)),
          demandScore: r.demand_score,
          competitionScore,
          competitorCount: r.competitorCount,
          opportunityScore,
          verdict:
            opportunityScore > 3 ? 'Highly Recommended' :
            opportunityScore > 0 ? 'Recommended' : 'Risky — high competition'
        };
      })
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 10);

    res.json({ count: recommendations.length, recommendations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;