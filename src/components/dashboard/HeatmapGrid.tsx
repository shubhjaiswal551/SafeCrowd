import React from 'react';

interface HeatmapGridProps {
  title: string;
  subtitle?: string;
  grid: number[][];
  size?: number;
}

function heatColor(v: number): string {
  const clamped = Math.max(0, Math.min(1, v));
  const stops: Array<[number, [number, number, number]]> = [
    [0.0, [20, 26, 38]],
    [0.25, [11, 114, 133]],
    [0.5, [16, 185, 129]],
    [0.75, [245, 158, 11]],
    [1.0, [239, 68, 68]],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [t1, c1] = stops[i];
    const [t2, c2] = stops[i + 1];
    if (clamped <= t2) {
      const k = (clamped - t1) / (t2 - t1 || 1);
      const r = Math.round(c1[0] + (c2[0] - c1[0]) * k);
      const g = Math.round(c1[1] + (c2[1] - c1[1]) * k);
      const b = Math.round(c1[2] + (c2[2] - c1[2]) * k);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return 'rgb(239, 68, 68)';
}

const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  title,
  subtitle,
  grid,
  size = 5,
}) => {
  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div>
          <div className="text-sm font-medium text-text-primary">{title}</div>
          {subtitle && (
            <div className="text-[11px] text-text-muted mt-0.5">{subtitle}</div>
          )}
        </div>
        <div className="label-sm">5×5 Zone</div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3">
        <div
          className="grid gap-1.5 aspect-square w-full max-w-[320px] mx-auto rounded-md overflow-hidden p-2 bg-bg-tertiary/40 border border-border-subtle"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {grid.map((row, y) =>
            row.map((val, x) => {
              const color = heatColor(val);
              const border =
                val > 0.7
                  ? '1px solid rgba(239, 68, 68, 0.5)'
                  : val > 0.45
                    ? '1px solid rgba(245, 158, 11, 0.35)'
                    : '1px solid rgba(45, 53, 72, 0.6)';
              return (
                <div
                  key={`${x}-${y}`}
                  className="rounded-sm transition-colors duration-500"
                  title={`Cell (${x + 1}, ${y + 1}): ${(val * 100).toFixed(0)}%`}
                  style={{
                    backgroundColor: color,
                    border,
                    boxShadow:
                      val > 0.75
                        ? `0 0 6px ${color}`
                        : val > 0.5
                          ? `0 0 3px ${color}`
                          : 'none',
                  }}
                />
              );
            }),
          )}
        </div>

        <div className="mt-auto space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-text-muted uppercase tracking-wider">
            <span>Low</span>
            <span>Concentration</span>
            <span>Critical</span>
          </div>
          <div
            className="h-2 rounded-full border border-border-subtle overflow-hidden"
            style={{
              background:
                'linear-gradient(90deg, rgb(20,26,38), rgb(11,114,133), rgb(16,185,129), rgb(245,158,11), rgb(239,68,68))',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HeatmapGrid;
