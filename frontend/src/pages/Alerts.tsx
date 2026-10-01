import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import StatusBar from '../components/dashboard/StatusBar';
import AlertFeed from '../components/dashboard/AlertFeed';
import { useAuth } from '../context/AuthContext';
import {
  startCrowdSimulator,
  stopCrowdSimulator,
  onAlert,
} from '../mocks/crowdSimulator';
import type { Alert } from '../types/crowdEvent';

const Alerts: React.FC = () => {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    startCrowdSimulator();
    const off = onAlert((a) =>
      setAlerts((prev) => [a, ...prev].slice(0, 200)),
    );
    return () => {
      stopCrowdSimulator();
      off();
    };
  }, []);

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              acknowledged: true,
              acknowledgedBy: profile?.displayName ?? 'Operator',
            }
          : a,
      ),
    );
  };

  const handleAcknowledgeAll = () => {
    setAlerts((prev) =>
      prev.map((a) => ({
        ...a,
        acknowledged: true,
        acknowledgedBy: profile?.displayName ?? 'Operator',
      })),
    );
  };

  const filteredAlerts = useMemo(() => {
    if (selectedSeverity === 'all') return alerts;
    return alerts.filter((a) => a.severity === selectedSeverity);
  }, [alerts, selectedSeverity]);

  const unacknowledged = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-bg-primary">
      <Sidebar alertCount={unacknowledged} />
      <div className="flex-1 flex flex-col min-w-0">
        <StatusBar activeAlertCount={unacknowledged} />

        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-5 h-full flex flex-col min-h-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0 pb-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-base font-semibold text-text-primary uppercase tracking-wider font-mono">
                    INCIDENT ALERT TRIAGE
                  </h1>
                  <span className="chip-danger font-mono">
                    {unacknowledged} UNACKNOWLEDGED
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5 font-mono">
                  Real-time spatial anomaly stream and threshold violation triage.
                </p>
              </div>

              {/* Triage action controls */}
              <div className="flex items-center gap-2 font-mono text-xs">
                {/* Severity filter buttons */}
                <div className="flex items-center p-0.5 rounded bg-bg-secondary border border-border">
                  {(['all', 'critical', 'high', 'warning', 'info'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSelectedSeverity(sev)}
                      className={`px-2 py-1 rounded text-[10px] uppercase font-semibold transition-colors ${
                        selectedSeverity === sev
                          ? 'bg-bg-tertiary text-text-primary'
                          : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                {unacknowledged > 0 && (
                  <button
                    type="button"
                    onClick={handleAcknowledgeAll}
                    className="btn-secondary text-[11px] font-mono"
                  >
                    Acknowledge All
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <AlertFeed
                alerts={filteredAlerts}
                onAcknowledge={handleAcknowledge}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Alerts;
