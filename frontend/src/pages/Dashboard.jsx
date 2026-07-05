import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import '../Dashboard.css';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [cuisines, setCuisines] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
const user = JSON.parse(localStorage.getItem('user') || '{}');

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  navigate('/login');
};

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/dashboard'),
      axios.get('http://localhost:5000/api/cuisines'),
      axios.get('http://localhost:5000/api/opportunity')
    ])
      .then(([dashRes, cuisineRes, oppRes]) => {
        setDashboard(dashRes.data);
        setCuisines(cuisineRes.data);
        setOpportunities(oppRes.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!dashboard) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <h1>Ghost Kitchen Market Insights</h1>
  <div>
    <span style={{ marginRight: 12 }}>Hi, {user.name}</span>
    <button onClick={handleLogout} style={{ padding: '8px 14px', cursor: 'pointer' }}>Logout</button>
  </div>
</div>
      <div className="cards">
        <div className="card"><h3>Total Revenue</h3><p>₹{dashboard.totalRevenue}</p></div>
        <div className="card"><h3>Total Restaurants</h3><p>{dashboard.totalRestaurants}</p></div>
        <div className="card"><h3>Total Locations</h3><p>{dashboard.totalLocations}</p></div>
      </div>

      <div className="panel">
        <h2>Revenue by Cuisine</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={cuisines}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Bar dataKey="totalRevenue" fill="#f2a93b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="panel">
        <h2>Top Expansion Opportunities</h2>
        <table>
          <thead>
            <tr><th>Area</th><th>Cuisine</th><th>Demand</th><th>Competition</th><th>Opportunity</th></tr>
          </thead>
          <tbody>
            {opportunities.map((o, i) => (
              <tr key={i}>
                <td>{o.area}, {o.city}</td>
                <td>{o.cuisine}</td>
                <td>{o.demand_score}</td>
                <td>{o.competition_score}</td>
                <td>{o.opportunityIndex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;