import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Disc3, Repeat } from 'lucide-react';
import { SHORT_CLIP_PLAYBACK_DURATION } from '../data/songs';
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
  loopEnabled,
  onLoopToggle,
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
    // Update progress from the actual audio time to avoid artificial delay and drift on short clips.
    let lastWidth = -1;
    const tick = () => {
      const audio = audioRef.current;
      if (!audio) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const fullDuration = Number.isFinite(audio.duration) ? audio.duration : clipDuration || 1;
      const duration = unlocked ? fullDuration : clipDuration || 1;
      const currentTime = audio.currentTime || 0;
      const targetDuration = clipDuration <= 0.1 ? SHORT_CLIP_PLAYBACK_DURATION : Math.max(duration, 0.001);
      const raw = Math.min(currentTime / Math.max(targetDuration, 0.001), 1);
      const value = raw > 0.999 ? 1 : raw;

      const pct = Math.max(0, Math.min(100, value * 100));
      if (fillRef.current && Math.abs(pct - lastWidth) > 0.05) {
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
    if (isPlaying && clipDuration <= 0.1) return;
    onPlay();
  };

  const shortClipLocked = isPlaying && clipDuration <= 0.1;

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
          disabled={shortClipLocked}
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
        <button
          type="button"
          className={`loop-toggle ${loopEnabled ? 'loop-toggle--active' : ''}`}
          onClick={onLoopToggle}
          aria-pressed={loopEnabled}
          title="Repeat this clip"
        >
          <Repeat size={15} />
          <span>Loop</span>
        </button>
      </div>
    </div>
  );
}
