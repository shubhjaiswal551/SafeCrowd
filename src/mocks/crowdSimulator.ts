import type {
  CrowdEvent,
  DensityLevel,
  Alert,
  AlertSeverity,
  Incident,
  CameraHeatmap,
  CameraState,
} from '../types/crowdEvent';

const CAMERAS = [
  {
    cameraId: 'cam-001',
    zoneName: 'Main Entrance Gate',
    description: 'Primary public entry point',
  },
  {
    cameraId: 'cam-002',
    zoneName: 'Central Courtyard',
    description: 'Central gathering zone',
  },
];

const ANOMALY_TYPES: Array<{ type: string; severity: AlertSeverity }> = [
  { type: 'Rapid Converging Flow Detected', severity: 'high' },
  { type: 'Bottleneck Forming', severity: 'warning' },
  { type: 'Sudden Dispersal Pattern', severity: 'warning' },
  { type: 'Density Threshold Exceeded', severity: 'critical' },
  { type: 'Abnormal Flow Direction Shift', severity: 'high' },
  { type: 'Stationary Crowd Build-up', severity: 'warning' },
  { type: 'Potential Stampede Risk', severity: 'critical' },
];

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function densityFromHeadcount(hc: number): DensityLevel {
  if (hc < 40) return 'low';
  if (hc < 90) return 'moderate';
  if (hc < 160) return 'high';
  return 'critical';
}

function generateHeatmap(base: number, size = 5): number[][] {
  const center = Math.floor(size / 2);
  const grid: number[][] = [];
  for (let y = 0; y < size; y++) {
    const row: number[] = [];
    for (let x = 0; x < size; x++) {
      const dist = Math.hypot(x - center, y - center);
      const centerBias = Math.max(0, 1 - dist / (size * 0.75));
      const noise = Math.random() * 0.35;
      const val = clamp(base * (0.4 + centerBias * 0.6) + noise, 0, 1);
      row.push(val);
    }
    grid.push(row);
  }
  return grid;
}

function uid(prefix = ''): string {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 7)
  );
}

interface SimulatorState {
  headcounts: Record<string, number>;
  flows: Record<string, number>;
  nextAnomalyAt: number;
  activeAnomalyCamera: string | null;
  activeAnomalyEndsAt: number;
  listeners: Set<(event: CrowdEvent) => void>;
  alertListeners: Set<(alert: Alert) => void>;
  incidentListeners: Set<(incident: Incident) => void>;
  heatmapListeners: Set<(heatmap: CameraHeatmap) => void>;
}

const state: SimulatorState = {
  headcounts: { 'cam-001': 45, 'cam-002': 62 },
  flows: { 'cam-001': 85, 'cam-002': 260 },
  nextAnomalyAt: Date.now() + 20_000 + Math.random() * 20_000,
  activeAnomalyCamera: null,
  activeAnomalyEndsAt: 0,
  listeners: new Set(),
  alertListeners: new Set(),
  incidentListeners: new Set(),
  heatmapListeners: new Set(),
};

let intervalId: number | null = null;
let tickCount = 0;

