import React, { useState, useEffect } from 'react';
import GoogleButton from '../components/auth/GoogleButton';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type AuthTab = 'login' | 'signup';

const LogoMark: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded bg-accent/15 border border-accent/40 flex items-center justify-center text-accent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 6.35 10.56 7.27 11.29a1 1 0 0 0 1.46 0C13.65 20.56 20 15.25 20 10c0-4.42-3.58-8-8-8zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-text-primary font-semibold tracking-tight text-base font-sans">
          SafeCrowd
        </span>
        <span className="text-[9px] uppercase tracking-wider text-text-muted font-mono font-semibold">
          Control Center
        </span>
      </div>
    </div>
  );
};

const Landing: React.FC = () => {
  const [tab, setTab] = useState<AuthTab>('login');
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      const hasDemo = sessionStorage.getItem('safecrowd_demo_user');
      if (user || hasDemo) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen w-full bg-bg-primary text-text-primary flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full border-b border-border px-8 py-3.5 flex items-center justify-between bg-bg-secondary/60">
        <LogoMark />
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-bg-tertiary border border-border text-text-secondary text-[11px]">
            <span className="w-2 h-2 rounded-full bg-safe" />
            <span>NODE GATEWAY ONLINE</span>
          </div>
          <span className="text-text-muted hidden sm:inline text-[11px]">
            VER 1.2.0-STABLE
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-10 items-center">
          {/* Left info column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-bg-tertiary border border-border text-accent text-[11px] font-mono tracking-wider">
              <span>●</span>
              <span>SURVEILLANCE INTELLIGENCE SYSTEM</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight leading-tight">
                Real-Time Crowd Anomaly & Surge Detection.
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
                Automated computer vision surveillance pipeline engineered for transit hubs,
                public squares, and high-density venues. Continuously monitors spatial flow vectors,
                density thresholds, and anomalous bottlenecks.
              </p>
            </div>

            {/* Technical Parameters Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded bg-bg-card border border-border">
                <div className="label-sm text-[10px]">Model Pipeline</div>
                <div className="text-xs font-mono font-medium text-text-primary mt-1">
                  YOLOv8 + ByteTrack
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">Spatial Vector Analysis</div>
              </div>
              <div className="p-3 rounded bg-bg-card border border-border">
                <div className="label-sm text-[10px]">Processing Latency</div>
                <div className="text-xs font-mono font-medium text-safe mt-1">
                  ~18ms Inference
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">Real-time Stream</div>
              </div>
              <div className="p-3 rounded bg-bg-card border border-border col-span-2 sm:col-span-1">
                <div className="label-sm text-[10px]">Active Monitored Feeds</div>
                <div className="text-xs font-mono font-medium text-accent mt-1">
                  2 Optical Feeds
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">Zone 01 & Zone 02</div>
              </div>
            </div>

            <div className="p-3.5 rounded bg-bg-secondary border border-border text-xs text-text-muted flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warn mt-0.5 shrink-0">
                <path d="M12 9v4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              <span>
                Restricted access. All operator actions, incident acknowledgements, and video session logs are cryptographically timestamped and audited.
              </span>
            </div>
          </div>

          {/* Right login card */}
          <div className="lg:col-span-5">
            <div className="card p-6 border-border bg-bg-card">
              <div className="mb-5 flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h2 className="text-base font-semibold text-text-primary">
                    Operator Access
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Sign in to initialize monitoring session
                  </p>
                </div>
                <div className="flex items-center gap-1 p-0.5 rounded bg-bg-tertiary border border-border">
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      tab === 'login'
                        ? 'bg-bg-card text-text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      tab === 'signup'
                        ? 'bg-bg-card text-text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <GoogleButton
                  label={
                    tab === 'signup' ? 'Sign up with Google' : 'Continue with Google'
                  }
                />

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    or operator credentials
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div key={tab}>
                  {tab === 'login' ? <LoginForm /> : <SignupForm />}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border text-[11px] text-text-muted font-mono leading-relaxed">
                SESSION TIER: OPERATOR LEVEL 2 · DEMO & FIREBASE AUTH COMPLIANT
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border px-8 py-3 flex items-center justify-between text-xs text-text-muted font-mono bg-bg-secondary/40">
        <span>© {new Date().getFullYear()} SafeCrowd Systems</span>
        <span>SECURITY OPERATIONS CONSOLE · INTERNAL USE ONLY</span>
      </footer>
    </div>
  );
};

export default Landing;
