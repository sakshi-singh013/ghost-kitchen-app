import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import '../Login.css';

const API = 'https://ghost-kitchen-backend-nuhi.onrender.com/api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/register`, { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      // Fallback register for instant demo viewing
      const demoUser = { id: 999, name: name || 'Sakshi Singh', email: email || 'sakshi@gmail.com', role: 'owner' };
      localStorage.setItem('token', 'demo_token_123');
      localStorage.setItem('user', JSON.stringify(demoUser));
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = { id: 999, name: 'Portfolio Reviewer', email: 'guest@ghostkitchen.com', role: 'owner' };
    localStorage.setItem('token', 'demo_token_123');
    localStorage.setItem('user', JSON.stringify(demoUser));
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* Left Side: Brand Showcase */}
        <div className="auth-brand-panel">
          <div className="brand-header">
            <div className="brand-icon">🔥</div>
            <div className="brand-title-group">
              <h2>Ghost Kitchen</h2>
              <span>Market Analytics</span>
            </div>
          </div>

          <div className="hero-text">
            <h1>Start Exploring Cloud Kitchen Insights</h1>
            <p>Join hundreds of kitchen owners analyzing demand density and expansion opportunities.</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>Visualizations</h4>
              <p>10,000+ Venues</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h4>Competitors</h4>
              <p>Monitor Menus</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h4>Predictions</h4>
              <p>Demand Trends</p>
            </div>
          </div>

          <div className="testimonial-card">
            <p>“The easiest platform to evaluate location demand before opening a cloud kitchen.”</p>
            <div className="testimonial-author">— Sakshi S., Kitchen Owner</div>
          </div>
        </div>

        {/* Right Side: Auth Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-tabs">
            <Link to="/login" className="auth-tab">Sign In</Link>
            <div className="auth-tab active">Create Account</div>
          </div>

          <div className="form-header">
            <h2>Create Your Account</h2>
            <p>Start exploring cloud kitchen market insights for free</p>
          </div>

          {error && <p className="error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sakshi Singh"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="sakshi@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <button type="button" className="btn-demo" onClick={handleDemoLogin}>
              ⚡ Quick Demo Access (1-Click View)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
