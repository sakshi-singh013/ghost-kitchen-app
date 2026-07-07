import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Toast from '../components/Toast';
import '../Login.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await axios.post('https://ghost-kitchen-app.onrender.com/api/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Link may have expired.');
    }
  };

  return (
    <div className="auth-page">
      <Toast message={error} type="error" onClose={() => setError(null)} />

      <div className="auth-split">

        <div className="auth-brand">
          <div className="auth-brand-icon">🔥</div>
          <h2>Ghost Kitchen</h2>
          <p>Set a new password for your account.</p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>New password</h1>

          {done ? (
            <p className="auth-subtitle">Password updated! Redirecting to login...</p>
          ) : (
            <>
              <label>New Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

              <label>Confirm Password</label>
              <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" required />

              <button type="submit">Reset Password</button>
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

export default ResetPassword;