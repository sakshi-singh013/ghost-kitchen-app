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
          <div className="auth-brand-icon">🔥</div>
          <h2>Ghost Kitchen</h2>
          <p>Find the best location, cuisine, and budget to launch your next cloud kitchen — backed by real market data.</p>
          <ul className="auth-brand-list">
            <li>📊 Live revenue &amp; demand insights</li>
            <li>📍 Location-based opportunity scoring</li>
            <li>🤖 AI-powered recommendations</li>
          </ul>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to your dashboard</p>

          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

          <div className="auth-links-row">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit">Sign In</button>

          <p className="auth-footer-text">
            No account? <Link to="/register">Register</Link>
          </p>
        </form>

      </div>
    </div>
  );
}

export default Login;