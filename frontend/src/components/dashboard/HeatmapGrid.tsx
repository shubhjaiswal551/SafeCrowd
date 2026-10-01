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
    [0.0, [241, 245, 249]],  // Crisp light slate-100
    [0.25, [187, 247, 208]], // Soft mint emerald-100
    [0.5, [74, 222, 128]],   // Emerald-400
    [0.75, [251, 191, 36]],  // Amber-400
    [1.0, [220, 38, 38]],    // Crimson-600
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
  return 'rgb(220, 38, 38)';
}

const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  title,
  subtitle,
  grid,
  size = 5,
}) => {
  return (
    <div className="card h-full flex flex-col bg-bg-card border border-border">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-bg-secondary">
        <div>
          <div className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">{title}</div>
          {subtitle && (
            <div className="text-[10px] text-text-muted mt-0.5">{subtitle}</div>
          )}
        </div>
        <div className="label-sm text-[9px]">5×5 MATRIX</div>
      </div>

      <div className="flex-1 p-3.5 flex flex-col gap-3">
        <div
          className="grid gap-1 aspect-square w-full max-w-[280px] mx-auto rounded p-2 bg-slate-50 border border-slate-200"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {grid.map((row, y) =>
            row.map((val, x) => {
              const color = heatColor(val);
              return (
                <div
                  key={`${x}-${y}`}
                  className="rounded-sm transition-colors duration-300 border border-slate-200"
                  title={`Sector (${x + 1}, ${y + 1}): ${(val * 100).toFixed(0)}% density`}
                  style={{
                    backgroundColor: color,
                  }}
                />
              );
            }),
          )}
        </div>

        <div className="mt-auto space-y-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-text-muted uppercase tracking-wider">
            <span>Low (0%)</span>
            <span>Spatial Concentration</span>
            <span>Crit (100%)</span>
          </div>
          <div
            className="h-1.5 rounded border border-border overflow-hidden"
            style={{
              background:
                'linear-gradient(90deg, rgb(241,245,249), rgb(187,247,208), rgb(74,222,128), rgb(251,191,36), rgb(220,38,38))',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HeatmapGrid;
