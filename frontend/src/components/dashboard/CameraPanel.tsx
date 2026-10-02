import React, { useRef, useEffect } from 'react';
import type { DensityLevel } from '../../types/crowdEvent';

interface CameraPanelProps {
  cameraId: string;
  zoneName: string;
  description: string;
  headcount: number;
  density: DensityLevel;
  flowDirection: number;
  lastUpdatedAgo: number;
  anomaly?: boolean;
  anomalyType?: string;
  videoSrc?: string;
  onHeadcountChange?: (count: number) => void;
  onCalibrateZone?: () => void;
}

const densityConfig: Record<
  DensityLevel,
  { label: string; className: string }
> = {
  low: {
    label: 'LOW',
    className: 'chip-safe font-mono',
  },
  moderate: {
    label: 'MODERATE',
    className: 'chip-warn font-mono',
  },
  high: {
    label: 'HIGH',
    className: 'chip-danger font-mono',
  },
  critical: {
    label: 'CRITICAL',
    className: 'chip-critical font-mono',
  },
};

const FlowArrow: React.FC<{ degrees: number; density: DensityLevel }> = ({
  degrees,
  density,
}) => {
  const arrowColor =
    density === 'critical'
      ? '#ef4444'
      : density === 'high'
        ? '#f59e0b'
        : density === 'moderate'
          ? '#fbbf24'
          : '#2563eb';
  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className="w-5 h-5 rounded-full border border-border-strong flex items-center justify-center bg-bg-tertiary/80"
        style={{ transform: `rotate(${degrees}deg)` }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path
            d="M5 1 L8 6 L5.5 5.5 L5.5 9 L4.5 9 L4.5 5.5 L2 6 Z"
            fill={arrowColor}
          />
        </svg>
      </div>
      <span className="mono text-xs text-text-secondary">{degrees}°</span>
    </div>
  );
};

interface VideoFeedViewProps {
  videoSrc?: string;
  cameraId: string;
}

const VideoFeedView: React.FC<VideoFeedViewProps> = ({ videoSrc, cameraId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative w-full h-full bg-black">
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m22 8-5 4 5 4V8z" />
            <rect x="2" y="6" width="15" height="12" rx="2" />
          </svg>
          <span>STANDBY · {cameraId.toUpperCase()} WAITING FOR RTSP STREAM</span>
        </div>
      )}

      {/* Surveillance Corner Reticles */}
      <div className="absolute inset-0 pointer-events-none p-2 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="w-3 h-3 border-t-2 border-l-2 border-white/40" />
          <div className="w-3 h-3 border-t-2 border-r-2 border-white/40" />
        </div>
        <div className="flex justify-between items-end">
          <div className="w-3 h-3 border-b-2 border-l-2 border-white/40" />
          <div className="w-3 h-3 border-b-2 border-r-2 border-white/40" />
        </div>
      </div>

      {/* Optical Feed Active Watermark */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 font-mono text-[10px]">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-white/20 text-white/90 backdrop-blur-sm font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
          OPTICAL FEED ONLINE
        </span>
      </div>
    </div>
  );
};

const CameraPanel: React.FC<CameraPanelProps> = ({
  cameraId,
  zoneName,
  description,
  headcount,
  density,
  flowDirection,
  lastUpdatedAgo,
  anomaly,
  anomalyType,
  videoSrc,
  onCalibrateZone,
}) => {
  const dcfg = densityConfig[density];
  const hcRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hcRef.current) {
      hcRef.current.classList.remove('animate-ticker');
      void hcRef.current.offsetWidth;
      hcRef.current.classList.add('animate-ticker');
    }
  }, [headcount]);

  return (
    <div
      className={`card relative overflow-hidden transition-colors duration-200 ${
        anomaly ? 'border-danger/70 ring-1 ring-danger/40' : ''
      }`}
    >
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-bg-secondary">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-2 h-2 rounded-full ${anomaly ? 'bg-danger animate-pulse' : 'bg-safe'}`} />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-text-primary truncate">
              {zoneName}
            </div>
            <div className="mono text-[9px] text-text-muted uppercase tracking-wider">
              {cameraId.toUpperCase()} · RTSP SURVEILLANCE FEED
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onCalibrateZone && (
            <button
              type="button"
              onClick={onCalibrateZone}
              title="Calibrate custom polygon detection zone"
              className="px-2 py-0.5 rounded text-[10px] font-mono border border-border bg-bg-tertiary hover:bg-bg-primary text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
            >
              <span>📐</span>
              <span className="hidden sm:inline">CALIBRATE ZONE</span>
            </button>
          )}
          <span className="mono text-[10px] text-text-muted hidden md:inline">1080P · 30FPS</span>
          <div className={dcfg.className}>{dcfg.label}</div>
        </div>
      </div>

      <div className="relative aspect-[16/9] overflow-hidden bg-black">
        <VideoFeedView videoSrc={videoSrc} cameraId={cameraId} />

        <div className="absolute top-2 right-2 z-10">
          <span
            className={`mono text-[9px] px-2 py-0.5 rounded uppercase tracking-wider font-semibold border backdrop-blur-sm ${
              anomaly
                ? 'bg-danger-bg border-danger/40 text-danger-light'
                : 'bg-bg-primary/90 border-border text-text-secondary'
            }`}
          >
            {anomaly ? 'ANOMALY DETECTED' : 'STREAM NORMAL'}
          </span>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between z-10 pointer-events-none">
          <div className="bg-bg-primary/90 px-2.5 py-1.5 rounded border border-border">
            <div className="label-sm text-[9px]">Headcount</div>
            <div
              ref={hcRef}
              className={`mono text-2xl font-bold leading-none mt-0.5 ${
                density === 'critical'
                  ? 'text-danger-light'
                  : density === 'high'
                    ? 'text-warn-light'
                    : 'text-text-primary'
              }`}
            >
              {headcount.toLocaleString()}
            </div>
          </div>
          <div className="bg-bg-primary/90 px-2.5 py-1.5 rounded border border-border text-right">
            <div className="label-sm text-[9px]">Vector Flow</div>
            <div className="mt-0.5">
              <FlowArrow degrees={flowDirection} density={density} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-3.5 py-2.5 border-t border-border flex items-center justify-between text-xs bg-bg-card">
        <div className="text-text-secondary text-[11px] truncate pr-3">{description}</div>
        <div className="mono text-[10px] text-text-muted shrink-0">
          {lastUpdatedAgo <= 0
            ? 'LIVE SYNC'
            : `${lastUpdatedAgo}s AGO`}
        </div>
      </div>

      {anomaly && anomalyType && (
        <div className="px-3.5 py-2 border-t border-danger/30 bg-danger-bg text-xs flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
          <span className="font-mono text-[11px] font-semibold text-danger-light truncate">
            {anomalyType}
          </span>
        </div>
      )}
    </div>
  );
};

export default CameraPanel;
