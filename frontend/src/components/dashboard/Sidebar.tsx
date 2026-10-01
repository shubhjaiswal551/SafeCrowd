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
    <aside className="w-60 shrink-0 h-full flex flex-col bg-bg-secondary border-r border-border">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-accent/15 border border-accent/40 flex items-center justify-center text-accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 6.35 10.56 7.27 11.29a1 1 0 0 0 1.46 0C13.65 20.56 20 15.25 20 10c0-4.42-3.58-8-8-8zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-text-primary font-semibold tracking-tight text-sm font-sans">
              SafeCrowd
            </span>
            <span className="text-[9px] uppercase tracking-wider text-text-muted font-mono font-semibold">
              Control Station
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.to);
          const showBadge = item.to === '/alerts' && alertCount > 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                active
                  ? 'bg-accent/10 text-white border border-accent/30 font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent'
              }`}
            >
              <span className={active ? 'text-accent' : 'text-text-muted'}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="min-w-[18px] h-[18px] px-1 rounded bg-danger text-[10px] font-mono font-bold text-white flex items-center justify-center">
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-2.5 bg-bg-card/50">
        <div className="flex items-center gap-2.5 p-2 rounded bg-bg-tertiary border border-border">
          <div className="w-7 h-7 rounded bg-bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-accent font-mono">
                {profile?.displayName?.[0]?.toUpperCase() ?? 'O'}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-text-primary truncate font-medium">
              {profile?.displayName ?? 'Operator'}
            </div>
            <div className="text-[9px] text-text-muted truncate capitalize mono">
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
