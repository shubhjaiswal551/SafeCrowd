import React, { useEffect, useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import StatusBar from '../components/dashboard/StatusBar';
import CameraPanel from '../components/dashboard/CameraPanel';
import HeatmapGrid from '../components/dashboard/HeatmapGrid';
import AlertFeed from '../components/dashboard/AlertFeed';
import { useAuth } from '../context/AuthContext';
import {
  startCrowdSimulator,
  stopCrowdSimulator,
  onCrowdEvent,
  onAlert,
  onIncident,
  onHeatmap,
  getInitialCameras,
  getInitialHeatmaps,
} from '../mocks/crowdSimulator';
import type {
  CameraState,
  Alert,
  Incident,
  CameraHeatmap,
} from '../types/crowdEvent';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type HeadcountPoint = { t: string; cam001: number; cam002: number };

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [cameras, setCameras] = useState<CameraState[]>(() => getInitialCameras());
  const [heatmaps, setHeatmaps] = useState<CameraHeatmap[]>(() =>
    getInitialHeatmaps(),
  );
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [history, setHistory] = useState<HeadcountPoint[]>(() => {
    const arr: HeadcountPoint[] = [];
    const now = Date.now();
    for (let i = 11; i >= 0; i--) {
      const t = new Date(now - i * 30_000);
      const hh = t.getHours().toString().padStart(2, '0');
      const mm = t.getMinutes().toString().padStart(2, '0');
      const ss = t.getSeconds().toString().padStart(2, '0');
      arr.push({
        t: `${hh}:${mm}:${ss}`,
        cam001: 30 + Math.round(Math.random() * 60),
        cam002: 40 + Math.round(Math.random() * 70),
      });
    }
    return arr;
  });

  useEffect(() => {
    startCrowdSimulator();
    const offs: Array<() => void> = [];
    const eventMap: Record<string, CameraState> = {};
    cameras.forEach((c) => (eventMap[c.cameraId] = c));

    offs.push(
      onCrowdEvent((ev) => {
        setCameras((prev) => {
          const next = prev.map((c) =>
            c.cameraId === ev.cameraId
              ? {
                  ...c,
                  headcount: ev.headcount,
                  density: ev.density,
                  flowDirection: ev.flowDirection,
                  lastUpdated: ev.timestamp,
                  lastUpdatedAgo: 0,
                }
              : c,
          );
          return next;
        });
      }),
    );

    offs.push(
      onAlert((alt) =>
        setAlerts((prev) => [alt, ...prev].slice(0, 50)),
      ),
    );
    offs.push(
      onIncident((inc) =>
        setIncidents((prev) => [inc, ...prev].slice(0, 100)),
      ),
    );
    offs.push(
      onHeatmap((hm) => {
        setHeatmaps((prev) => {
          const exists = prev.some((p) => p.cameraId === hm.cameraId);
          if (exists) return prev.map((p) => (p.cameraId === hm.cameraId ? hm : p));
          return [...prev, hm];
        });
      }),
    );

    const ticker = window.setInterval(() => {
      setCameras((prev) =>
        prev.map((c) => ({ ...c, lastUpdatedAgo: c.lastUpdatedAgo + 1 })),
      );
    }, 1000);

    const historyTicker = window.setInterval(() => {
      setHistory((prev) => {
        const t = new Date();
        const hh = t.getHours().toString().padStart(2, '0');
        const mm = t.getMinutes().toString().padStart(2, '0');
        const ss = t.getSeconds().toString().padStart(2, '0');
        setCameras((cs) => {
          const c1 = cs.find((c) => c.cameraId === 'cam-001')?.headcount ?? 50;
          const c2 = cs.find((c) => c.cameraId === 'cam-002')?.headcount ?? 60;
          const next: HeadcountPoint = {
            t: `${hh}:${mm}:${ss}`,
            cam001: c1,
            cam002: c2,
          };
          setHistory((prev2) => [...prev2.slice(1), next]);
          return cs;
        });
        return prev;
      });
    }, 15_000);

    return () => {
      stopCrowdSimulator();
      offs.forEach((fn) => fn());
      clearInterval(ticker);
      clearInterval(historyTicker);
    };
  }, []);

  const handleAcknowledgeAlert = (id: string) => {
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

  const cam1 = cameras.find((c) => c.cameraId === 'cam-001');
  const cam2 = cameras.find((c) => c.cameraId === 'cam-002');
  const hm1 = heatmaps.find((h) => h.cameraId === 'cam-001');
  const hm2 = heatmaps.find((h) => h.cameraId === 'cam-002');

  const totalHeadcount = cameras.reduce((a, b) => a + b.headcount, 0);
  const criticalCameras = cameras.filter((c) => c.density === 'critical').length;
  const highCameras = cameras.filter((c) => c.density === 'high').length;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-bg-primary">
      <Sidebar alertCount={unacknowledged} />
      <div className="flex-1 flex flex-col min-w-0">
        <StatusBar activeAlertCount={unacknowledged} />

        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'People Tracked',
                  value: totalHeadcount.toLocaleString(),
                  sub: 'across all zones',
                  accent: 'text-accent',
                  chipClass: 'chip bg-accent-bg border-accent/30 text-accent-light',
                  chipText: 'LIVE',
                },
                {
                  label: 'Active Alerts',
                  value: String(unacknowledged),
                  sub: incidents.length + ' logged today',
                  accent:
                    unacknowledged > 0
                      ? 'text-danger-light text-shadow-glow-danger'
                      : 'text-safe-light',
                  chipClass:
                    unacknowledged > 0 ? 'chip-danger' : 'chip-safe',
                  chipText: unacknowledged > 0 ? 'UNACK' : 'CLEAR',
                },
                {
                  label: 'Critical Density',
                  value: String(criticalCameras),
                  sub: highCameras + ' zones at high density',
                  accent:
                    criticalCameras > 0 ? 'text-critical-light' : 'text-safe-light',
                  chipClass:
                    criticalCameras > 0 ? 'chip-critical' : 'chip-safe',
                  chipText: criticalCameras > 0 ? 'WATCH' : 'OK',
                },
                {
                  label: 'Cameras Online',
                  value: cameras.length + ' / ' + cameras.length,
                  sub: 'pipeline nominal',
                  accent: 'text-safe-light',
                  chipClass: 'chip-safe',
                  chipText: '100%',
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="card p-4 flex flex-col gap-1 relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(45,53,72,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(45,53,72,0.2) 1px, transparent 1px)',
                      backgroundSize: '12px 12px',
                    }}
                  />
                  <div className="relative flex items-start justify-between">
                    <span className="label-sm">{s.label}</span>
                    <span className={s.chipClass}>{s.chipText}</span>
                  </div>
                  <div
                    className={`relative mono text-2xl font-semibold ${s.accent}`}
                  >
                    {s.value}
                  </div>
                  <div className="relative text-[11px] text-text-muted">
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2 space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {cam1 && (
                    <CameraPanel
                      cameraId={cam1.cameraId}
                      zoneName={cam1.zoneName}
                      description={cam1.description}
                      headcount={cam1.headcount}
                      density={cam1.density}
                      flowDirection={cam1.flowDirection}
                      lastUpdatedAgo={cam1.lastUpdatedAgo}
                      videoSrc="/12269404_2320_1080_30fps.mp4"
                      anomaly={alerts.find(
                        (a) =>
                          !a.acknowledged && a.cameraId === cam1.cameraId,
                      )
                        ? true
                        : false}
                      anomalyType={
                        alerts.find(
                          (a) =>
                            !a.acknowledged && a.cameraId === cam1.cameraId,
                        )?.type
                      }
                    />
                  )}
                  {cam2 && (
                    <CameraPanel
                      cameraId={cam2.cameraId}
                      zoneName={cam2.zoneName}
                      description={cam2.description}
                      headcount={cam2.headcount}
                      density={cam2.density}
                      flowDirection={cam2.flowDirection}
                      lastUpdatedAgo={cam2.lastUpdatedAgo}
                      videoSrc="/5287069-sd_960_540_30fps.mp4"
                      anomaly={alerts.find(
                        (a) =>
                          !a.acknowledged && a.cameraId === cam2.cameraId,
                      )
                        ? true
                        : false}
                      anomalyType={
                        alerts.find(
                          (a) =>
                            !a.acknowledged && a.cameraId === cam2.cameraId,
                        )?.type
                      }
                    />
                  )}
                </div>

                <div className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        Headcount Trend
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        Rolling 3-minute window per camera
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-accent" />
                        Main Entrance
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-warn" />
                        Central Courtyard
                      </span>
                    </div>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={history}
                        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#242a38"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="t"
                          stroke="#5a6578"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          fontFamily="JetBrains Mono, ui-monospace, Consolas, monospace"
                        />
                        <YAxis
                          stroke="#5a6578"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          fontFamily="JetBrains Mono, ui-monospace, Consolas, monospace"
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#161a23',
                            border: '1px solid #2d3548',
                            borderRadius: 6,
                            fontSize: 12,
                            color: '#e6e9f0',
                          }}
                          labelStyle={{
                            color: '#94a0b8',
                            fontFamily: 'JetBrains Mono, ui-monospace, Consolas, monospace',
                          }}
                          itemStyle={{
                            fontFamily: 'JetBrains Mono, ui-monospace, Consolas, monospace',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="cam001"
                          name="Main Entrance"
                          stroke="#22d3ee"
                          strokeWidth={2}
                          fill="url(#g1)"
                        />
                        <Area
                          type="monotone"
                          dataKey="cam002"
                          name="Central Courtyard"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          fill="url(#g2)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {hm1 && cam1 && (
                    <HeatmapGrid
                      title={`${cam1.zoneName} · Density`}
                      subtitle="Real-time concentration heatmap"
                      grid={hm1.grid}
                    />
                  )}
                  {hm2 && cam2 && (
                    <HeatmapGrid
                      title={`${cam2.zoneName} · Density`}
                      subtitle="Real-time concentration heatmap"
                      grid={hm2.grid}
                    />
                  )}
                </div>
              </div>

              <div className="h-[800px] xl:h-auto">
                <AlertFeed
                  alerts={alerts}
                  onAcknowledge={handleAcknowledgeAlert}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
