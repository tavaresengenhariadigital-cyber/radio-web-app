import React, { useEffect, useRef } from 'react';
import { globalAudioEngine } from '../utils/audioEngine';

interface AudioWaveformProps {
  isActive: boolean;
  barColor?: string;
  glowColor?: string;
  height?: number;
  mode?: 'bars' | 'wave' | 'mirror';
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  barColor = '#38bdf8',
  glowColor = 'rgba(56, 189, 248, 0.4)',
  height = 64,
  mode = 'bars',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    // Listen to real-time engine waveform
    globalAudioEngine.onWaveformData = (data: Uint8Array) => {
      dataArrayRef.current = data;
    };

    return () => {
      globalAudioEngine.onWaveformData = undefined;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      if (!isActive) {
        // Flat quiet baseline
        ctx.beginPath();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.moveTo(0, h / 2);
        ctx.lineTo(width, h / 2);
        ctx.stroke();
        animRef.current = requestAnimationFrame(render);
        return;
      }

      const rawData = dataArrayRef.current;
      const barCount = 48;
      const barWidth = (width / barCount) * 0.75;
      const barSpacing = (width / barCount) * 0.25;

      if (mode === 'bars' || mode === 'mirror') {
        for (let i = 0; i < barCount; i++) {
          let magnitude = 0;
          if (rawData && rawData.length > 0) {
            const index = Math.floor((i / barCount) * (rawData.length / 2));
            magnitude = (rawData[index] || 0) / 255;
          } else {
            // Procedural lively fallback animation
            magnitude = 0.25 + 0.45 * Math.sin(phase + i * 0.35) * Math.cos(phase * 0.7 + i * 0.2);
            magnitude = Math.abs(magnitude);
          }

          const barHeight = Math.max(4, magnitude * (h * 0.85));
          const x = i * (barWidth + barSpacing);
          const y = mode === 'mirror' ? (h - barHeight) / 2 : h - barHeight;

          // Gradient
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(0.5, '#818cf8');
          grad.addColorStop(1, '#c084fc');

          ctx.fillStyle = grad;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 8;

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 3);
          ctx.fill();
        }
      } else if (mode === 'wave') {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = barColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10;

        const sliceWidth = width / 64;
        let x = 0;

        for (let i = 0; i < 64; i++) {
          let v = 0.5;
          if (rawData && rawData.length > 0) {
            v = (rawData[i * 2] || 128) / 255;
          } else {
            v = 0.5 + 0.35 * Math.sin(phase + i * 0.2);
          }

          const y = v * h;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
      }

      phase += 0.08;
      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isActive, barColor, glowColor, mode]);

  return (
    <div className="w-full flex items-center justify-center overflow-hidden rounded-lg bg-slate-950/60 border border-slate-800/60 p-2">
      <canvas
        ref={canvasRef}
        width={480}
        height={height}
        className="w-full h-auto block max-w-full"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};
