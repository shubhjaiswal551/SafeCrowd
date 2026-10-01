import React, { useState, useEffect, useRef } from 'react';
import GoogleButton from '../components/auth/GoogleButton';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type AuthTab = 'login' | 'signup';

const AnimatedDotGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const COLS = 32;
    const ROWS = 22;
    const dots: Array<{
      x: number;
      y: number;
      base: number;
      phase: number;
    }> = [];
    const init = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      dots.length = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          dots.push({
            x: (c + 0.5) * (w / COLS),
            y: (r + 0.5) * (h / ROWS),
            base: Math.random(),
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };
    init();
    window.addEventListener('resize', init);

    let t0 = performance.now();
    const render = (now: number) => {
      const t = (now - t0) / 1000;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.1 + d.phase);
        const r = 0.8 + pulse * 1.6 * (0.4 + d.base * 0.6);
        const a = 0.12 + pulse * 0.28;
        const cx = d.x + Math.sin(t * 0.6 + d.phase) * 2;
        const cy = d.y + Math.cos(t * 0.5 + d.phase * 1.3) * 2;
        ctx.fillStyle = `rgba(34, 211, 238, ${a})`;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i];
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 48) {
            const alpha = (1 - dist / 48) * 0.18;
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

const PulseLines: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent animate-scan"
        style={{ top: '10%' }}
      />
    </div>
  );
};

const LogoMark: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 rounded-md border border-accent/40 bg-accent-bg flex items-center justify-center shadow-glow-accent overflow-hidden">
        <svg width="22" height="22" viewBox="0 0 24 24" className="text-accent">
          <path
            fill="currentColor"
            d="M12 2C7.58 2 4 5.58 4 10c0 5.25 6.35 10.56 7.27 11.29a1 1 0 0 0 1.46 0C13.65 20.56 20 15.25 20 10c0-4.42-3.58-8-8-8zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
          />
        </svg>
        <div className="absolute inset-x-0 h-px bg-accent/50 animate-scan" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-text-primary font-semibold tracking-wide text-lg">
          SafeCrowd
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
          Control Room
        </span>
      </div>
    </div>
  );
};

const Landing: React.FC = () => {
  const [tab, setTab] = useState<AuthTab>('login');
  const { loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      const hasDemo = sessionStorage.getItem('safecrowd_demo_user');
      if (hasDemo) navigate('/dashboard', { replace: true });
    }
  }, [loading, navigate]);

  return (
    <div className="relative min-h-screen w-full bg-bg-primary overflow-hidden">
      <div
        className="absolute inset-0 bg-grid-faint bg-grid-md opacity-40"
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34, 211, 238, 0.08), transparent 60%), radial-gradient(ellipse 60% 50% at 85% 90%, rgba(16, 185, 129, 0.06), transparent 60%)',
        }}
        aria-hidden
      />
      <AnimatedDotGrid />
      <PulseLines />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="w-full px-8 py-5 flex items-center justify-between">
          <LogoMark />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-safe animate-pulse shadow-glow-safe" />
            <span className="text-xs uppercase tracking-wider text-text-muted">
              Platform Online
            </span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
            <section className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-bg-secondary/60 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
                <span className="text-xs text-text-secondary">
                  Phase 1 · UI + Demo Dashboard
                </span>
              </div>
              <div className="space-y-4">
                <h1 className="text-[44px] leading-[1.05] tracking-tight font-semibold text-text-primary">
                  Real-time crowd
                  <br />
                  <span className="text-accent">anomaly detection</span>
                  <br />
                  for public safety.
                </h1>
                <p className="text-text-secondary max-w-md leading-relaxed">
                  SafeCrowd monitors CCTV feeds across transit hubs, temples,
                  stadiums and malls — detecting surges, bottlenecks and erratic
                  dispersal before they become incidents.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md">
                <div className="p-3 rounded-md border border-border bg-bg-secondary/50">
                  <div className="mono text-xl text-safe text-shadow-glow-safe">
                    99.2%
                  </div>
                  <div className="label-sm mt-1">Alert Precision</div>
                </div>
                <div className="p-3 rounded-md border border-border bg-bg-secondary/50">
                  <div className="mono text-xl text-accent">{'<'}250ms</div>
                  <div className="label-sm mt-1">Detection Latency</div>
                </div>
                <div className="p-3 rounded-md border border-border bg-bg-secondary/50">
                  <div className="mono text-xl text-warn-light">24/7</div>
                  <div className="label-sm mt-1">Live Monitoring</div>
                </div>
              </div>
            </section>

            <section className="card p-7 border-border/80 backdrop-blur-sm bg-bg-card/80 animate-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">
                    Operator Access
                  </h2>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Sign in to access the control room
                  </p>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-md bg-bg-tertiary border border-border">
                  <button
                    onClick={() => setTab('login')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      tab === 'login'
                        ? 'bg-bg-card text-text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setTab('signup')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      tab === 'signup'
                        ? 'bg-bg-card text-text-primary shadow-sm'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <GoogleButton
                  label={
                    tab === 'signup' ? 'Sign up with Google' : 'Continue with Google'
                  }
                />

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] uppercase tracking-wider text-text-muted">
                    or {tab === 'signup' ? 'create' : 'use'} account
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div key={tab} className="animate-fade-in">
                  {tab === 'login' ? <LoginForm /> : <SignupForm />}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-border-subtle text-[11px] text-text-muted">
                By signing in, you agree that SafeCrowd is a demo security
                monitoring platform and alerts are simulated for evaluation.
              </div>
            </section>
          </div>
        </main>

        <footer className="px-8 py-5 flex items-center justify-between border-t border-border-subtle">
          <span className="text-xs text-text-muted">
            © {new Date().getFullYear()} SafeCrowd
          </span>
          <span className="text-xs text-text-muted">
            Built for control rooms.
          </span>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
