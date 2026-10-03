import React, { useRef, useEffect, useState } from 'react';
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
  { label: string; className: string; dotColor: string }
> = {
  low: {
    label: 'Low Density',
    className: 'chip-safe',
    dotColor: 'bg-emerald-500',
  },
  moderate: {
    label: 'Moderate',
    className: 'chip-warn',
    dotColor: 'bg-amber-500',
  },
  high: {
    label: 'High Density',
    className: 'chip-danger',
    dotColor: 'bg-red-500',
  },
  critical: {
    label: 'Critical Surge',
    className: 'chip-critical',
    dotColor: 'bg-rose-600 animate-ping',
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
          ? '#eab308'
          : '#0071e3';

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className="w-4 h-4 rounded-full border border-slate-200/80 flex items-center justify-center bg-white shadow-xs"
        style={{ transform: `rotate(${degrees}deg)` }}
      >
        <svg width="8" height="8" viewBox="0 0 10 10">
          <path
            d="M5 1 L8 6 L5.5 5.5 L5.5 9 L4.5 9 L4.5 5.5 L2 6 Z"
            fill={arrowColor}
          />
        </svg>
      </div>
      <span className="text-[11px] font-semibold text-slate-700 tabular-nums">{degrees}°</span>
    </div>
  );
};

// Mini SVG Sparkline showing real-time headcount trend
const TrendSparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 44;
  const height = 14;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 3) - 1.5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0 opacity-80">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

interface VideoFeedViewProps {
  videoSrc?: string;
  cameraId: string;
}

const VideoFeedView: React.FC<VideoFeedViewProps> = ({ videoSrc, cameraId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative w-full h-full bg-slate-950">
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
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 font-sans text-xs gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m22 8-5 4 5 4V8z" />
            <rect x="2" y="6" width="15" height="12" rx="2" />
          </svg>
          <span>STANDBY · {cameraId.toUpperCase()} WAITING FOR RTSP STREAM</span>
        </div>
      )}

      {/* Surveillance Corner Reticles */}
      <div className="absolute inset-0 pointer-events-none p-2.5 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="w-2.5 h-2.5 border-t border-l border-white/40 rounded-tl-xs" />
          <div className="w-2.5 h-2.5 border-t border-r border-white/40 rounded-tr-xs" />
        </div>
        <div className="flex justify-between items-end">
          <div className="w-2.5 h-2.5 border-b border-l border-white/40 rounded-bl-xs" />
          <div className="w-2.5 h-2.5 border-b border-r border-white/40 rounded-br-xs" />
        </div>
      </div>

      {/* Optical Feed Active Watermark */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 font-sans text-[10px]">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/60 border border-white/20 text-white/95 backdrop-blur-md font-medium shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live RTSP
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
  const [headcountHistory, setHeadcountHistory] = useState<number[]>([headcount]);

  useEffect(() => {
    setHeadcountHistory((prev) => {
      const next = [...prev, headcount];
      return next.slice(-20); // retain last 20 points
    });
  }, [headcount]);

  return (
    <div
      className="card relative overflow-hidden transition-all duration-200 border-slate-200/80 hover:border-slate-300/90 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-100/90 border border-slate-200/70 flex items-center justify-center text-slate-500 shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 8-5 4 5 4V8z" />
              <rect x="2" y="6" width="15" height="12" rx="2" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800 tracking-tight truncate">
              {zoneName}
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-normal">
              {cameraId.toUpperCase()} · RTSP Optical Surveillance
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onCalibrateZone && (
            <button
              type="button"
              onClick={onCalibrateZone}
              title="Calibrate custom polygon detection zone"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-xs border border-slate-200/60 shadow-sm active:scale-[0.98] transition-all"
            >
              <span>📐</span>
              <span className="hidden sm:inline">Calibrate Zone</span>
            </button>
          )}
          <span className="text-[11px] text-slate-400 font-medium hidden md:inline">1080P · 30 FPS</span>
          <div className={dcfg.className}>
            <span className={`w-1.5 h-1.5 rounded-full ${dcfg.dotColor}`} />
            <span>{dcfg.label}</span>
          </div>
        </div>
      </div>

      {/* Video Canvas Container */}
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
        <VideoFeedView videoSrc={videoSrc} cameraId={cameraId} />

        {/* Live Anomaly Notification Pill */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold tracking-normal border backdrop-blur-md shadow-sm ${
              anomaly
                ? 'bg-rose-500/90 text-white border-rose-300 shadow-rose-500/20 animate-pulse'
                : 'bg-white/80 border-white/60 text-slate-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${anomaly ? 'bg-white' : 'bg-emerald-500'}`} />
            {anomaly ? 'ANOMALY DETECTED' : 'Normal Flow'}
          </span>
        </div>

        {/* Floating Frosted Glass HUD at bottom - scaled down & compact */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between z-10 pointer-events-none gap-2">
          {/* Headcount Card with Trend Sparkline */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/80 shadow-glass px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 pointer-events-auto">
            <div>
              <div className="label-sm text-[9px] text-slate-400 leading-none">Headcount</div>
              <div
                className={`font-sans text-base font-bold tracking-tight tabular-nums leading-none mt-0.5 ${
                  density === 'critical'
                    ? 'text-rose-600'
                    : density === 'high'
                      ? 'text-amber-600'
                      : 'text-slate-900'
                }`}
              >
                {headcount.toLocaleString()}
              </div>
            </div>
            <div className="pt-0.5">
              <TrendSparkline
                data={headcountHistory}
                color={density === 'critical' ? '#e11d48' : density === 'high' ? '#d97706' : '#0071e3'}
              />
            </div>
          </div>

          {/* Vector Flow Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/80 shadow-glass px-2.5 py-1.5 rounded-xl text-right pointer-events-auto">
            <div className="label-sm text-[9px] text-slate-400 leading-none">Vector Flow</div>
            <div className="mt-0.5">
              <FlowArrow degrees={flowDirection} density={density} />
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0 pr-3">
          {anomaly && anomalyType ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
              <span className="text-slate-700 text-xs font-medium truncate">
                <span className="font-semibold text-rose-600 capitalize">{anomalyType}</span> · Verification Advised
              </span>
            </>
          ) : (
            <span className="text-slate-500 text-xs font-medium truncate">{description}</span>
          )}
        </div>
        <div className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${anomaly ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span>{lastUpdatedAgo <= 0 ? 'Live Sync' : `${lastUpdatedAgo}s ago`}</span>
        </div>
      </div>
    </div>
  );
};

export default CameraPanel;
