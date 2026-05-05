"use client";

import { useState } from "react";

interface HeatmapDataPoint {
  hour: number;
  count: number;
}

interface ActivityHeatmapProps {
  data: HeatmapDataPoint[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ hour: number; count: number } | null>(null);
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getOpacity = (count: number) => {
    if (count === 0) return 0;
    return Math.max(0.1, count / maxCount);
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Activité par heure</h3>
      <div className="grid grid-cols-12 gap-1">
        {Array.from({ length: 24 }, (_, i) => {
          const point = data.find((d) => d.hour === i) ?? { hour: i, count: 0 };
          const opacity = getOpacity(point.count);
          return (
            <div key={i} className="relative group">
              <div
                className="h-8 rounded cursor-pointer transition-all border border-slate-100 hover:scale-110"
                style={{ backgroundColor: `rgba(0, 184, 95, ${opacity})`, minWidth: 0 }}
                onMouseEnter={() => setTooltip(point)}
                onMouseLeave={() => setTooltip(null)}
              />
              <p className="text-[9px] text-slate-400 text-center mt-0.5 leading-none">
                {String(i).padStart(2, "0")}h
              </p>
              {tooltip?.hour === i && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 bg-slate-800 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap">
                  {i}h: {point.count} msg
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
