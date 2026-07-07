const pool = require('../config/db');

const CITIES = [
  { city: 'Bengaluru', areas: ['Koramangala', 'Whitefield', 'Indiranagar', 'HSR Layout', 'Jayanagar'] },
  { city: 'Mumbai', areas: ['Andheri', 'Bandra', 'Powai', 'Dadar'] },
  { city: 'Delhi', areas: ['Saket', 'Dwarka', 'Rohini', 'Connaught Place'] },
  { city: 'Hyderabad', areas: ['Gachibowli', 'Banjara Hills', 'Madhapur'] },
  { city: 'Pune', areas: ['Kothrud', 'Viman Nagar', 'Hinjewadi'] }
];
const CUISINES = ['Burgers', 'Biryani', 'Pizza', 'Chinese', 'North Indian', 'South Indian', 'Desserts', 'Healthy Bowls'];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, d = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(d)); }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('Clearing old data...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of ['orders', 'demand', 'competition', 'restaurants', 'cuisines', 'locations']) {
      await conn.query(`TRUNCATE TABLE ${t}`);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Building locations in one batch...');
    const locationRows = [];
    for (const c of CITIES) {
      for (const area of c.areas) {
        const income = rand(35000, 130000);
        locationRows.push([c.city, area, rand(6000, 28000), income, Math.floor(income * 3.5)]);
      }
    }
    await conn.query(
      'INSERT INTO locations (city, area, population_density, avg_income, avg_setup_cost) VALUES ?',
      [locationRows]
    );
    const [locRes] = await conn.query('SELECT id, city, area FROM locations');
    const locationIds = locRes.map(r => r.id);

    console.log('Building cuisines in one batch...');
    await conn.query('INSERT INTO cuisines (name) VALUES ?', [CUISINES.map(name => [name])]);
    const [cuisineRes] = await conn.query('SELECT id, name FROM cuisines');

    console.log('Building restaurants in one batch...');
    const restaurantRows = [];
    for (const locId of locationIds) {
      const numRestaurants = rand(2, 6);
      for (let i = 0; i < numRestaurants; i++) {
        const cuisine = pick(cuisineRes);
        restaurantRows.push([
          `${cuisine.name} Kitchen #${rand(100, 999)}`,
          locId,
          cuisine.id,
          randFloat(3, 5, 1),
          rand(120000, 850000)
        ]);
      }
    }
    await conn.query(
      'INSERT INTO restaurants (name, location_id, cuisine_id, rating, monthly_revenue) VALUES ?',
      [restaurantRows]
    );
    const [restRes] = await conn.query('SELECT id FROM restaurants');
    const restaurantIds = restRes.map(r => r.id);

    console.log('Building orders in one batch...');
    const orderRows = [];
    for (const rId of restaurantIds) {
      const numOrders = rand(8, 20);
      for (let o = 0; o < numOrders; o++) {
        orderRows.push([rId, rand(150, 1500), `2026-0${rand(1, 6)}-${rand(10, 28)}`]);
      }
    }
    await conn.query('INSERT INTO orders (restaurant_id, order_value, order_date) VALUES ?', [orderRows]);

    console.log('Building demand + competition in one batch each...');
    const demandRows = [];
    const competitionRows = [];
    for (const locId of locationIds) {
      for (const cuisine of cuisineRes) {
        demandRows.push([locId, cuisine.id, randFloat(2, 10, 1)]);
        competitionRows.push([locId, cuisine.id, randFloat(0, 8, 1)]);
      }
    }
    await conn.query('INSERT INTO demand (location_id, cuisine_id, demand_score) VALUES ?', [demandRows]);
    await conn.query('INSERT INTO competition (location_id, cuisine_id, competition_score) VALUES ?', [competitionRows]);

    console.log(`✅ Seed complete! ${locationIds.length} locations, ${cuisineRes.length} cuisines, ${restaurantIds.length} restaurants`);
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    conn.release();
    process.exit();
  }
}

seed();