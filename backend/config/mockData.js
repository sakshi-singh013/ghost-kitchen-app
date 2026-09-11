/**
 * Comprehensive Mock Data & Fallback Engine
 * Serves realistic ghost kitchen analytics when MySQL connection is closed or unreachable.
 */

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'ghost_kitchen_jwt_secret_key_2026';

const mockUsers = [
  { id: 1, name: 'Admin User', email: 'admin@ghostkitchen.com', role: 'admin' },
  { id: 2, name: 'Sakshi Singh', email: 'sakshi@gmail.com', role: 'owner' }
];

const mockCities = ['Bengaluru', 'Mumbai', 'Hyderabad', 'Delhi', 'Pune'];

const mockAreas = [
  { id: 1, city: 'Mumbai', area: 'Bandra' },
  { id: 2, city: 'Mumbai', area: 'Andheri' },
  { id: 3, city: 'Bengaluru', area: 'Koramangala' },
  { id: 4, city: 'Bengaluru', area: 'Indiranagar' },
  { id: 5, city: 'Delhi', area: 'Saket' },
  { id: 6, city: 'Delhi', area: 'Connaught Place' },
  { id: 7, city: 'Pune', area: 'Viman Nagar' },
  { id: 8, city: 'Hyderabad', area: 'Gachibowli' }
];

const mockCuisines = [
  { id: 1, name: 'Biryani', restaurantCount: 18, totalRevenue: 4250000.00, avgRating: 4.6 },
  { id: 2, name: 'Burgers', restaurantCount: 14, totalRevenue: 3100000.00, avgRating: 4.4 },
  { id: 3, name: 'Pizza', restaurantCount: 12, totalRevenue: 2850000.00, avgRating: 4.3 },
  { id: 4, name: 'North Indian', restaurantCount: 16, totalRevenue: 3900000.00, avgRating: 4.5 },
  { id: 5, name: 'Chinese', restaurantCount: 10, totalRevenue: 2100000.00, avgRating: 4.2 },
  { id: 6, name: 'Healthy Bowls', restaurantCount: 8, totalRevenue: 1950000.00, avgRating: 4.7 }
];

const mockRevenueByCity = [
  { city: 'Bengaluru', revenue: 6200000.00 },
  { city: 'Mumbai', revenue: 5400000.00 },
  { city: 'Hyderabad', revenue: 3800000.00 },
  { city: 'Delhi', revenue: 3200000.00 },
  { city: 'Pune', revenue: 1900000.00 }
];

const mockOrdersByStatus = [
  { status: 'completed', count: 1840 },
  { status: 'cancelled', count: 92 },
  { status: 'refunded', count: 48 }
];

const mockOpportunities = [
  { city: 'Bengaluru', area: 'Koramangala', cuisine: 'Biryani', demand_score: 9.5, competition_score: 5.1, opportunityIndex: 4.4 },
  { city: 'Hyderabad', area: 'Gachibowli', cuisine: 'Healthy Bowls', demand_score: 9.2, competition_score: 4.9, opportunityIndex: 4.3 },
  { city: 'Bengaluru', area: 'Indiranagar', cuisine: 'Burgers', demand_score: 8.9, competition_score: 5.0, opportunityIndex: 3.9 },
  { city: 'Mumbai', area: 'Bandra', cuisine: 'Pizza', demand_score: 8.8, competition_score: 5.4, opportunityIndex: 3.4 },
  { city: 'Pune', area: 'Viman Nagar', cuisine: 'Chinese', demand_score: 7.9, competition_score: 4.6, opportunityIndex: 3.3 },
  { city: 'Delhi', area: 'Saket', cuisine: 'North Indian', demand_score: 8.4, competition_score: 5.5, opportunityIndex: 2.9 },
  { city: 'Mumbai', area: 'Andheri', cuisine: 'Biryani', demand_score: 9.1, competition_score: 6.5, opportunityIndex: 2.6 }
];

