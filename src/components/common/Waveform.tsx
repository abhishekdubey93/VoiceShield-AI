import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  isActive?: boolean;
  audioLevel?: number;
  barCount?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const Waveform: React.FC<WaveformProps> = ({
  isActive = true,
  audioLevel = 0,
  barCount = 36,
  height = 48,
  color = '#3B82F6',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;
        if (isActive) {
          if (audioLevel > 0) {
            const baseLevel = (audioLevel / 100) * canvas.height;
            const variance = Math.sin(i * 0.4 + phase) * (baseLevel * 0.4);
            barHeight = Math.max(4, Math.min(canvas.height, baseLevel + variance));
          } else {
            // Simulated waveform
            const sinVal = Math.sin(i * 0.25 + phase);
            const cosVal = Math.cos(i * 0.15 - phase * 0.8);
            barHeight = Math.max(4, (Math.abs(sinVal + cosVal) / 2) * (canvas.height * 0.85));
          }
        }

        const x = i * (barWidth + 2);
        const y = (canvas.height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, '#1E293B');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      phase += 0.12;
      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isActive, audioLevel, barCount, color]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={height}
      className={`w-full ${className}`}
    />
  );
};
