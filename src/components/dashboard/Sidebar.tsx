import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NavIcon = {
  Dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  Cameras: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h13a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
      <path d="m22 8-5 4 5 4V8z" />
    </svg>
  ),
  Alerts: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  Incidents: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6M9 9h2" />
    </svg>
  ),
  Settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.16.37.25.77.25 1.18 0 .41-.09.81-.25 1.18" />
    </svg>
  ),
};

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: NavIcon.Dashboard },
  { to: '/cameras', label: 'Camera Feeds', icon: NavIcon.Cameras },
  { to: '/alerts', label: 'Alerts', icon: NavIcon.Alerts },
  { to: '/incidents', label: 'Incident Log', icon: NavIcon.Incidents },
  { to: '/settings', label: 'Settings', icon: NavIcon.Settings },
];

interface SidebarProps {
  alertCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ alertCount = 0 }) => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const isActive = (to: string) => {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(to);
  };

  return (
    <aside className="w-64 shrink-0 h-full flex flex-col bg-bg-secondary/95 backdrop-blur-md border-r border-border-subtle shadow-xl">
      <div className="px-5 py-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl border border-accent/40 bg-accent-bg flex items-center justify-center shadow-glow-accent">
            <svg width="22" height="22" viewBox="0 0 24 24" className="text-accent">
              <path
                fill="currentColor"
                d="M12 2C7.58 2 4 5.58 4 10c0 5.25 6.35 10.56 7.27 11.29a1 1 0 0 0 1.46 0C13.65 20.56 20 15.25 20 10c0-4.42-3.58-8-8-8zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
              />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-text-primary font-bold tracking-wide text-base font-sans">
              SafeCrowd
            </span>
            <span className="text-[9px] uppercase tracking-[0.22em] text-text-muted font-mono font-semibold">
              Command Center
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.to);
          const showBadge = item.to === '/alerts' && alertCount > 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-accent-bg text-accent border border-accent/40 shadow-glow-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/60 border border-transparent'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-accent" />
              )}
              <span className={active ? 'text-accent' : 'text-text-muted'}>
                {item.icon}
              </span>
              <span className="flex-1 font-sans">{item.label}</span>
              {showBadge && (
                <span className="min-w-[20px] h-[20px] px-1.5 rounded-full bg-danger text-[11px] font-bold text-white flex items-center justify-center shadow-glow-danger animate-pulse">
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-subtle space-y-3 bg-bg-primary/40">
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-tertiary/40 border border-border-subtle">
          <div className="w-9 h-9 rounded-full bg-bg-tertiary border border-accent/30 flex items-center justify-center overflow-hidden shrink-0">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-accent">
                {profile?.displayName?.[0]?.toUpperCase() ?? 'O'}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-text-primary truncate font-semibold">
              {profile?.displayName ?? 'Operator'}
            </div>
            <div className="text-[10px] text-text-muted truncate capitalize mono">
              {profile?.role ?? 'operator'}
            </div>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                     text-xs text-text-secondary hover:text-danger-light hover:bg-danger-bg
                     border border-border-subtle hover:border-danger/30 transition-all duration-150 font-medium"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
