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
          <div className="auth-brand-icon">🔥</div>
          <h2>Ghost Kitchen</h2>
          <p>Find the best location, cuisine, and budget to launch your next cloud kitchen — backed by real market data.</p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Reset password</h1>
          <p className="auth-subtitle">
            {sent
              ? "Check your email for a reset link"
              : "Enter your email and we'll send you a reset link"}
          </p>

          {!sent && (
            <>
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
              <button type="submit">Send Reset Link</button>
            </>
          )}

          <p className="auth-footer-text">
            <Link to="/login">Back to login</Link>
          </p>
        </form>

      </div>
    </div>
  );
}

export default ForgotPassword;