import React, { useEffect, useState } from 'react';
import { toggleSound, isSoundEnabled } from '../../lib/sound';

interface StatusBarProps {
  activeAlertCount: number;
  onOpenNotifications?: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({
  activeAlertCount,
  onOpenNotifications,
}) => {
  const [now, setNow] = useState(new Date());
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const hasAlerts = activeAlertCount > 0;
  const systemStatusLabel = hasAlerts
    ? activeAlertCount === 1
      ? '1 UNRESOLVED INCIDENT'
      : `${activeAlertCount} UNRESOLVED INCIDENTS`
    : 'ALL SYSTEMS NOMINAL';

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
    <header className="h-12 shrink-0 flex items-center justify-between px-5 border-b border-border bg-bg-secondary">
      <div className="flex items-center gap-3">
        <div
          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-[11px] font-mono font-semibold tracking-wider border ${
            hasAlerts
              ? 'bg-danger-bg text-danger-light border-danger/40'
              : 'bg-safe-bg text-safe-light border-safe/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              hasAlerts ? 'bg-danger animate-pulse' : 'bg-safe'
            }`}
          />
          {systemStatusLabel}
        </div>

        <div className="hidden lg:flex items-center gap-3 text-xs text-text-muted font-mono">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-bg-tertiary border border-border text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-safe" />
            <span>2 / 2 FEEDS ONLINE</span>
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-bg-tertiary border border-border text-[10px]">
            <span>ENGINE: YOLOv8 · 18ms INFERENCE</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Audio Alert Toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          title={soundOn ? 'Mute audible alarms' : 'Enable audible alarms'}
          className={`px-2.5 py-1 rounded border text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
            soundOn
              ? 'bg-bg-tertiary border-border text-text-primary hover:border-text-secondary'
              : 'bg-warn-bg border-warn/30 text-warn-light'
          }`}
        >
          {soundOn ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <span>AUDIO ON</span>
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
              <span>MUTED</span>
            </>
          )}
        </button>

        <div className="h-5 w-px bg-border" />

        <div className="text-right tabular-nums">
          <div className="mono text-xs font-semibold text-text-primary leading-tight">
            {timeStr}
          </div>
          <div className="text-[9px] font-mono text-text-muted leading-tight uppercase">
            {dateStr}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative w-8 h-8 rounded flex items-center justify-center
                     border border-border bg-bg-tertiary text-text-secondary
                     hover:text-text-primary hover:border-text-secondary transition-colors"
          aria-label="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded bg-danger text-[9px] font-bold text-white flex items-center justify-center border border-bg-primary">
              {activeAlertCount > 99 ? '99+' : activeAlertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default StatusBar;
