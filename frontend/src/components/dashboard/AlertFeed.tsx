import React, { useRef, useEffect, useState } from 'react';
import AlertCard from './AlertCard';
import SnapshotModal from './SnapshotModal';
import { playChime } from '../../lib/sound';
import type { Alert } from '../../types/crowdEvent';

interface AlertFeedProps {
  alerts: Alert[];
  onAcknowledge?: (id: string) => void;
  onViewSnapshot?: (id: string) => void;
  onResolve?: (id: string, notes: string, isFalsePositive: boolean) => void;
}

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="w-10 h-10 rounded border border-border bg-bg-secondary flex items-center justify-center mb-3">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-safe"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </div>
    <div className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">
      ALL MONITORED ZONES CLEAR
    </div>
    <div className="text-[11px] text-text-muted mt-1 max-w-xs leading-relaxed">
      Continuous vector surveillance active. Anomalies and surge thresholds will stream here automatically.
    </div>
  </div>
);

const AlertFeed: React.FC<AlertFeedProps> = ({
  alerts,
  onAcknowledge,
  onViewSnapshot,
  onResolve,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(alerts.length);
  const [snapshotAlert, setSnapshotAlert] = useState<Alert | null>(null);

  useEffect(() => {
    if (alerts.length > prevCount.current) {
      if (scrollerRef.current) {
        scrollerRef.current.scrollTop = 0;
      }
      const newest = alerts[0];
      if (newest && !newest.acknowledged) {
        playChime(newest.severity);
      }
    }
    prevCount.current = alerts.length;
  }, [alerts]);

  const handleSnapshotClick = (id: string) => {
    if (onViewSnapshot) {
      onViewSnapshot(id);
    }
    const target = alerts.find((a) => a.id === id);
    if (target) {
      setSnapshotAlert(target);
    }
  };

  const unacknowledged = alerts.filter((a) => !a.acknowledged).length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <>
      <div className="card flex flex-col h-full min-h-0 bg-bg-card border border-border">
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between bg-bg-secondary">
          <div>
            <div className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">
              ACTIVE INCIDENT STREAM
            </div>
            <div className="text-[10px] text-text-muted">
              Live anomaly pipeline triage
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            {criticalCount > 0 && (
              <span className="chip-critical">
                {criticalCount} CRIT
              </span>
            )}
            {unacknowledged > 0 && (
              <span className="chip-danger">
                {unacknowledged} UNACK
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-bg-tertiary border border-border text-text-muted">
              TOTAL {alerts.length}
            </span>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto p-2.5 space-y-2 min-h-0"
        >
          {alerts.length === 0 ? (
            <EmptyState />
          ) : (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={onAcknowledge}
                onViewSnapshot={handleSnapshotClick}
              />
            ))
          )}
        </div>
      </div>

      {snapshotAlert && (
        <SnapshotModal
          alert={snapshotAlert}
          onClose={() => setSnapshotAlert(null)}
          onAcknowledge={onAcknowledge}
          onResolve={onResolve}
        />
      )}
    </>
  );
};

export default AlertFeed;
