import React, { useEffect, useState } from 'react';

interface StatusBarProps {
  activeAlertCount: number;
  onOpenNotifications?: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({
  activeAlertCount,
  onOpenNotifications,
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hasAlerts = activeAlertCount > 0;
  const systemStatusLabel = hasAlerts
    ? activeAlertCount === 1
      ? '1 active alert'
      : `${activeAlertCount} active alerts`
    : 'All systems nominal';

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString(undefined, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border-subtle bg-bg-secondary/80 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-semibold tracking-wide ${
            hasAlerts
              ? 'bg-danger-bg text-danger-light border-danger/40 shadow-glow-danger'
              : 'bg-safe-bg text-safe-light border-safe/30'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              hasAlerts
                ? 'bg-danger animate-pulse'
                : 'bg-safe shadow-glow-safe'
            }`}
          />
          {systemStatusLabel}
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
            <span className="text-text-secondary">2 / 2 Feeds Active</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Latency <span className="mono text-accent text-xs">~32ms</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="text-right tabular-nums">
          <div className="mono text-sm font-bold text-text-primary leading-tight tracking-wider">
            {timeStr}
          </div>
          <div className="text-[10px] text-text-muted leading-tight font-medium uppercase tracking-wider">
            {dateStr}
          </div>
        </div>

        <div className="h-7 w-px bg-border-subtle" />

        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center
                     border border-border-subtle bg-bg-tertiary/60 text-text-secondary
                     hover:text-text-primary hover:border-accent/40 hover:bg-bg-tertiary transition-all duration-150"
          aria-label="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-[10px] font-bold text-white flex items-center justify-center shadow-glow-danger border border-bg-primary">
              {activeAlertCount > 99 ? '99+' : activeAlertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default StatusBar;
