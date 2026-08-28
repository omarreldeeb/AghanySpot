import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Disc3 } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

export default function PlayerDisc({
  audioRef,
  isPlaying,
  unlocked,
  clipDuration,
  accent,
  onPlay,
  onPause,
  step,
  playbackId,
}) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const fillRef = useRef(null);
  const visualStartRef = useRef(null);

  useEffect(() => {
    visualStartRef.current = performance.now();
    if (fillRef.current) {
      fillRef.current.style.width = '0%';
      fillRef.current.style.boxShadow = 'none';
    }
  }, [playbackId]);

  useEffect(() => {
    // reset progress when step changes or unlocked state toggles
    setProgress(0);
  }, [step, unlocked]);

  useEffect(() => {
    // Update progress directly each animation frame from the audio element's currentTime
    // Use direct DOM writes to avoid React re-renders that can cause jank.
    let lastWidth = -1;
    const tick = () => {
      const audio = audioRef.current;
      if (!audio) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

        const target = unlocked ? (audio.duration || clipDuration) : clipDuration;
        const elapsed = visualStartRef.current
          ? (performance.now() - visualStartRef.current) / 1000
          : audio.currentTime || 0;
        const raw = Math.min(
          (!unlocked && clipDuration <= 0.1 ? elapsed : audio.currentTime || 0) / (target || 1),
          1,
        );
      const value = raw > 0.999 ? 1 : raw;

      const pct = Math.max(0, Math.min(100, value * 100));
      if (fillRef.current && Math.abs(pct - lastWidth) > 0.01) {
        fillRef.current.style.width = `${pct}%`;
        fillRef.current.style.boxShadow = pct > 0 ? '0 0 18px var(--accent-glow)' : 'none';
        lastWidth = pct;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      // reset lastWidth so initial write happens
      lastWidth = -1;
      rafRef.current = requestAnimationFrame(tick);
    } else if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, unlocked, clipDuration, audioRef]);

  const handlePlay = () => {
    onPlay();
  };

  return (
    <div className="player-section">
      <div className={`disc-wrap ${isPlaying ? 'disc-wrap--active' : ''}`}>
        <div className="disc-aura" style={{ '--accent': accent }} />
        <div className={`disc ${isPlaying ? 'disc--spinning' : ''}`}>
          <div className="disc-grooves" />
          <div className="disc-label">
            <Disc3 size={28} strokeWidth={1.5} />
          </div>
        </div>
        <button
          type="button"
          className="disc-play-btn"
          onClick={isPlaying ? onPause : handlePlay}
          aria-label={isPlaying ? 'Pause' : 'Play clip'}
        >
          {isPlaying ? (
            <Pause size={22} fill="currentColor" />
          ) : (
            <Play size={22} fill="currentColor" />
          )}
        </button>
      </div>

      <div className="player-meta">
        <div className="player-progress" aria-hidden>
          <div ref={fillRef} className="player-progress__fill" style={{ width: `0%` }} />
        </div>
        <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} accent={accent} />
      </div>
    </div>
  );
}
