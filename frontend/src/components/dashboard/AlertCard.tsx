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
    borderColor: string;
    bgAccent: string;
  }
> = {
  info: {
    label: 'INFO',
    chipClass: 'chip-safe',
    dotColor: 'bg-safe',
    borderColor: 'border-border',
    bgAccent: 'bg-bg-card',
  },
  warning: {
    label: 'WARN',
    chipClass: 'chip-warn',
    dotColor: 'bg-warn',
    borderColor: 'border-warn/30',
    bgAccent: 'bg-warn-bg/20',
  },
  high: {
    label: 'HIGH',
    chipClass: 'chip-danger',
    dotColor: 'bg-danger',
    borderColor: 'border-danger/40',
    bgAccent: 'bg-danger-bg/20',
  },
  critical: {
    label: 'CRIT',
    chipClass: 'chip-critical',
    dotColor: 'bg-critical',
    borderColor: 'border-critical/50',
    bgAccent: 'bg-critical-bg/30',
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
      className={`relative p-3 rounded-md border ${cfg.borderColor} ${cfg.bgAccent} animate-fade-in`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`mt-1 w-2 h-2 shrink-0 rounded-full ${cfg.dotColor}`} />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start gap-2 flex-wrap">
            <span
              className={`${cfg.chipClass} shrink-0`}
              title={`Severity: ${alert.severity}`}
            >
              <SeverityIcon severity={alert.severity} />
              {cfg.label}
            </span>
            <span className="text-xs font-semibold text-text-primary truncate min-w-0">
              {alert.type}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-text-muted font-mono">
            <span className="inline-flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 7 16 12l-5-3-8 6v2h18V7z" />
              </svg>
              <span className="truncate">{alert.zoneName}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formatRelative(alert.timestamp)}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => onViewSnapshot?.(alert.id)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-medium
                         bg-bg-tertiary border border-border text-text-secondary
                         hover:text-text-primary hover:border-text-secondary transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              Snapshot
            </button>
            {!alert.acknowledged && onAcknowledge && (
              <button
                type="button"
                onClick={() => onAcknowledge(alert.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-medium
                           bg-accent text-white hover:bg-accent-dark transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Acknowledge
              </button>
            )}
            {alert.acknowledged && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-safe-light bg-safe-bg border border-safe/30">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                ACKNOWLEDGED
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default AlertCard;
