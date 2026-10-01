import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import StatusBar from '../components/dashboard/StatusBar';
import {
  IncidentFilters,
  IncidentTable,
} from '../components/incidents/IncidentTable';
import { useAuth } from '../context/AuthContext';
import {
  startCrowdSimulator,
  stopCrowdSimulator,
  onIncident,
  onAlert,
} from '../mocks/crowdSimulator';
import type { Incident, AlertSeverity, IncidentStatus } from '../types/crowdEvent';

const ZONES = ['Main Entrance Gate', 'Central Courtyard'];

const IncidentLog: React.FC = () => {
  const { profile } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<number>(0);
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedSeverity, setSelectedSeverity] =
    useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    startCrowdSimulator();
    const off1 = onIncident((inc) =>
      setIncidents((prev) => [inc, ...prev].slice(0, 200)),
    );
    const off2 = onAlert(() =>
      setAlerts((n) => n + 1),
    );
    return () => {
      stopCrowdSimulator();
      off1();
      off2();
    };
  }, []);

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      if (selectedZone !== 'all' && inc.zoneName !== selectedZone) return false;
      if (selectedSeverity !== 'all' && inc.severity !== selectedSeverity)
        return false;
      if (selectedStatus !== 'all' && inc.status !== selectedStatus)
        return false;
      if (dateFrom) {
        const d = new Date(inc.timestamp).getTime();
        const f = new Date(dateFrom + 'T00:00:00').getTime();
        if (d < f) return false;
      }
      if (dateTo) {
        const d = new Date(inc.timestamp).getTime();
        const t = new Date(dateTo + 'T23:59:59').getTime();
        if (d > t) return false;
      }
      return true;
    });
  }, [incidents, selectedZone, selectedSeverity, selectedStatus, dateFrom, dateTo]);

  const handleReset = () => {
    setSelectedZone('all');
    setSelectedSeverity('all');
    setSelectedStatus('all');
    setDateFrom('');
    setDateTo('');
  };

  const handleAcknowledge = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: 'acknowledged' as IncidentStatus,
              acknowledgedBy: profile?.displayName ?? 'Operator',
            }
          : inc,
      ),
    );
  };

  const handleResolve = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              status: 'resolved' as IncidentStatus,
              resolvedAt: new Date().toISOString(),
            }
          : inc,
      ),
    );
  };

  const bySeverity = useMemo(() => {
    const s: Record<AlertSeverity, number> = {
      critical: 0,
      high: 0,
      warning: 0,
      info: 0,
    };
    incidents.forEach((i) => (s[i.severity] = (s[i.severity] || 0) + 1));
    return s;
  }, [incidents]);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-bg-primary">
      <Sidebar alertCount={alerts} />
      <div className="flex-1 flex flex-col min-w-0">
        <StatusBar activeAlertCount={alerts} />

        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-xl font-semibold text-text-primary">
                  Incident Log
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Complete history of anomaly events, acknowledgements and
                  resolutions.
                </p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { k: 'critical', v: bySeverity.critical, cls: 'chip-critical' },
                  { k: 'high', v: bySeverity.high, cls: 'chip-danger' },
                  { k: 'warning', v: bySeverity.warning, cls: 'chip-warn' },
                  { k: 'info', v: bySeverity.info, cls: 'chip-safe' },
                ].map((s) => (
                  <div
                    key={s.k}
                    className="card px-4 py-3 flex items-center gap-3 min-w-[120px]"
                  >
                    <span className={s.cls + ' uppercase'}>{s.k}</span>
                    <span className="mono text-text-primary font-semibold text-lg">
                      {s.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <IncidentFilters
              zones={ZONES}
              selectedZone={selectedZone}
              onZoneChange={setSelectedZone}
              selectedSeverity={selectedSeverity}
              onSeverityChange={setSelectedSeverity}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              dateFrom={dateFrom}
              onDateFromChange={setDateFrom}
              dateTo={dateTo}
              onDateToChange={setDateTo}
              onReset={handleReset}
            />

            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>
                Showing{' '}
                <span className="mono text-text-secondary">{filtered.length}</span>{' '}
                of{' '}
                <span className="mono text-text-secondary">{incidents.length}</span>{' '}
                incidents
              </span>
              <span className="mono">Sorted: newest first</span>
            </div>

            <IncidentTable
              incidents={filtered}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default IncidentLog;
