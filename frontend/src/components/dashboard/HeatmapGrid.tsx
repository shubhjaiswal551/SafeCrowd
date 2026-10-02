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
    <div className="card h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/70 backdrop-blur-md">
        <div>
          <div className="text-sm font-semibold text-slate-800 tracking-tight">{title}</div>
          {subtitle && (
            <div className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</div>
          )}
        </div>
        <span className="chip bg-slate-100 text-slate-600 border-slate-200 text-[11px] font-medium">5×5 Matrix</span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4">
        <div
          className="grid gap-1.5 aspect-square w-full max-w-[280px] mx-auto rounded-2xl p-2.5 bg-slate-50/80 border border-slate-200/80 shadow-inner"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {grid.map((row, y) =>
            row.map((val, x) => {
              const color = heatColor(val);
              return (
                <div
                  key={`${x}-${y}`}
                  className="rounded-lg transition-colors duration-300 border border-black/5 shadow-sm"
                  title={`Sector (${x + 1}, ${y + 1}): ${(val * 100).toFixed(0)}% density`}
                  style={{
                    backgroundColor: color,
                  }}
                />
              );
            }),
          )}
        </div>

        <div className="mt-auto space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Low (0%)</span>
            <span>Spatial Concentration</span>
            <span>Critical (100%)</span>
          </div>
          <div
            className="h-2 rounded-full border border-slate-200/60 overflow-hidden shadow-inner"
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
