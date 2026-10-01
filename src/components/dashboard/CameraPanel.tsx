import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { DensityLevel } from '../../types/crowdEvent';

interface CameraPanelProps {
  cameraId: string;
  zoneName: string;
  description?: string;
  headcount: number;
  density: DensityLevel;
  flowDirection: number;
  lastUpdatedAgo: number;
  anomaly?: boolean;
  anomalyType?: string;
  videoSrc?: string;
}

const densityConfig: Record<
  DensityLevel,
  { label: string; className: string; ring: string }
> = {
  low: {
    label: 'LOW',
    className: 'chip-safe',
    ring: 'ring-safe/50',
  },
  moderate: {
    label: 'MODERATE',
    className: 'chip-warn',
    ring: 'ring-warn/50',
  },
  high: {
    label: 'HIGH',
    className: 'chip-danger',
    ring: 'ring-danger/50',
  },
  critical: {
    label: 'CRITICAL',
    className: 'chip-critical',
    ring: 'ring-critical',
  },
};

const SceneBackdrop: React.FC<{ cameraId: string }> = ({ cameraId }) => {
  if (cameraId === 'cam-001') {
    return (
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 85%, rgba(16, 185, 129, 0.10), transparent 60%), linear-gradient(180deg, #1a2435 0%, #0e141d 40%, #0a0f16 100%)',
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-50"
          viewBox="0 0 400 220"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="gate-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a2740" />
              <stop offset="100%" stopColor="#0f1824" />
            </linearGradient>
          </defs>
          <rect width="400" height="220" fill="url(#gate-sky)" />
          <polygon
            points="0,220 60,140 130,120 200,110 270,120 340,140 400,220"
            fill="#131a26"
            stroke="#1e2a3d"
            strokeWidth="1"
          />
          <rect x="160" y="120" width="80" height="100" fill="none" stroke="#2d425f" strokeWidth="1.5" />
          <line x1="200" y1="120" x2="200" y2="220" stroke="#2d425f" strokeWidth="1" />
          <line x1="160" y1="160" x2="240" y2="160" stroke="#2d425f" strokeWidth="1" />
          {Array.from({ length: 7 }).map((_, i) => (
            <circle
              key={i}
              cx={100 + i * 35 + Math.sin(i) * 10}
              cy="195"
              r="2.5"
              fill="rgba(34, 211, 238, 0.55)"
            />
          ))}
        </svg>
      </div>
    );
  }
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(245, 158, 11, 0.06), transparent 60%), linear-gradient(180deg, #1a1a28 0%, #12111c 50%, #0b0b12 100%)',
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 400 220"
        preserveAspectRatio="none"
      >
        <circle cx="200" cy="110" r="90" fill="none" stroke="#2a2e4a" strokeWidth="0.8" />
        <circle cx="200" cy="110" r="60" fill="none" stroke="#2a2e4a" strokeWidth="0.8" />
        <circle cx="200" cy="110" r="30" fill="none" stroke="#2a2e4a" strokeWidth="0.8" />
        <line x1="200" y1="20" x2="200" y2="200" stroke="#2a2e4a" strokeWidth="0.6" />
        <line x1="110" y1="110" x2="290" y2="110" stroke="#2a2e4a" strokeWidth="0.6" />
        <line x1="136" y1="46" x2="264" y2="174" stroke="#2a2e4a" strokeWidth="0.5" />
        <line x1="264" y1="46" x2="136" y2="174" stroke="#2a2e4a" strokeWidth="0.5" />
        {Array.from({ length: 11 }).map((_, i) => {
          const a = (i / 11) * Math.PI * 2 + 0.3;
          const r = 50 + (i % 3) * 20;
          return (
            <circle
              key={i}
              cx={200 + Math.cos(a) * r}
              cy={110 + Math.sin(a) * r}
              r="2.5"
              fill="rgba(245, 158, 11, 0.55)"
            />
          );
        })}
      </svg>
    </div>
  );
};

