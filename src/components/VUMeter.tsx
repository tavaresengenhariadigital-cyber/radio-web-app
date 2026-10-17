import React from 'react';

interface VUMeterProps {
  level: number; // 0 to 1
  peak?: number; // 0 to 1
  label?: string;
  orientation?: 'vertical' | 'horizontal';
  channels?: 'single' | 'stereo';
  rightLevel?: number;
  rightPeak?: number;
  compact?: boolean;
}

export const VUMeter: React.FC<VUMeterProps> = ({
  level,
  peak = 0,
  label,
  orientation = 'horizontal',
  channels = 'stereo',
  rightLevel = level * 0.95,
  rightPeak = peak * 0.95,
  compact = false,
}) => {
  const segments = 16;

  const renderMeterBar = (val: number, pk: number) => {
    const activeCount = Math.round(val * segments);
    const peakIndex = Math.min(segments - 1, Math.round(pk * segments));

    return (
      <div className="flex gap-[2px] items-center w-full bg-slate-950/80 p-1 rounded border border-slate-800/80">
        {Array.from({ length: segments }).map((_, i) => {
          const isActive = i < activeCount;
          const isPeak = i === peakIndex && pk > 0.05;

          // Color calculation: 0-10 green, 11-13 yellow/amber, 14-15 red (clip)
          let activeColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]';
          let inactiveColor = 'bg-slate-800/50';

          if (i >= 14) {
            activeColor = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]';
          } else if (i >= 11) {
            activeColor = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]';
          }

          return (
            <div
              key={i}
              className={`h-3 flex-1 rounded-[1px] transition-all duration-75 ${
                isActive ? activeColor : isPeak ? 'bg-rose-400' : inactiveColor
              }`}
            />
          );
        })}
      </div>
    );
  };

  const dbReadout = level > 0.01 ? (20 * Math.log10(Math.max(0.001, level))).toFixed(1) : '-∞';

  return (
    <div className={`flex flex-col gap-1 w-full ${compact ? 'text-xs' : 'text-xs'}`}>
      {label && (
        <div className="flex justify-between items-center text-slate-400 font-mono text-[11px]">
          <span className="font-semibold tracking-wider uppercase">{label}</span>
          <span className="text-slate-300 tabular-nums">{dbReadout} dB</span>
        </div>
      )}

      {channels === 'stereo' ? (
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-[10px] font-mono text-slate-500 w-3 shrink-0">L</span>
            {renderMeterBar(level, peak)}
          </div>
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-[10px] font-mono text-slate-500 w-3 shrink-0">R</span>
            {renderMeterBar(rightLevel, rightPeak)}
          </div>
        </div>
      ) : (
        renderMeterBar(level, peak)
      )}

      {/* dB markers scale */}
      <div className="flex justify-between text-[9px] font-mono text-slate-500 px-4 pt-0.5">
        <span>-40</span>
        <span>-24</span>
        <span>-12</span>
        <span>-6</span>
        <span className="text-amber-400">-3</span>
        <span className="text-rose-400">0 dB</span>
      </div>
    </div>
  );
};
