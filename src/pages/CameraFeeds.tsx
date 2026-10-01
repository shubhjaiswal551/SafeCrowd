import React, { useEffect, useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import StatusBar from '../components/dashboard/StatusBar';
import CameraPanel from '../components/dashboard/CameraPanel';
import HeatmapGrid from '../components/dashboard/HeatmapGrid';
import { useAuth } from '../context/AuthContext';
import {
  startCrowdSimulator,
  stopCrowdSimulator,
  onCrowdEvent,
  onHeatmap,
  onAlert,
  getInitialCameras,
  getInitialHeatmaps,
} from '../mocks/crowdSimulator';
import type { CameraState, CameraHeatmap, Alert } from '../types/crowdEvent';

const CameraFeeds: React.FC = () => {
  const { } = useAuth();
  const [cameras, setCameras] = useState<CameraState[]>(() => getInitialCameras());
  const [heatmaps, setHeatmaps] = useState<CameraHeatmap[]>(() =>
    getInitialHeatmaps(),
  );
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    startCrowdSimulator();
    const off1 = onCrowdEvent((ev) => {
      setCameras((prev) =>
        prev.map((c) =>
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
        ),
      );
    });
    const off2 = onHeatmap((hm) => {
      setHeatmaps((prev) => {
        const exists = prev.some((p) => p.cameraId === hm.cameraId);
        if (exists) return prev.map((p) => (p.cameraId === hm.cameraId ? hm : p));
        return [...prev, hm];
      });
    });
    const off3 = onAlert((a) =>
      setAlerts((prev) => [a, ...prev].slice(0, 50)),
    );
    const ticker = window.setInterval(() => {
      setCameras((prev) =>
        prev.map((c) => ({ ...c, lastUpdatedAgo: c.lastUpdatedAgo + 1 })),
      );
    }, 1000);
    return () => {
      stopCrowdSimulator();
      off1();
      off2();
      off3();
      clearInterval(ticker);
    };
  }, []);

  const unacknowledged = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-bg-primary">
      <Sidebar alertCount={unacknowledged} />
      <div className="flex-1 flex flex-col min-w-0">
        <StatusBar activeAlertCount={unacknowledged} />

        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-xl font-semibold text-text-primary">
                  Camera Feeds
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Live view across all monitored zones with density analytics.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip-safe">
                  <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
                  2 / 2 Online
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {cameras.map((cam) => {
                const hm = heatmaps.find((h) => h.cameraId === cam.cameraId);
                const hasActiveAnomaly = alerts.find(
                  (a) => !a.acknowledged && a.cameraId === cam.cameraId,
                );
                return (
                  <div key={cam.cameraId} className="space-y-5">
                    <CameraPanel
                      cameraId={cam.cameraId}
                      zoneName={cam.zoneName}
                      description={cam.description}
                      headcount={cam.headcount}
                      density={cam.density}
                      flowDirection={cam.flowDirection}
                      lastUpdatedAgo={cam.lastUpdatedAgo}
                      videoSrc={
                        cam.cameraId === 'cam-001'
                          ? '/12269404_2320_1080_30fps.mp4'
                          : '/5287069-sd_960_540_30fps.mp4'
                      }
                      anomaly={!!hasActiveAnomaly}
                      anomalyType={hasActiveAnomaly?.type}
                    />
                    {hm && (
                      <HeatmapGrid
                        title={`${cam.zoneName} · Density Zone`}
                        subtitle="Real-time concentration grid"
                        grid={hm.grid}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CameraFeeds;
