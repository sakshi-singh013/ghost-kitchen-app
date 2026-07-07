const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.post('/recommend', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });

    const [locations] = await pool.query('SELECT id, city, area FROM locations');
    const [cuisines] = await pool.query('SELECT id, name FROM cuisines');

    const matchedLocation = locations.find(l => question.toLowerCase().includes(l.area.toLowerCase()));
    const matchedCuisine = cuisines.find(c => question.toLowerCase().includes(c.name.toLowerCase()));

    let context = 'No specific location/cuisine detected in the question.';
    if (matchedLocation && matchedCuisine) {
      const [[demandRow]] = await pool.query(
        'SELECT demand_score FROM demand WHERE location_id = ? AND cuisine_id = ?',
        [matchedLocation.id, matchedCuisine.id]
      );
      const [[compRow]] = await pool.query(
        'SELECT competition_score FROM competition WHERE location_id = ? AND cuisine_id = ?',
        [matchedLocation.id, matchedCuisine.id]
      );
      const demand = demandRow?.demand_score ?? 0;
      const competition = compRow?.competition_score ?? 0;
      const verdict = demand - competition > 3 ? 'Recommended' : demand - competition > 0 ? 'Proceed with Caution' : 'Not Recommended';

      context = `Location: ${matchedLocation.area}, ${matchedLocation.city}. Cuisine: ${matchedCuisine.name}. Demand score: ${demand}/10. Competition score: ${competition}/10. Verdict: ${verdict}.`;
    }

    res.json({ recommendation: context });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;