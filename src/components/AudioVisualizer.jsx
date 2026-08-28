import { useEffect, useRef } from 'react';

const BAR_COUNT = 32;

export default function AudioVisualizer({ isPlaying, accent = '#22c55e' }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;

      const c = canvasEl.getContext('2d');
      if (!c) return;
      ctxRef.current = c;

      const { width, height } = canvasEl;
      const time = performance.now() / 180;

      c.clearRect(0, 0, width, height);

      const gap = 3;
      const barWidth = (width - gap * (BAR_COUNT - 1)) / BAR_COUNT;

      for (let i = 0; i < BAR_COUNT; i++) {
        const value = isPlaying
          ? 0.2 + (Math.sin(time + i * 0.72) + 1) * 0.32
          : 0.12;
        const barHeight = Math.max(4, value * height * 0.92);
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        const gradient = c.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, accent);
        gradient.addColorStop(1, `${accent}44`);

        c.fillStyle = gradient;
        c.beginPath();
        c.roundRect(x, y, barWidth, barHeight, 2);
        c.fill();
      }

      if (isPlaying) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      draw();
    }

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, accent]);

  return (
    <canvas
      ref={canvasRef}
      className="visualizer"
      width={280}
      height={48}
      aria-hidden="true"
    />
  );
}
