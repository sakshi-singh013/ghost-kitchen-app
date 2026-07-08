import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../components/Toast';
import '../Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post('https://ghost-kitchen-app.onrender.com/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <Toast message={error} type="error" onClose={() => setError(null)} />

      <div className="auth-split">
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <div className="auth-brand-icon">🔥</div>
            <span className="auth-brand-name">Ghost Kitchen</span>
          </div>

          <h2>Launch your next cloud kitchen with confidence</h2>
          <p>Real market data to find the best location, cuisine, and budget before you invest a rupee.</p>

          <ul className="auth-brand-list">
            <li>Live revenue and demand insights</li>
            <li>Location-based opportunity scoring</li>
            <li>AI-powered market recommendations</li>
          </ul>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to your dashboard</p>

          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            required
          />

          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            required
          />

          <div className="auth-links-row">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit">Sign in</button>

          <p className="auth-footer-text">
            No account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
