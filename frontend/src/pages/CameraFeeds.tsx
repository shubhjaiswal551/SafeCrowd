import React, { useEffect, useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import StatusBar from '../components/dashboard/StatusBar';
import CameraPanel from '../components/dashboard/CameraPanel';
import HeatmapGrid from '../components/dashboard/HeatmapGrid';
import ZoneCalibrationModal from '../components/dashboard/ZoneCalibrationModal';
import { useCrowdStream } from '../hooks/useCrowdStream';
import {
  startCrowdSimulator,
  stopCrowdSimulator,
  onCrowdEvent,
  onHeatmap,
  onAlert,
  getInitialCameras,
  getInitialHeatmaps,
} from '../mocks/crowdSimulator';
import type { CameraState, CameraHeatmap, Alert, CrowdEvent } from '../types/crowdEvent';

type LayoutMode = 'grid' | 'focus';

const CameraFeeds: React.FC = () => {
  const [cameras, setCameras] = useState<CameraState[]>(() => getInitialCameras());
  const [heatmaps, setHeatmaps] = useState<CameraHeatmap[]>(() =>
    getInitialHeatmaps(),
  );
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [layout, setLayout] = useState<LayoutMode>('grid');
  const [focusId, setFocusId] = useState<string>('cam-001');
  const [calibratingCamera, setCalibratingCamera] = useState<CameraState | null>(null);

  const handleWsEvent = (ev: CrowdEvent) => {
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
    if ((ev as any).heatmap) {
      setHeatmaps((prev) => {
        const hm: CameraHeatmap = { cameraId: ev.cameraId, grid: (ev as any).heatmap };
        const exists = prev.some((p) => p.cameraId === ev.cameraId);
        if (exists) return prev.map((p) => (p.cameraId === ev.cameraId ? hm : p));
        return [...prev, hm];
      });
    }
  };

  useCrowdStream(handleWsEvent);

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

  const displayedCameras = layout === 'focus'
    ? cameras.filter((c) => c.cameraId === focusId)
    : cameras;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-bg-primary">
      <Sidebar alertCount={unacknowledged} />
      <div className="flex-1 flex flex-col min-w-0">
        <StatusBar activeAlertCount={unacknowledged} />

        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-base font-semibold text-text-primary uppercase tracking-wider font-mono">
                    OPTICAL SURVEILLANCE MATRIX
                  </h1>
                  <span className="chip-safe font-mono">2 / 2 ONLINE</span>
                </div>
                <p className="text-xs text-text-muted mt-0.5 font-mono">
                  Continuous RTSP optical surveillance feeds with real-time vector inference.
                </p>
              </div>

              {/* View Layout Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 rounded bg-bg-secondary border border-border text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setLayout('grid')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      layout === 'grid'
                        ? 'bg-bg-tertiary text-text-primary font-semibold'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    MATRIX (2×2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout('focus')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      layout === 'focus'
                        ? 'bg-bg-tertiary text-text-primary font-semibold'
                        : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    FOCUS SINGLE
                  </button>
                </div>

                {layout === 'focus' && (
                  <select
                    value={focusId}
                    onChange={(e) => setFocusId(e.target.value)}
                    className="input-field text-xs font-mono py-1 px-2 w-auto"
                  >
                    {cameras.map((c) => (
                      <option key={c.cameraId} value={c.cameraId}>
                        {c.zoneName} ({c.cameraId.toUpperCase()})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className={`grid gap-5 ${layout === 'focus' ? 'grid-cols-1 max-w-4xl mx-auto' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {displayedCameras.map((cam) => {
                const hm = heatmaps.find((h) => h.cameraId === cam.cameraId);
                const hasActiveAnomaly = alerts.find(
                  (a) => !a.acknowledged && a.cameraId === cam.cameraId,
                );
                return (
                  <div key={cam.cameraId} className="space-y-4">
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
                      onCalibrateZone={() => setCalibratingCamera(cam)}
                    />
                    {hm && (
                      <HeatmapGrid
                        title={`${cam.zoneName} · DENSITY MATRIX`}
                        subtitle="Real-time 5×5 spatial concentration telemetry"
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

      {calibratingCamera && (
        <ZoneCalibrationModal
          cameraId={calibratingCamera.cameraId}
          cameraName={calibratingCamera.zoneName}
          videoSrc={
            calibratingCamera.cameraId === 'cam-001'
              ? '/12269404_2320_1080_30fps.mp4'
              : '/5287069-sd_960_540_30fps.mp4'
          }
          onClose={() => setCalibratingCamera(null)}
          onZoneCreated={(newZone) => {
            setCameras((prev) =>
              prev.map((c) =>
                c.cameraId === newZone.camera_id
                  ? { ...c, zoneName: newZone.name }
                  : c,
              ),
            );
          }}
        />
      )}
    </div>
  );
};

export default CameraFeeds;
