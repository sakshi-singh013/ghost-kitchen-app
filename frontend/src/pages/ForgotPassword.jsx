import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Toast from '../components/Toast';
import '../Login.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post('https://ghost-kitchen-app.onrender.com/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
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
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Reset password</h1>

          {sent ? (
            <div className="auth-success">
              <div className="auth-success-icon">✓</div>
              <h3>Check your inbox</h3>
              <p>We sent a reset link to <strong>{email}</strong></p>
            </div>
          ) : (
            <>
              <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>

              <label>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                required
              />

              <button type="submit">Send reset link</button>
            </>
          )}

          <p className="auth-footer-text">
            <Link to="/login">← Back to sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
