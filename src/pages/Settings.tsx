import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import StatusBar from '../components/dashboard/StatusBar';
import GoogleAuthModal from '../components/auth/GoogleAuthModal';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  const { profile, authMode, disableGoogleAuth } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable Google Authenticator 2FA?')) {
      return;
    }
    setDisabling(true);
    setDisableError(null);
    try {
      await disableGoogleAuth();
    } catch (err) {
      setDisableError(
        err instanceof Error ? err.message : 'Failed to disable 2FA.',
      );
    } finally {
      setDisabling(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <StatusBar activeAlertCount={0} />

        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-5 max-w-3xl space-y-5">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">
                Settings
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Operator profile, security preferences and pipeline configuration.
              </p>
            </div>

            <div className="card p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary">
                  Operator Profile
                </h2>
                <span
                  className={`chip ${
                    authMode === 'firebase'
                      ? 'chip-safe'
                      : 'bg-warn-bg text-warn-light border-warn/30'
                  }`}
                >
                  {authMode === 'firebase' ? 'Firebase Auth' : 'Demo Mode'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-bg-tertiary border border-border flex items-center justify-center overflow-hidden">
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-text-primary">
                      {profile?.displayName?.[0]?.toUpperCase() ?? 'O'}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-base font-medium text-text-primary">
                    {profile?.displayName ?? 'Operator'}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {profile?.email ?? '—'}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-text-muted">
                    {profile?.role ?? 'operator'} · UID {profile?.uid ?? '—'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="label-sm">Display Name</label>
                  <input
                    className="input-field text-sm"
                    defaultValue={profile?.displayName ?? ''}
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="label-sm">Email</label>
                  <input
                    className="input-field text-sm"
                    defaultValue={profile?.email ?? ''}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Google Authenticator 2FA Security Card */}
            <div className="card p-5 space-y-4 border-border/90">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-accent-bg border border-accent/30 flex items-center justify-center text-accent">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-text-primary">
                      Google Authenticator (2FA)
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Multi-Factor Authentication via TOTP Mobile App
                    </p>
                  </div>
                </div>
                <span
                  className={`chip ${
                    profile?.twoFactorEnabled
                      ? 'chip-safe shadow-glow-safe'
                      : 'bg-bg-tertiary text-text-muted border-border'
                  }`}
                >
                  {profile?.twoFactorEnabled ? '2FA Enabled' : 'Disabled'}
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                Add an extra layer of security to your control room operator account. When enabled, signing in requires a 6-digit verification code generated by your Google Authenticator app.
              </p>

              {disableError && (
                <div className="p-2.5 rounded-md bg-danger-bg border border-danger/30 text-danger-light text-xs">
                  {disableError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-border-subtle">
                <div className="text-[11px] text-text-muted">
                  Provider: Firebase Auth TOTP / Google Authenticator
                </div>

                {profile?.twoFactorEnabled ? (
                  <button
                    type="button"
                    onClick={handleDisable2FA}
                    disabled={disabling}
                    className="px-4 py-1.5 rounded-md text-xs font-medium bg-danger-bg text-danger-light hover:bg-danger-bg/80 border border-danger/40 transition-colors"
                  >
                    {disabling ? 'Disabling…' : 'Disable 2FA'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-1.5 rounded-md text-xs font-medium btn-primary shadow-glow-accent"
                  >
                    Set Up Google Authenticator
                  </button>
                )}
              </div>
            </div>

            <div className="card p-5 space-y-5">
              <h2 className="text-sm font-semibold text-text-primary">
                Alert Notifications
              </h2>
              {[
                {
                  label: 'Critical severity alerts',
                  desc: 'Push + on-screen for CRITICAL anomalies',
                  checked: true,
                },
                {
                  label: 'High severity alerts',
                  desc: 'Push + on-screen for HIGH anomalies',
                  checked: true,
                },
                {
                  label: 'Warning alerts',
                  desc: 'On-screen only for WARNING anomalies',
                  checked: true,
                },
                {
                  label: 'Email digests',
                  desc: 'Daily incident summary at 08:00 local time',
                  checked: false,
                },
                {
                  label: 'Auto-notify security team',
                  desc: 'Trigger escalation workflows for CRITICAL events',
                  checked: true,
                },
              ].map((row) => (
                <label
                  key={row.label}
                  className="flex items-start justify-between gap-4 p-3 rounded-md border border-border-subtle hover:bg-bg-tertiary/40 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="text-sm text-text-primary">{row.label}</div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      {row.desc}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={row.checked}
                    className="mt-1 w-4 h-4 accent-accent"
                  />
                </label>
              ))}
            </div>

            <div className="card p-5 space-y-5">
              <h2 className="text-sm font-semibold text-text-primary">
                Detection Pipeline
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="label-sm">Density Threshold (High)</label>
                  <input className="input-field text-sm mono" defaultValue="90" />
                </div>
                <div className="space-y-1.5">
                  <label className="label-sm">Density Threshold (Critical)</label>
                  <input className="input-field text-sm mono" defaultValue="160" />
                </div>
                <div className="space-y-1.5">
                  <label className="label-sm">Anomaly Cooldown (s)</label>
                  <input className="input-field text-sm mono" defaultValue="20" />
                </div>
                <div className="space-y-1.5">
                  <label className="label-sm">Tick Interval (ms)</label>
                  <input className="input-field text-sm mono" defaultValue="2500" />
                </div>
              </div>
              <div className="p-3 rounded-md bg-warn-bg border border-warn/30 text-warn-light text-xs">
                Pipeline values shown are configuration placeholders. Phase 1
                uses the built-in mock simulator — real WebSocket/YOLO pipelines
                will be wired in Phase 2.
              </div>
            </div>
          </div>
        </main>
      </div>

      <GoogleAuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Settings;