function getMockDashboard() {
  return {
    kpis: {
      totalRevenue: 20500000.00,
      totalOrders: 1980,
      totalRestaurants: 78,
      totalLocations: 8,
      avgRating: 4.5
    },
    revenueByCity: mockRevenueByCity,
    ordersByStatus: mockOrdersByStatus
  };
}

function getMockMeta() {
  return {
    cities: mockCities,
    areas: mockAreas,
    cuisines: mockCuisines.map(c => ({ id: c.id, name: c.name }))
  };
}

function getMockRecommend(budget, cuisines, city, area) {
  const selectedCuisines = Array.isArray(cuisines) ? cuisines : [cuisines];
  const list = [];
  mockAreas.forEach(loc => {
    selectedCuisines.forEach((cName, idx) => {
      if (city && loc.city.toLowerCase() !== city.toLowerCase()) return;
      if (area && loc.area.toLowerCase() !== area.toLowerCase()) return;

      const setupCost = 250000 + (idx * 50000);
      if (budget && setupCost > budget) return;

      const demandScore = parseFloat((8.0 + (idx * 0.5)).toFixed(1));
      const competitorCount = idx * 2;
      const competitionScore = competitorCount * 2;
      const oppScore = parseFloat((demandScore - competitionScore).toFixed(2));

      list.push({
        city: loc.city,
        area: loc.area,
        cuisine: cName,
        estimatedSetupCost: setupCost,
        remainingBudget: budget ? budget - setupCost : 150000,
        demandScore,
        competitionScore,
        competitorCount,
        opportunityScore: oppScore,
        verdict: oppScore > 3 ? 'Highly Recommended' : oppScore > 0 ? 'Recommended' : 'Risky — high competition'
      });
    });
  });

  return { count: list.length, recommendations: list.slice(0, 10) };
}

function handleMockAuthRegister(name, email, password) {
  let user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = { id: mockUsers.length + 1, name: name || 'Sakshi Singh', email, role: 'owner' };
    mockUsers.push(user);
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  return { token, user };
}

function handleMockAuthLogin(email, password) {
  let user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = { id: mockUsers.length + 1, name: email.split('@')[0] || 'User', email, role: 'owner' };
    mockUsers.push(user);
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  return { token, user };
}

function getMockSearch(q, type) {
  const query = (q || '').toLowerCase();
  const results = [];
  if (!type || type === 'location') {
    mockAreas
      .filter(l => l.city.toLowerCase().includes(query) || l.area.toLowerCase().includes(query))
      .forEach(l => results.push({ type: 'location', id: l.id, city: l.city, area: l.area }));
  }
  if (!type || type === 'cuisine') {
    mockCuisines
      .filter(c => c.name.toLowerCase().includes(query))
      .forEach(c => results.push({ type: 'cuisine', id: c.id, name: c.name }));
  }
  return results;
}

function getMockAIRecommendation(question, city, area, cuisine) {
  const opp = mockOpportunities[0];
  return {
    recommendation: `High opportunity detected for ${cuisine || 'Biryani'} in ${area || 'Koramangala'}, ${city || 'Bengaluru'}!\n1. Demand Level: High\n2. Competition Level: Moderate\n3. Est. Monthly Revenue: ₹6.5L - ₹9.2L\n4. Verdict: Recommended`,
    dataUsed: `Location: ${opp.area}, ${opp.city} | Cuisine: ${opp.cuisine} | Demand: ${opp.demand_score} | Competition: ${opp.competition_score}`
  };
}

module.exports = {
  mockUsers,
  mockCities,
  mockAreas,
  mockCuisines,
  mockRevenueByCity,
  mockOrdersByStatus,
  mockOpportunities,
  getMockDashboard,
  getMockMeta,
  getMockRecommend,
  handleMockAuthRegister,
  handleMockAuthLogin,
  getMockSearch,
  getMockAIRecommendation
};
