import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const SignupForm: React.FC = () => {
  const { signUpWithEmail, authMode, signInDemo } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoFallback, setShowDemoFallback] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(name, email, password);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message.includes('not configured')
            ? 'Firebase not configured'
            : err.message.includes('email-already')
              ? 'An account with this email already exists'
              : err.message
          : 'Sign-up failed';
      setError(msg);
      if (authMode === 'demo' || msg === 'Firebase not configured') {
        setShowDemoFallback(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (showDemoFallback) {
    return (
      <div className="w-full space-y-3 animate-fade-in">
        <div className="p-3 rounded-md bg-warn-bg border border-warn/30 text-warn-light text-xs">
          Firebase auth unavailable. Continue as a demo operator to preview the
          dashboard.
        </div>
        <button
          type="button"
          onClick={() => signInDemo(name)}
          className="w-full btn-primary"
        >
          Enter Demo Dashboard
        </button>
      </div>
    );
  }

  return (
    <form className="w-full space-y-3.5" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label className="label-sm">Full Name</label>
        <input
          type="text"
          required
          className="input-field"
          placeholder="Alex Morgan"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label className="label-sm">Email</label>
        <input
          type="email"
          required
          className="input-field"
          placeholder="operator@controlroom.io"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label className="label-sm">Password</label>
        <input
          type="password"
          required
          className="input-field"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <label className="label-sm">Confirm Password</label>
        <input
          type="password"
          required
          className="input-field"
          placeholder="Re-enter password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      {error && (
        <div className="p-2.5 rounded-md bg-danger-bg border border-danger/30 text-danger-light text-xs">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50"
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
};

export default SignupForm;
