import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onForgotPassword?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = () => {
  const {
    signInWithEmail,
    authMode,
    signInDemo,
    mfaPending,
    verifyTotpSignIn,
    cancelMfa,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoFallback, setShowDemoFallback] = useState(false);
  const [demoName, setDemoName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message.includes('not configured')
            ? 'Firebase not configured'
            : err.message.includes('wrong-password') ||
                err.message.includes('user-not-found')
              ? 'Invalid email or password'
              : err.message
          : 'Sign-in failed';
      setError(msg);
      if (authMode === 'demo' || msg === 'Firebase not configured') {
        setShowDemoFallback(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyTotpSignIn(totpCode);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Google Authenticator verification failed.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (mfaPending) {
    return (
      <form className="w-full space-y-4 animate-fade-in" onSubmit={handleMfaSubmit}>
        <div className="p-3 rounded-md bg-accent-bg border border-accent/30 text-text-primary text-xs space-y-1">
          <div className="font-semibold text-accent flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            Google Authenticator 2FA Required
          </div>
          <div className="text-text-secondary text-[11px]">
            Open your Google Authenticator app and enter the 6-digit code for SafeCrowd.
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="label-sm text-center block">
            6-Digit Authenticator Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            className="input-field text-center mono text-xl tracking-[0.4em] font-bold"
            placeholder="000000"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-2.5 rounded-md bg-danger-bg border border-danger/30 text-danger-light text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cancelMfa}
            className="w-1/3 btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || totpCode.length !== 6}
            className="w-2/3 btn-primary text-sm disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Verify & Log In'}
          </button>
        </div>
      </form>
    );
  }

  if (showDemoFallback) {
    return (
      <div className="w-full space-y-3 animate-fade-in">
        <div className="p-3 rounded-md bg-warn-bg border border-warn/30 text-warn-light text-xs">
          Firebase auth unavailable. Continue as a demo operator to preview the
          dashboard.
        </div>
        <input
          type="text"
          className="input-field text-sm"
          placeholder="Operator name (optional)"
          value={demoName}
          onChange={(e) => setDemoName(e.target.value)}
        />
        <button
          type="button"
          onClick={() => signInDemo(demoName)}
          className="w-full btn-primary"
        >
          Enter Demo Dashboard
        </button>
      </div>
    );
  }

  return (
    <form className="w-full space-y-4" onSubmit={handleSubmit}>
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {loading ? 'Signing in…' : 'Log In'}
      </button>
    </form>
  );
};

export default LoginForm;
