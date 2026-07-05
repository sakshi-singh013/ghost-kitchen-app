const pool = require('../config/db');

async function seed() {
  try {
    console.log('Clearing old data...');
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of ['orders', 'demand', 'competition', 'restaurants', 'cuisines', 'locations', 'users']) {
      await pool.query(`TRUNCATE TABLE ${table}`);
    }
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Adding locations...');
    const [loc1] = await pool.query(`INSERT INTO locations (city, area, population_density, avg_income) VALUES ('Bengaluru', 'Koramangala', 18000, 85000)`);
    const [loc2] = await pool.query(`INSERT INTO locations (city, area, population_density, avg_income) VALUES ('Bengaluru', 'Whitefield', 15000, 70000)`);
    const [loc3] = await pool.query(`INSERT INTO locations (city, area, population_density, avg_income) VALUES ('Mumbai', 'Andheri', 22000, 90000)`);

    console.log('Adding cuisines...');
    const [c1] = await pool.query(`INSERT INTO cuisines (name) VALUES ('Burgers')`);
    const [c2] = await pool.query(`INSERT INTO cuisines (name) VALUES ('Biryani')`);
    const [c3] = await pool.query(`INSERT INTO cuisines (name) VALUES ('Pizza')`);

    console.log('Adding restaurants...');
    const [r1] = await pool.query(
      `INSERT INTO restaurants (name, location_id, cuisine_id, rating, monthly_revenue) VALUES ('Burger Point', ?, ?, 4.2, 350000)`,
      [loc1.insertId, c1.insertId]
    );
    const [r2] = await pool.query(
      `INSERT INTO restaurants (name, location_id, cuisine_id, rating, monthly_revenue) VALUES ('Biryani House', ?, ?, 4.5, 520000)`,
      [loc2.insertId, c2.insertId]
    );

    console.log('Adding orders...');
    await pool.query(`INSERT INTO orders (restaurant_id, order_value, order_date) VALUES (?, 450, '2026-06-01')`, [r1.insertId]);
    await pool.query(`INSERT INTO orders (restaurant_id, order_value, order_date) VALUES (?, 620, '2026-06-15')`, [r2.insertId]);

    console.log('Adding demand/competition...');
    await pool.query(`INSERT INTO demand (location_id, cuisine_id, demand_score) VALUES (?, ?, 8.5)`, [loc1.insertId, c1.insertId]);
    await pool.query(`INSERT INTO competition (location_id, cuisine_id, competition_score) VALUES (?, ?, 3.2)`, [loc1.insertId, c1.insertId]);

    console.log('✅ Seed complete!');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    process.exit();
  }
}

seed();