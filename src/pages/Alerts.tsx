import React, { useEffect, useState } from 'react';
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

  const unacknowledged = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-bg-primary">
      <Sidebar alertCount={unacknowledged} />
      <div className="flex-1 flex flex-col min-w-0">
        <StatusBar activeAlertCount={unacknowledged} />

        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-5 h-full flex flex-col min-h-0">
            <div className="flex items-end justify-between mb-5 shrink-0">
              <div>
                <h1 className="text-xl font-semibold text-text-primary">
                  Alerts
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Live anomaly feed from all monitored zones.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip-danger">
                  {unacknowledged} Unacknowledged
                </span>
                <span className="chip bg-bg-tertiary text-text-secondary border-border">
                  Total {alerts.length}
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <AlertFeed
                alerts={alerts}
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