function tick() {
  const now = Date.now();
  tickCount++;

  CAMERAS.forEach((cam) => {
    const isAnomalyActive = state.activeAnomalyCamera === cam.cameraId;

    let drift = (Math.random() - 0.5) * 14;
    if (isAnomalyActive) {
      drift += 18 * Math.sin(tickCount / 2) + 6;
    }
    const prev = state.headcounts[cam.cameraId];
    let next = clamp(prev + drift, 10, 220);
    if (isAnomalyActive && next < 130) next = clamp(next + 10, 130, 220);
    state.headcounts[cam.cameraId] = Math.round(next);

    let flowDrift = (Math.random() - 0.5) * 28;
    if (isAnomalyActive) flowDrift += (Math.random() - 0.3) * 90;
    state.flows[cam.cameraId] =
      (state.flows[cam.cameraId] + flowDrift + 360) % 360;

    const density = densityFromHeadcount(state.headcounts[cam.cameraId]);
    let anomalyType: string | undefined;
    let severity: AlertSeverity | undefined;

    if (isAnomalyActive) {
      const pick =
        ANOMALY_TYPES[Math.floor(Math.random() * ANOMALY_TYPES.length)];
      anomalyType = pick.type;
      severity = pick.severity;
    } else if (density === 'critical' && Math.random() < 0.35) {
      anomalyType = 'Density Threshold Exceeded';
      severity = 'critical';
    }

    const event: CrowdEvent = {
      cameraId: cam.cameraId,
      zoneName: cam.zoneName,
      headcount: state.headcounts[cam.cameraId],
      density,
      flowDirection: Math.round(state.flows[cam.cameraId]),
      anomaly: !!anomalyType,
      anomalyType,
      severity,
      timestamp: new Date(now).toISOString(),
    };
    state.listeners.forEach((l) => l(event));

    if (event.anomaly && event.anomalyType && event.severity) {
      const alert: Alert = {
        id: uid('alt_'),
        cameraId: cam.cameraId,
        zoneName: cam.zoneName,
        type: event.anomalyType,
        severity: event.severity,
        timestamp: event.timestamp,
        acknowledged: false,
        snapshotFrame: Math.floor(Math.random() * 100),
      };
      state.alertListeners.forEach((l) => l(alert));

      const incident: Incident = {
        id: uid('inc_'),
        timestamp: event.timestamp,
        cameraId: cam.cameraId,
        zoneName: cam.zoneName,
        alertType: event.anomalyType,
        severity: event.severity,
        status: 'open',
      };
      state.incidentListeners.forEach((l) => l(incident));
    }

    if (tickCount % 2 === 0) {
      const base = clamp(state.headcounts[cam.cameraId] / 220, 0, 1);
      const heatmap: CameraHeatmap = {
        cameraId: cam.cameraId,
        grid: generateHeatmap(base),
      };
      state.heatmapListeners.forEach((l) => l(heatmap));
    }
  });

  if (state.activeAnomalyCamera && now >= state.activeAnomalyEndsAt) {
    state.activeAnomalyCamera = null;
  }

  if (!state.activeAnomalyCamera && now >= state.nextAnomalyAt) {
    const cam = CAMERAS[Math.floor(Math.random() * CAMERAS.length)];
    state.activeAnomalyCamera = cam.cameraId;
    state.activeAnomalyEndsAt = now + 6000 + Math.random() * 8000;
    state.nextAnomalyAt = now + 25_000 + Math.random() * 25_000;
  }
}

export function startCrowdSimulator(): void {
  if (intervalId !== null) return;
  tick();
  intervalId = window.setInterval(tick, 2500);
}

export function stopCrowdSimulator(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function onCrowdEvent(fn: (event: CrowdEvent) => void): () => void {
  state.listeners.add(fn);
  return () => state.listeners.delete(fn);
}

export function onAlert(fn: (alert: Alert) => void): () => void {
  state.alertListeners.add(fn);
  return () => state.alertListeners.delete(fn);
}

export function onIncident(fn: (incident: Incident) => void): () => void {
  state.incidentListeners.add(fn);
  return () => state.incidentListeners.delete(fn);
}

export function onHeatmap(fn: (heatmap: CameraHeatmap) => void): () => void {
  state.heatmapListeners.add(fn);
  return () => state.heatmapListeners.delete(fn);
}

export function getInitialCameras(): CameraState[] {
  const now = Date.now();
  return CAMERAS.map((cam) => ({
    cameraId: cam.cameraId,
    zoneName: cam.zoneName,
    description: cam.description,
    headcount: state.headcounts[cam.cameraId],
    density: densityFromHeadcount(state.headcounts[cam.cameraId]),
    flowDirection: Math.round(state.flows[cam.cameraId]),
    lastUpdated: new Date(now).toISOString(),
    lastUpdatedAgo: 0,
  }));
}

export function getInitialHeatmaps(): CameraHeatmap[] {
  return CAMERAS.map((cam) => {
    const base = clamp(state.headcounts[cam.cameraId] / 220, 0, 1);
    return {
      cameraId: cam.cameraId,
      grid: generateHeatmap(base),
    };
  });
}
