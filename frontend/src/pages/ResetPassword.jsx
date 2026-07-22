import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Toast from '../components/Toast';
import PasswordInput from '../components/PasswordInput';
import '../Login.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      await axios.post('https://ghost-kitchen-backend-nuhi.onrender.com/api/auth/reset-password', {
        token: searchParams.get('token'),
        password,
      });
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    }
  };

  return (
    <div className="auth-page">
      <Toast message={error} type="error" onClose={() => setError(null)} />

      <div className="auth-card-solo">
        <h1>Choose a new password</h1>
        <p className="auth-subtitle">Must be at least 6 characters</p>

        {done ? (
          <div className="auth-success">
            <div className="auth-success-icon">✓</div>
            <h3>Password updated</h3>
            <p>Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <label>New password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />

            <label>Confirm password</label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />

            <button type="submit" onClick={handleSubmit}>Update password</button>
          </>
        )}

        <p className="auth-footer-text">
          <Link to="/login">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
