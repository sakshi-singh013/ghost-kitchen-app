import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import '../Dashboard.css';

const API = 'https://ghost-kitchen-app.onrender.com/api';

/* ── helpers ─────────────────────────────────────────────── */
function formatINR(n) {
  if (n == null) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

function verdictBadge(v) {
  if (!v) return null;
  const lower = v.toLowerCase();
  const cls = lower.includes('recommend') || lower.includes('good') || lower.includes('great') || lower.includes('excellent')
    ? 'badge-green'
    : lower.includes('average') || lower.includes('moderate')
      ? 'badge-yellow'
      : 'badge-red';
  return <span className={`badge ${cls}`}>{v}</span>;
}

/* ── sub-sections ────────────────────────────────────────── */
function StatCards({ data }) {
  const cards = [
    { label: 'Total revenue',      icon: '₹', value: formatINR(data.totalRevenue),   sub: 'Business generated' },
    { label: 'Restaurants',        icon: '🍽', value: data.totalRestaurants,          sub: 'Active partners' },
    { label: 'Locations',          icon: '📍', value: data.totalLocations,            sub: 'Cities covered' },
    { label: 'Demand score',       icon: '📈', value: '92%',                          sub: 'High market demand' },
    { label: 'Opportunity index',  icon: '🏆', value: '87%',                          sub: 'Growth potential' },
    { label: 'Avg rating',         icon: '⭐', value: '4.6 / 5',                     sub: 'Customer satisfaction' },
  ];

  return (
    <div className="stats-grid">
      {cards.map((c) => (
        <div className="stat-card" key={c.label}>
          <div className="stat-card-header">
            <span className="stat-card-label">{c.label}</span>
            <span className="stat-card-icon">{c.icon}</span>
          </div>
          <div className="stat-card-value">{c.value}</div>
          <div className="stat-card-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

function RevenueChart({ cuisines }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Revenue by cuisine</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={cuisines} barCategoryGap="30%">
          <XAxis
            dataKey="name"
            stroke="#4b5563"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            angle={-20}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis
            stroke="#4b5563"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickFormatter={(v) => formatINR(v)}
            width={72}
          />
          <Tooltip
            contentStyle={{
              background: '#13161e',
              border: '1px solid #2a2e3e',
              borderRadius: 8,
              fontSize: 12,
              color: '#f1f3f6',
            }}
            formatter={(v) => [formatINR(v), 'Revenue']}
          />
          <Bar dataKey="totalRevenue" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function OpportunitiesTable({ opportunities }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Top expansion opportunities</span>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Area</th>
            <th>Cuisine</th>
            <th>Demand</th>
            <th>Competition</th>
            <th>Index</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((o, i) => (
            <tr key={i}>
              <td>{o.area}, {o.city}</td>
              <td>{o.cuisine}</td>
              <td>{o.demand_score}</td>
              <td>{o.competition_score}</td>
              <td><strong style={{ color: 'var(--text-primary)' }}>{o.opportunityIndex}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── page sections (one per sidebar nav item) ────────────── */
function OverviewPage({ dashboard, cuisines, opportunities }) {
  return (
    <>
      <StatCards data={dashboard} />
      <div className="dash-col">
        <RevenueChart cuisines={cuisines} />
        <OpportunitiesTable opportunities={opportunities} />
      </div>
    </>
  );
}

function LocationPage({ cuisines, meta }) {
  const [budget, setBudget] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [recCity, setRecCity] = useState('');
  const [recArea, setRecArea] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleCuisine = (name) =>
    setSelectedCuisines((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/recommend`, {
        budget: Number(budget),
        cuisines: selectedCuisines,
        city: recCity || undefined,
        area: recArea || undefined,
      });
      setRecommendations(res.data.recommendations);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-grid">
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Find the best location</span>
        </div>

        <form onSubmit={handleRecommend}>
          <div className="form-field">
            <label className="form-label">Budget</label>
            <input
              className="form-input"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 400000"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">City</label>
            <select
              className="form-select"
              value={recCity}
              onChange={(e) => { setRecCity(e.target.value); setRecArea(''); }}
            >
              <option value="">Any city</option>
              {meta.cities.map((c, i) => <option key={i}>{c}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Area</label>
            <select
              className="form-select"
              value={recArea}
              onChange={(e) => setRecArea(e.target.value)}
            >
              <option value="">Any area</option>
              {meta.areas
                .filter((a) => !recCity || a.city === recCity)
                .map((a, i) => (
                  <option key={i} value={a.area}>{a.area} ({a.city})</option>
                ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Cuisines</label>
            <div className="cuisine-chips">
              {cuisines.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  className={`cuisine-chip ${selectedCuisines.includes(c.name) ? 'selected' : ''}`}
                  onClick={() => toggleCuisine(c.name)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Searching…' : 'Get recommendations'}
          </button>
        </form>
      </div>

      {recommendations && (
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Top recommendations</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Cuisine</th>
                <th>Setup cost</th>
                <th>Budget left</th>
                <th>Demand</th>
                <th>Competition</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((r, i) => (
                <tr key={i}>
                  <td>{r.area}, {r.city}</td>
                  <td>{r.cuisine}</td>
                  <td>{formatINR(r.estimatedSetupCost)}</td>
                  <td>{formatINR(r.remainingBudget)}</td>
                  <td>{r.demandScore}</td>
                  <td>{r.competitorCount}</td>
                  <td>{verdictBadge(r.verdict)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AnalyticsPage({ cuisines, opportunities }) {
  return (
    <div className="dash-col">
      <RevenueChart cuisines={cuisines} />
      <OpportunitiesTable opportunities={opportunities} />
    </div>
  );
}

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Fetch the data and store the entire object
      const res = await axios.get(`${API}/search?q=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if the entire results object is completely empty
  const hasNoResults = results && 
    (!results.locations || results.locations.length === 0) &&
    (!results.cuisines || results.cuisines.length === 0) &&
    (!results.restaurants || results.restaurants.length === 0);

  return (
    <div className="panel" style={{ maxWidth: 720 }}>
      <div className="panel-header">
        <span className="panel-title">Search locations and cuisines</span>
      </div>

      <form onSubmit={handleSearch}>
        <div className="search-row">
          <input
            className="form-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Koramangala, Burger, Mumbai…"
          />
          <button className="btn-primary" type="submit" disabled={loading || !query.trim()}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      {results && (
        <div style={{ marginTop: 24 }}>
          {hasNoResults ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              No results found for "{query}"
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* === RESTAURANTS TABLE === */}
              {results.restaurants && results.restaurants.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 12, color: 'var(--text-primary)', fontSize: 14 }}>
                    Restaurants ({results.restaurants.length})
                  </h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {Object.keys(results.restaurants[0]).map((k) => (
                          <th key={k} style={{ textTransform: 'capitalize' }}>{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.restaurants.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((v, j) => (
                            <td key={j}>{String(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* === LOCATIONS TABLE === */}
              {results.locations && results.locations.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 12, color: 'var(--text-primary)', fontSize: 14 }}>
                    Locations ({results.locations.length})
                  </h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {Object.keys(results.locations[0]).map((k) => (
                          <th key={k} style={{ textTransform: 'capitalize' }}>{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.locations.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((v, j) => (
                            <td key={j}>{String(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* === CUISINES TABLE === */}
              {results.cuisines && results.cuisines.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: 12, color: 'var(--text-primary)', fontSize: 14 }}>
                    Cuisines ({results.cuisines.length})
                  </h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {Object.keys(results.cuisines[0]).map((k) => (
                          <th key={k} style={{ textTransform: 'capitalize' }}>{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.cuisines.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((v, j) => (
                            <td key={j}>{String(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AIPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/ai/recommend`, { question });
      setAnswer(res.data.recommendation);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel" style={{ maxWidth: 720 }}>
      <div className="panel-header">
        <span className="panel-title">AI market analyst</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
        Ask anything about market conditions, cuisine demand, or location viability.
      </p>

      <form onSubmit={handleAsk}>
        <div className="search-row">
          <input
            className="form-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Should I open a burger kitchen in Koramangala?"
          />
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Thinking…' : 'Ask'}
          </button>
        </div>
      </form>

      {answer && (
        <div className="ai-answer">
          {answer}
        </div>
      )}
    </div>
  );
}

function AdminPage() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API}/admin/upload-orders`, formData);
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel" style={{ maxWidth: 560 }}>
      <div className="panel-header">
        <span className="panel-title">Upload orders CSV</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Import order data from a CSV file to update market statistics.
      </p>

      <form onSubmit={handleUpload}>
        <div className="upload-area">
          <label className="btn-ghost" style={{ cursor: 'pointer' }}>
            Choose file
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
          <span className="upload-filename">
            {file ? file.name : 'No file selected'}
          </span>
          <button className="btn-primary" type="submit" disabled={!file || loading}>
            {loading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>

      {msg && (
        <div className="ai-answer" style={{ marginTop: 16 }}>
          {msg}
        </div>
      )}
    </div>
  );
}

/* ── root component ──────────────────────────────────────── */
function Dashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [cuisines, setCuisines] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [meta, setMeta] = useState({ cities: [], areas: [], cuisines: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/dashboard`),
      axios.get(`${API}/cuisines`),
      axios.get(`${API}/opportunity`),
      axios.get(`${API}/meta`),
    ])
      .then(([dashRes, cuisineRes, oppRes, metaRes]) => {
        setDashboard(dashRes.data);
        setCuisines(cuisineRes.data);
        setOpportunities(oppRes.data);
        setMeta(metaRes.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <DashboardLayout activePage={activePage} onNavigate={setActivePage}>
        <div className="dash-error">
          <p>Could not load data</p>
          <p style={{ fontSize: 12 }}>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboard) {
    return (
      <DashboardLayout activePage={activePage} onNavigate={setActivePage}>
        <div className="dash-loading">
          <div className="dash-loading-spinner" />
          <p>Loading dashboard…</p>
        </div>
      </DashboardLayout>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage dashboard={dashboard} cuisines={cuisines} opportunities={opportunities} />;
      case 'location':
        return <LocationPage cuisines={cuisines} meta={meta} />;
      case 'analytics':
        return <AnalyticsPage cuisines={cuisines} opportunities={opportunities} />;
      case 'search':
        return <SearchPage />;
      case 'ai':
        return <AIPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </DashboardLayout>
  );
}

export default Dashboard;
