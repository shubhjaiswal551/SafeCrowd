import React, { useRef, useEffect } from 'react';
import AlertCard from './AlertCard';
import type { Alert } from '../../types/crowdEvent';

interface AlertFeedProps {
  alerts: Alert[];
  onAcknowledge?: (id: string) => void;
  onViewSnapshot?: (id: string) => void;
}

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
    <div className="w-14 h-14 rounded-full border border-safe/30 bg-safe-bg flex items-center justify-center mb-4 shadow-glow-safe">
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-safe-light"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </div>
    <div className="text-sm font-medium text-text-primary">No active alerts</div>
    <div className="text-xs text-text-muted mt-1 max-w-xs">
      All monitored zones are operating within normal parameters. Any new
      anomalies will appear here instantly.
    </div>
  </div>
);

const AlertFeed: React.FC<AlertFeedProps> = ({
  alerts,
  onAcknowledge,
  onViewSnapshot,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(alerts.length);

  useEffect(() => {
    if (alerts.length > prevCount.current && scrollerRef.current) {
      scrollerRef.current.scrollTop = 0;
    }
    prevCount.current = alerts.length;
  }, [alerts.length]);

  const unacknowledged = alerts.filter((a) => !a.acknowledged).length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <div className="card flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-medium text-text-primary">
              Live Alert Feed
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">
              Simulated anomalies · auto-refresh
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="chip-critical">
              <span className="w-1.5 h-1.5 rounded-full bg-critical animate-pulse" />
              {criticalCount} Critical
            </span>
          )}
          {unacknowledged > 0 && (
            <span className="chip-danger">
              {unacknowledged} Unacknowledged
            </span>
          )}
          {alerts.length > 0 && (
            <span className="text-[11px] text-text-muted mono">
              total {alerts.length}
            </span>
          )}
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0"
      >
        {alerts.length === 0 ? (
          <EmptyState />
        ) : (
          alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={onAcknowledge}
              onViewSnapshot={onViewSnapshot}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AlertFeed;