const TrackedDots: React.FC<{ density: DensityLevel; seed: number }> = ({
  density,
  seed,
}) => {
  const count =
    density === 'low' ? 14 : density === 'moderate' ? 28 : density === 'high' ? 46 : 62;
  const dots = useMemo(() => {
    const arr: Array<{ x: number; y: number; s: number; d: number; delay: number }> = [];
    let s = seed * 9301 + 49297;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < count; i++) {
      arr.push({
        x: 10 + rnd() * 80,
        y: 25 + rnd() * 65,
        s: 2 + rnd() * 2,
        d: 6 + rnd() * 8,
        delay: rnd() * 8,
      });
    }
    return arr;
  }, [count, seed]);

  return (
    <div className="absolute inset-0">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute block rounded-full animate-dot-move"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.s}px`,
            height: `${d.s}px`,
            background:
              density === 'critical'
                ? 'rgba(239, 68, 68, 0.85)'
                : density === 'high'
                  ? 'rgba(245, 158, 11, 0.85)'
                  : 'rgba(34, 211, 238, 0.75)',
            boxShadow:
              density === 'critical'
                ? '0 0 6px rgba(239, 68, 68, 0.7)'
                : density === 'high'
                  ? '0 0 5px rgba(245, 158, 11, 0.6)'
                  : '0 0 4px rgba(34, 211, 238, 0.6)',
            animationDuration: `${d.d}s`,
            animationDelay: `-${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

interface VideoOverlayProps {
  videoSrc: string;
  onHeadcountChange?: (count: number, fastCount: number) => void;
}

const VideoDetectionOverlay: React.FC<VideoOverlayProps> = ({
  videoSrc,
  onHeadcountChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fastMovingCount, setFastMovingCount] = useState(0);
  const [normalMovingCount, setNormalMovingCount] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let rafId: number;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pedestrian flow corridors
    const humanCount = 18;
    const humans = Array.from({ length: humanCount }).map((_, i) => {
      const isFast = i < 4 || i === 9 || i === 15; // Fast speed humans
      const lane = i % 3; // 3 walking lanes
      const speed = isFast ? 2.4 + (i % 3) * 0.5 : 0.6 + (i % 4) * 0.2;
      const dir = i % 2 === 0 ? 1 : -1;
      const confidence = 87 + Math.floor(Math.random() * 11);
      return {
        id: `P-${100 + i}`,
        x: 50 + (i * 45) % 650,
        y: 120 + lane * 70 + (Math.sin(i) * 20),
        vx: dir * speed,
        vy: (Math.sin(i * 1.5) * 0.3),
        isFast,
        confidence,
        boxW: isFast ? 36 : 30,
        boxH: isFast ? 52 : 44,
        history: [] as Array<{ x: number; y: number }>,
      };
    });

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const w = canvas.width || 600;
      const h = canvas.height || 350;
      ctx.clearRect(0, 0, w, h);

      let fast = 0;
      let normal = 0;

      humans.forEach((person) => {
        // Move along corridor
        person.x += person.vx;
        person.y += person.vy;

        // Wrap smoothly around canvas edges
        if (person.vx > 0 && person.x > w + 40) person.x = -40;
        if (person.vx < 0 && person.x < -40) person.x = w + 40;
        if (person.y < 60 || person.y > h - 60) person.vy *= -1;

        if (person.isFast) fast++;
        else normal++;

        const bw = person.boxW;
        const bh = person.boxH;
        const bx = person.x - bw / 2;
        const by = person.y - bh / 2;

        if (person.isFast) {
          // RED SQUARE BOUNDING BOX — Fast moving / runner detection
          ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
          ctx.fillRect(bx, by, bw, bh);

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, by, bw, bh);

          // Corner bracket accents
          const corner = 6;
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 3;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(bx, by + corner); ctx.lineTo(bx, by); ctx.lineTo(bx + corner, by);
          ctx.stroke();
          // Top-right
          ctx.beginPath();
          ctx.moveTo(bx + bw - corner, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + corner);
          ctx.stroke();
          // Bottom-left
          ctx.beginPath();
          ctx.moveTo(bx, by + bh - corner); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + corner, by + bh);
          ctx.stroke();
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(bx + bw - corner, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - corner);
          ctx.stroke();

          // Header tag bar
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(bx, by - 16, bw + 14, 15);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.fillText(`⚡ FAST ${person.confidence}%`, bx + 3, by - 5);

        } else {
          // GREEN SQUARE BOUNDING BOX — Normal pedestrian detection
          ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
          ctx.fillRect(bx, by, bw, bh);

          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1.8;
          ctx.strokeRect(bx, by, bw, bh);

          // Corner bracket accents
          const corner = 5;
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 2.5;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(bx, by + corner); ctx.lineTo(bx, by); ctx.lineTo(bx + corner, by);
          ctx.stroke();
          // Top-right
          ctx.beginPath();
          ctx.moveTo(bx + bw - corner, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + corner);
          ctx.stroke();
          // Bottom-left
          ctx.beginPath();
          ctx.moveTo(bx, by + bh - corner); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + corner, by + bh);
          ctx.stroke();
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(bx + bw - corner, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - corner);
          ctx.stroke();

          // Header tag bar
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(bx, by - 15, bw + 6, 14);
          ctx.fillStyle = '#052e16';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.fillText(`${person.id} ${person.confidence}%`, bx + 3, by - 4);
        }
      });

      setFastMovingCount(fast);
      setNormalMovingCount(normal);
      if (onHeadcountChange) onHeadcountChange(humans.length, fast);

      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [onHeadcountChange]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
        <span className="mono text-[10px] px-2 py-0.5 rounded bg-safe-bg/80 border border-safe/30 text-safe-light backdrop-blur-sm">
          🟩 Normal Box: {normalMovingCount}
        </span>
        <span className="mono text-[10px] px-2 py-0.5 rounded bg-danger-bg/80 border border-danger/30 text-danger-light backdrop-blur-sm animate-pulse">
          🟥 Fast Risk Box: {fastMovingCount}
        </span>
      </div>
    </div>
  );
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
          : '#22d3ee';
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
      className={`card relative overflow-hidden transition-all duration-300 ${
        anomaly ? `ring-2 ${dcfg.ring} shadow-glow-danger` : ''
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-secondary/40">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">
              {zoneName}
            </div>
            <div className="mono text-[10px] text-text-muted uppercase tracking-wider">
              {cameraId.toUpperCase()} · LIVE MP4 FEED
            </div>
          </div>
        </div>
        <div className={dcfg.className}>{dcfg.label}</div>
      </div>

      <div className="relative aspect-[16/9] overflow-hidden">
        {videoSrc ? (
          <VideoDetectionOverlay videoSrc={videoSrc} />
        ) : (
          <>
            <SceneBackdrop cameraId={cameraId} />
            <TrackedDots density={density} seed={cameraId === 'cam-001' ? 1 : 7} />
          </>
        )}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(45, 53, 72, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 53, 72, 0.25) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none bg-scanline opacity-50"
        />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute left-0 right-0 h-8 opacity-40"
            style={{
              background:
                'linear-gradient(180deg, transparent, rgba(34, 211, 238, 0.18), transparent)',
              animation: 'scan 4.5s linear infinite',
            }}
          />
        </div>

        <div className="absolute top-2 right-2 z-10">
          <span className="mono text-[10px] px-2 py-0.5 rounded bg-danger-bg border border-danger/30 text-danger-light backdrop-blur-sm uppercase tracking-wider">
            {anomaly ? 'ANOMALY' : 'AI AI-TRACKING'}
          </span>
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between z-10">
          <div>
            <div className="label-sm">Headcount</div>
            <div
              ref={hcRef}
              className={`mono text-3xl font-semibold leading-none ${
                density === 'critical'
                  ? 'text-danger-light text-shadow-glow-danger'
                  : density === 'high'
                    ? 'text-warn-light'
                    : 'text-safe-light text-shadow-glow-safe'
              }`}
            >
              {headcount.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="label-sm">Flow Dir</div>
            <FlowArrow degrees={flowDirection} density={density} />
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-border-subtle flex items-center justify-between text-xs">
        <div className="text-text-secondary truncate pr-3">{description}</div>
        <div className="mono text-text-muted shrink-0">
          {lastUpdatedAgo <= 0
            ? 'just updated'
            : `${lastUpdatedAgo}s ago`}
        </div>
      </div>

      {anomaly && anomalyType && (
        <div className="px-4 py-2.5 border-t border-danger/30 bg-danger-bg/70 flex items-center gap-2 animate-slide-in">
          <span className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-glow-danger shrink-0" />
          <span className="text-xs font-medium text-danger-light truncate">
            {anomalyType}
          </span>
        </div>
      )}
    </div>
  );
};

export default CameraPanel;
