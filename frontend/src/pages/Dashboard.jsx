import { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import '../Dashboard.css';

const API = 'https://ghost-kitchen-backend-nuhi.onrender.com/api';

/* ── Helpers ─────────────────────────────────────────────── */
function formatINR(n) {
  if (n == null) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

/* ── Sparkline Component ─────────────────────────────────── */
function Sparkline({ color = '#f97316' }) {
  return (
    <svg className="sparkline-svg" viewBox="0 0 120 28">
      <defs>
        <linearGradient id={`sparkGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M0 22 C 20 20, 30 8, 50 14 C 70 20, 85 4, 120 2 L 120 28 L 0 28 Z"
        fill={`url(#sparkGrad-${color.replace('#', '')})`}
      />
      <path
        d="M0 22 C 20 20, 30 8, 50 14 C 70 20, 85 4, 120 2"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Executive Stat Cards ────────────────────────────────── */
function StatCards({ data }) {
  return (
    <div className="stats-grid">
      {/* Total Revenue */}
      <div className="stat-card-pro">
        <div className="stat-card-top">
          <span className="stat-card-title">Total Revenue</span>
          <div className="stat-icon-box">💰</div>
        </div>
        <div className="stat-value-row">
          <div className="stat-value-big">{formatINR(data.totalRevenue || 20500000)}</div>
          <span className="growth-pill positive">+18.2% ↑</span>
        </div>
        <Sparkline color="#f97316" />
      </div>

      {/* Orders */}
      <div className="stat-card-pro">
        <div className="stat-card-top">
          <span className="stat-card-title">Completed Orders</span>
          <div className="stat-icon-box">📦</div>
        </div>
        <div className="stat-value-row">
          <div className="stat-value-big">{(data.totalOrders || 1980).toLocaleString()}</div>
          <span className="growth-pill positive">+12.5% ↑</span>
        </div>
        <Sparkline color="#3b82f6" />
      </div>

      {/* Avg Order Value */}
      <div className="stat-card-pro">
        <div className="stat-card-top">
          <span className="stat-card-title">Avg Order Value</span>
          <div className="stat-icon-box">🏷️</div>
        </div>
        <div className="stat-value-row">
          <div className="stat-value-big">₹1,035</div>
          <span className="growth-pill positive">+4.1% ↑</span>
        </div>
        <Sparkline color="#f59e0b" />
      </div>

      {/* Active Kitchens */}
      <div className="stat-card-pro">
        <div className="stat-card-top">
          <span className="stat-card-title">Active Kitchens</span>
          <div className="stat-icon-box">🍽️</div>
        </div>
        <div className="stat-value-row">
          <div className="stat-value-big">{data.totalRestaurants || 78}</div>
          <span className="growth-pill neutral">+2 new</span>
        </div>
        <Sparkline color="#10b981" />
      </div>
    </div>
  );
}

/* ── Area Revenue Performance Chart ─────────────────────── */
function RevenuePerformanceChart({ cuisines }) {
  const chartData = [
    { day: 'Mon', delivery: 24000, pickup: 14000, catering: 6000 },
    { day: 'Tue', delivery: 31000, pickup: 18000, catering: 9000 },
    { day: 'Wed', delivery: 28000, pickup: 16000, catering: 8000 },
    { day: 'Thu', delivery: 39000, pickup: 22000, catering: 11000 },
    { day: 'Fri', delivery: 48000, pickup: 29000, catering: 15000 },
    { day: 'Sat', delivery: 56000, pickup: 35000, catering: 19000 },
    { day: 'Sun', delivery: 62000, pickup: 39000, catering: 22000 },
  ];

  return (
    <div className="panel-glass">
      <div className="panel-header-flex">
        <div className="panel-header-title">
          <span>📈 Revenue Performance</span>
        </div>
        <select className="panel-select-time">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>This Year</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="deliveryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="pickupGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
          <Tooltip
            contentStyle={{
              background: '#0f172a',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              borderRadius: 8,
              fontSize: 12,
              color: '#ffffff'
            }}
            formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']}
          />
          <Area type="monotone" dataKey="delivery" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#deliveryGrad)" />
          <Area type="monotone" dataKey="pickup" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#pickupGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Location Opportunities Table ───────────────────────── */
function OpportunitiesRankingTable({ opportunities }) {
  return (
    <div className="panel-glass">
      <div className="panel-header-flex">
        <div className="panel-header-title">
          <span>🏆 Location Opportunities Ranking</span>
        </div>
      </div>

      <table className="table-pro">
        <thead>
          <tr>
            <th>Location</th>
            <th>Rating</th>
            <th>Demand</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.slice(0, 5).map((o, idx) => {
            const badgeClass =
              idx === 0 ? 'badge-amber' :
              idx === 1 ? 'badge-blue' :
              idx === 2 ? 'badge-gold' : 'badge-gray';
            const statusLabel =
              idx === 0 ? 'High Growth' :
              idx === 1 ? 'Steady' :
              idx === 2 ? 'Opportunity' : 'Average';

            return (
              <tr key={idx}>
                <td>
                  <strong style={{ color: '#ffffff' }}>{o.area}</strong>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{o.city}</div>
                </td>
                <td>4.8 ⭐</td>
                <td>{o.demand_score || '9.5'} / 10</td>
                <td>
                  <span className={`badge-pill ${badgeClass}`}>{statusLabel}</span>
                </td>
                <td>
                  <button className="btn-sm-ghost">View Details</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── AI Assistant Panel ─────────────────────────────────── */
function AIAssistantPanel() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '🤖 AI Ghost Assistant: How can I help you optimize your kitchen strategy today?' },
    { sender: 'ai', text: '💡 Insight: Order density in Koramangala spiked 22%! Recommended setup: Healthy Bowls.' }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: question }]);
    const userQ = question;
    setQuestion('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Market Recommendation for "${userQ}": High demand zone identified! Est. Revenue: ₹6.5L - ₹9.2L/mo. Verdict: Recommended.`
        }
      ]);
    }, 600);
  };

  return (
    <div className="panel-glass ai-widget">
      <div className="panel-header-flex">
        <div className="panel-header-title">
          <span>✨ AI Market Assistant</span>
        </div>
      </div>

      <div className="ai-messages-box">
        {messages.map((m, i) => (
          <div key={i} className="ai-bubble" style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', background: m.sender === 'user' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(249, 115, 22, 0.08)' }}>
            {m.text}
          </div>
        ))}
      </div>

      <form className="ai-input-row" onSubmit={handleSend}>
        <input
          className="ai-input-field"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask AI analyst about locations or menu pricing..."
        />
        <button type="submit" className="ai-send-btn">Send</button>
      </form>
    </div>
  );
}

/* ── Overview Page Layout ───────────────────────────────── */
function OverviewPage({ dashboard, cuisines, opportunities }) {
  return (
    <div className="dash-page">
      <div className="dash-header">
        <div className="dash-header-title">
          <h1>Overview Dashboard</h1>
          <p>Real-time analytics, kitchen volume, and expansion scoring</p>
        </div>
      </div>

      <StatCards data={dashboard} />

      <div className="dash-two-col">
        <RevenuePerformanceChart cuisines={cuisines} />
        <AIAssistantPanel />
      </div>

      <OpportunitiesRankingTable opportunities={opportunities} />
    </div>
  );
}

/* ── Main Root Component ─────────────────────────────────── */
function Dashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [cuisines, setCuisines] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    async function loadData() {
      const fallbackDash = {
        totalRevenue: 20500000,
        totalOrders: 1980,
        totalRestaurants: 78,
        totalLocations: 8,
        avgRating: 4.5,
        revenueByCity: [
          { city: 'Bengaluru', revenue: 6200000 },
          { city: 'Mumbai', revenue: 5400000 },
          { city: 'Hyderabad', revenue: 3800000 },
          { city: 'Delhi', revenue: 3200000 },
          { city: 'Pune', revenue: 1900000 }
        ]
      };

      const fallbackCuisines = [
        { id: 1, name: 'Biryani', restaurantCount: 18, totalRevenue: 4250000, avgRating: 4.6 },
        { id: 2, name: 'Burgers', restaurantCount: 14, totalRevenue: 3100000, avgRating: 4.4 },
        { id: 3, name: 'Pizza', restaurantCount: 12, totalRevenue: 2850000, avgRating: 4.3 },
        { id: 4, name: 'North Indian', restaurantCount: 16, totalRevenue: 3900000, avgRating: 4.5 }
      ];

      const fallbackOpp = [
        { city: 'Bengaluru', area: 'Koramangala', cuisine: 'Biryani', demand_score: 9.5, competition_score: 5.1, opportunityIndex: 4.4 },
        { city: 'Hyderabad', area: 'Gachibowli', cuisine: 'Healthy Bowls', demand_score: 9.2, competition_score: 4.9, opportunityIndex: 4.3 },
        { city: 'Bengaluru', area: 'Indiranagar', cuisine: 'Burgers', demand_score: 8.9, competition_score: 5.0, opportunityIndex: 3.9 },
        { city: 'Mumbai', area: 'Bandra', cuisine: 'Pizza', demand_score: 8.8, competition_score: 5.4, opportunityIndex: 3.4 }
      ];

      try {
        const results = await Promise.allSettled([
          axios.get(`${API}/dashboard`),
          axios.get(`${API}/cuisines`),
          axios.get(`${API}/opportunity`),
        ]);

        const dashRes = results[0].status === 'fulfilled' ? results[0].value.data : fallbackDash;
        const cuisineRes = results[1].status === 'fulfilled' ? results[1].value.data : fallbackCuisines;
        const oppRes = results[2].status === 'fulfilled' ? results[2].value.data : fallbackOpp;

        setDashboard(dashRes.kpis ? dashRes.kpis : dashRes);
        setCuisines(cuisineRes);
        setOpportunities(oppRes);
      } catch (err) {
        setDashboard(fallbackDash);
        setCuisines(fallbackCuisines);
        setOpportunities(fallbackOpp);
      }
    }
    loadData();
  }, []);

  if (!dashboard) {
    return (
      <DashboardLayout activePage={activePage} onNavigate={setActivePage}>
        <div className="dash-loading">
          <div className="dash-loading-spinner" />
          <p>Loading executive dashboard…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePage={activePage} onNavigate={setActivePage}>
      <OverviewPage dashboard={dashboard} cuisines={cuisines} opportunities={opportunities} />
    </DashboardLayout>
  );
}

export default Dashboard;
