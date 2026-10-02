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
    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 shadow-sm">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-emerald-600"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
    <div className="text-sm font-semibold text-slate-800 tracking-tight">
      All Monitored Zones Clear
    </div>
    <div className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed font-medium">
      Continuous optical surveillance active. Developing surges and crowd bottlenecks will appear here in real time.
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
      <div className="card flex flex-col h-full min-h-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white/70 backdrop-blur-md">
          <div>
            <div className="text-sm font-semibold text-slate-800 tracking-tight">
              Active Incident Stream
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              Real-time anomaly triage & alerts
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {criticalCount > 0 && (
              <span className="chip-critical font-medium text-[11px]">
                {criticalCount} Critical
              </span>
            )}
            {unacknowledged > 0 && (
              <span className="chip-danger font-medium text-[11px]">
                {unacknowledged} Pending
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]">
              {alerts.length} Total
            </span>
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
