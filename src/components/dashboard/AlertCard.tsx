import React from 'react';
import type { Alert, AlertSeverity } from '../../types/crowdEvent';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
  onViewSnapshot?: (id: string) => void;
}

const severityConfig: Record<
  AlertSeverity,
  {
    label: string;
    chipClass: string;
    dotColor: string;
    dotGlow: string;
    borderColor: string;
    bgAccent: string;
  }
> = {
  info: {
    label: 'INFO',
    chipClass: 'chip-safe',
    dotColor: 'bg-safe',
    dotGlow: 'shadow-glow-safe',
    borderColor: 'border-safe/20',
    bgAccent: 'bg-safe/[0.02]',
  },
  warning: {
    label: 'WARN',
    chipClass: 'chip-warn',
    dotColor: 'bg-warn',
    dotGlow: 'shadow-glow-warn',
    borderColor: 'border-warn/30',
    bgAccent: 'bg-warn/[0.03]',
  },
  high: {
    label: 'HIGH',
    chipClass: 'chip-danger',
    dotColor: 'bg-danger',
    dotGlow: 'shadow-glow-danger',
    borderColor: 'border-danger/40',
    bgAccent: 'bg-danger/[0.04]',
  },
  critical: {
    label: 'CRIT',
    chipClass: 'chip-critical',
    dotColor: 'bg-critical animate-pulse',
    dotGlow: 'shadow-glow-danger',
    borderColor: 'border-critical/50',
    bgAccent: 'bg-critical/[0.06]',
  },
};

const formatRelative = (iso: string): string => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 1) return 'now';
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  const m = diff / 60;
  if (m < 60) return `${Math.floor(m)}m ago`;
  const h = m / 60;
  return `${Math.floor(h)}h ago`;
};

const SeverityIcon: React.FC<{ severity: AlertSeverity }> = ({ severity }) => {
  if (severity === 'critical' || severity === 'high') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  if (severity === 'warning') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
};

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAcknowledge,
  onViewSnapshot,
}) => {
  const cfg = severityConfig[alert.severity];

  return (
    <article
      className={`relative p-4 rounded-md border bg-bg-card ${cfg.borderColor} ${cfg.bgAccent} animate-slide-in`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-2.5 h-2.5 shrink-0 rounded-full ${cfg.dotColor} ${cfg.dotGlow}`} />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start gap-2 flex-wrap">
            <span
              className={`${cfg.chipClass} shrink-0`}
              title={`Severity: ${alert.severity}`}
            >
              <SeverityIcon severity={alert.severity} />
              {cfg.label}
            </span>
            <span className="text-xs font-medium text-text-primary truncate min-w-0">
              {alert.type}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7 16 12l-5-3-8 6v2h18V7z" />
              </svg>
              <span className="truncate">{alert.zoneName}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 mono">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formatRelative(alert.timestamp)}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onViewSnapshot?.(alert.id)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium
                         bg-bg-tertiary border border-border text-text-secondary
                         hover:text-text-primary hover:border-border-strong transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              View Snapshot
            </button>
            {!alert.acknowledged && onAcknowledge && (
              <button
                type="button"
                onClick={() => onAcknowledge(alert.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium
                           bg-accent-bg border border-accent/40 text-accent
                           hover:bg-accent hover:text-bg-primary transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Acknowledge
              </button>
            )}
            {alert.acknowledged && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-safe-bg text-safe-light border border-safe/30">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Acknowledged
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default AlertCard;
