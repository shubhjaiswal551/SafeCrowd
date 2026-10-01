export type DensityLevel = 'low' | 'moderate' | 'high' | 'critical';

export type AlertSeverity = 'info' | 'warning' | 'high' | 'critical';

export type IncidentStatus = 'open' | 'acknowledged' | 'resolved';

export type CrowdEvent = {
  cameraId: string;
  zoneName: string;
  headcount: number;
  density: DensityLevel;
  flowDirection: number;
  anomaly: boolean;
  anomalyType?: string;
  severity?: AlertSeverity;
  timestamp: string;
};

export type HeatmapCell = {
  value: number;
};

export type CameraHeatmap = {
  cameraId: string;
  grid: number[][];
};

export type Alert = {
  id: string;
  cameraId: string;
  zoneName: string;
  type: string;
  severity: AlertSeverity;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  snapshotFrame?: number;
};

export type Incident = {
  id: string;
  timestamp: string;
  cameraId: string;
  zoneName: string;
  alertType: string;
  severity: AlertSeverity;
  status: IncidentStatus;
  acknowledgedBy?: string;
  resolvedAt?: string;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'operator' | 'admin';
  createdAt: string;
  twoFactorEnabled?: boolean;
};

export type CameraState = {
  cameraId: string;
  zoneName: string;
  description: string;
  headcount: number;
  density: DensityLevel;
  flowDirection: number;
  lastUpdated: string;
  lastUpdatedAgo: number;
};
