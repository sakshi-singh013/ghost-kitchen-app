import { useState } from 'react';

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 12s3.75-7.5 10.5-7.5S22.5 12 22.5 12s-3.75 7.5-10.5 7.5S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.13A10.6 10.6 0 0 1 12 5c6.75 0 10.5 7 10.5 7a13.4 13.4 0 0 1-3.14 4.14M6.53 6.53C3.63 8.28 1.5 12 1.5 12s3.75 7 10.5 7a9.9 9.9 0 0 0 5.47-1.53" />
      <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
    </svg>
  );
}

/**
 * Password input with a show/hide toggle.
 * Usage mirrors a plain <input type="password">, plus the usual props.
 */
function PasswordInput({ value, onChange, placeholder, required, minLength, id }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-password-field">
      <input
        id={id}
        value={value}
        onChange={onChange}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
      />
      <button
        type="button"
        className="auth-password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

export default PasswordInput;
