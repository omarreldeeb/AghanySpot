import { useEffect, useRef } from 'react';

const BAR_COUNT = 32;

export default function AudioVisualizer({ audioRef, isPlaying, accent = '#22c55e' }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(null);
  const dataRef = useRef(new Uint8Array(BAR_COUNT));

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    const setup = () => {
      if (audioCtxRef.current) return;

      try {
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.75;

        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
        dataRef.current = new Uint8Array(analyser.frequencyBinCount);
      } catch {
        // Element may already be wired in StrictMode remount
      }
    };

    const draw = () => {
      const analyser = analyserRef.current;
      const canvasEl = canvasRef.current;
      if (!analyser || !canvasEl) return;

      const c = canvasEl.getContext('2d');
      if (!c) return;
      ctxRef.current = c;

      const { width, height } = canvasEl;
      const data = dataRef.current;
      analyser.getByteFrequencyData(data);

      c.clearRect(0, 0, width, height);

      const gap = 3;
      const barWidth = (width - gap * (BAR_COUNT - 1)) / BAR_COUNT;

      for (let i = 0; i < BAR_COUNT; i++) {
        const value = data[i] / 255;
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
      setup();
      audioCtxRef.current?.resume();
      rafRef.current = requestAnimationFrame(draw);
    }

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [audioRef, isPlaying, accent]);

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
