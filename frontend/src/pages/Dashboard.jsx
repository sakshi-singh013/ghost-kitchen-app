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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
const [uploadMsg, setUploadMsg] = useState(null);
const [meta, setMeta] = useState({ cities: [], areas: [], cuisines: [] });
const [budget, setBudget] = useState('');
const [selectedCuisines, setSelectedCuisines] = useState([]);
const [recCity, setRecCity] = useState('');
const [recArea, setRecArea] = useState('');
const [recommendations, setRecommendations] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const res = await axios.get(`https://ghost-kitchen-app.onrender.com/api/search?q=${searchQuery}`);
    setSearchResults(res.data);
  };

  const handleAskAI = async (e) => {
    e.preventDefault();
    const res = await axios.post('https://ghost-kitchen-app.onrender.com/api/ai/recommend', { question: aiQuestion });
    setAiAnswer(res.data.recommendation);
  };

  const handleUpload = async (e) => {
  e.preventDefault();
  if (!uploadFile) return;
  const formData = new FormData();
  formData.append('file', uploadFile);
  const res = await axios.post('https://ghost-kitchen-app.onrender.com/api/admin/upload-orders', formData);
  setUploadMsg(res.data.message);
};

const handleRecommend = async (e) => {
  e.preventDefault();
  const res = await axios.post('https://ghost-kitchen-app.onrender.com/api/recommend', {
    budget: Number(budget),
    cuisines: selectedCuisines,
    city: recCity || undefined,
    area: recArea || undefined
  });
  setRecommendations(res.data.recommendations);
};

const toggleCuisine = (name) => {
  setSelectedCuisines(prev =>
    prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
  );
};

  useEffect(() => {
  Promise.all([
    axios.get('https://ghost-kitchen-app.onrender.com/api/dashboard'),
    axios.get('https://ghost-kitchen-app.onrender.com/api/cuisines'),
    axios.get('https://ghost-kitchen-app.onrender.com/api/opportunity'),
    axios.get('https://ghost-kitchen-app.onrender.com/api/meta')
  ])
    .then(([dashRes, cuisineRes, oppRes, metaRes]) => {
      setDashboard(dashRes.data);
      setCuisines(cuisineRes.data);
      setOpportunities(oppRes.data);
      setMeta(metaRes.data);
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
        <div className="panel">
  <h2>🎯 Find the Best Location to Open Your Cloud Kitchen</h2>
  <form onSubmit={handleRecommend}>
    <div style={{ marginBottom: 12 }}>
      <label>Your Budget (₹)</label><br />
      <input
        type="number"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        placeholder="e.g. 400000"
        style={{ padding: 8, width: 200 }}
        required
      />
    </div>

    <div style={{ marginBottom: 12 }}>
      <label>City (optional)</label><br />
      <select
        value={recCity}
        onChange={(e) => { setRecCity(e.target.value); setRecArea(''); }}
        style={{ padding: 8, width: 220 }}
      >
        <option value="">Any city</option>
        {meta.cities.map((c, i) => <option key={i} value={c}>{c}</option>)}
      </select>
    </div>

    <div style={{ marginBottom: 12 }}>
      <label>Specific Area (optional)</label><br />
      <select
        value={recArea}
        onChange={(e) => setRecArea(e.target.value)}
        style={{ padding: 8, width: 220 }}
      >
        <option value="">Any area</option>
        {meta.areas
          .filter(a => !recCity || a.city === recCity)
          .map((a, i) => <option key={i} value={a.area}>{a.area} ({a.city})</option>)}
      </select>
    </div>

    <div style={{ marginBottom: 12 }}>
      <label>Cuisines you plan to serve:</label><br />
      {cuisines.map((c, i) => (
        <label key={i} style={{ marginRight: 12 }}>
          <input
            type="checkbox"
            checked={selectedCuisines.includes(c.name)}
            onChange={() => toggleCuisine(c.name)}
          />{' '}
          {c.name}
        </label>
      ))}
    </div>

    <button type="submit">Get Recommendations</button>
  </form>

  {recommendations && (
    <div style={{ marginTop: 20 }}>
      <h3>Top Recommendations</h3>
      <table>
        <thead>
          <tr>
            <th>Area</th><th>Cuisine</th><th>Setup Cost</th><th>Budget Left</th>
            <th>Demand</th><th>Competitors Nearby</th><th>Verdict</th>
          </tr>
        </thead>
        <tbody>
          {recommendations.map((r, i) => (
            <tr key={i}>
              <td>{r.area}, {r.city}</td>
              <td>{r.cuisine}</td>
              <td>₹{r.estimatedSetupCost}</td>
              <td>₹{r.remainingBudget}</td>
              <td>{r.demandScore}</td>
              <td>{r.competitorCount}</td>
              <td>{r.verdict}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
        <div className="cards">

  <div className="card">
    <h3>💰 Total Revenue</h3>
    <p>₹{dashboard.totalRevenue}</p>
    <small style={{opacity:0.8}}>Business Generated</small>
  </div>

  <div className="card">
    <h3>🍽 Restaurants</h3>
    <p>{dashboard.totalRestaurants}</p>
    <small style={{opacity:0.8}}>Active Partners</small>
  </div>

  <div className="card">
    <h3>📍 Locations</h3>
    <p>{dashboard.totalLocations}</p>
    <small style={{opacity:0.8}}>Cities Covered</small>
  </div>

  <div className="card">
    <h3>📈 Demand Score</h3>
    <p>92%</p>
    <small style={{opacity:0.8}}>High Market Demand</small>
  </div>

  <div className="card">
    <h3>🏆 Opportunity Index</h3>
    <p>87%</p>
    <small style={{opacity:0.8}}>Growth Potential</small>
  </div>

  <div className="card">
    <h3>⭐ Avg Rating</h3>
    <p>4.6/5</p>
    <small style={{opacity:0.8}}>Customer Satisfaction</small>
  </div>

</div>
      <div className="panel">
        <h2>Revenue by Cuisine</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={cuisines}>
            <XAxis 
  dataKey="name" 
  stroke="#ccc"
  angle={-20} 
  textAnchor="end" 
  interval={0} 
  height={60}
/>
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

      <div className="panel">
        <h2>Search</h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location, cuisine, restaurant..."
            style={{ flex: 1, padding: 8 }}
          />
          <button type="submit">Search</button>
        </form>
        {searchResults && (
          <pre style={{ marginTop: 12, fontSize: 12, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(searchResults, null, 2)}
          </pre>
        )}
      </div>

      <div className="panel">
        <h2>Ask the Analyst</h2>
        <form onSubmit={handleAskAI} style={{ display: 'flex', gap: 8 }}>
          <input
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Should I open a Burgers kitchen in Koramangala?"
            style={{ flex: 1, padding: 8 }}
          />
          <button type="submit">Ask</button>
        </form>
        {aiAnswer && <p style={{ marginTop: 12 }}>{aiAnswer}</p>}
      </div>
      <div className="panel">
        <h2>Admin: Upload Orders CSV</h2>
        <form onSubmit={handleUpload} style={{ display: 'flex', gap: 8 }}>
          <input type="file" accept=".csv" onChange={(e) => setUploadFile(e.target.files[0])} />
          <button type="submit">Upload</button>
        </form>
        {uploadMsg && <p style={{ marginTop: 12 }}>{uploadMsg}</p>}
      </div>
    </div>
  );
}

export default Dashboard;