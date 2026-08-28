import { useRef, useCallback, useEffect, useState } from 'react';
import { CLIP_DURATIONS } from '../data/songs';

export function useAudioPlayer(src) {
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const limitRef = useRef(null);
  const loopRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [playbackId, setPlaybackId] = useState(0);

  const stopCutoffLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startCutoffLoop = useCallback(
    (maxSeconds) => {
      stopCutoffLoop();
      limitRef.current = maxSeconds;

      const tick = () => {
        const audio = audioRef.current;
        if (!audio || limitRef.current == null) return;

        if (audio.currentTime >= limitRef.current) {
          if (loopRef.current) {
            audio.pause();
            audio.currentTime = 0;
            audio.play().catch(() => setIsPlaying(false));
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          audio.pause();
          audio.currentTime = limitRef.current;
          setIsPlaying(false);
          stopCutoffLoop();
          return;
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [stopCutoffLoop],
  );

  const playSnippet = useCallback(
    (step, shouldLoop = false) => {
      const audio = audioRef.current;
      if (!audio) return;

      stopCutoffLoop();
      setPlaybackId((id) => id + 1);
      audio.pause();
      audio.currentTime = 0;
      const duration = CLIP_DURATIONS[step];
      loopRef.current = shouldLoop;
      setIsPlaying(true);
      startCutoffLoop(duration);

      audio
        .play()
        .catch(() => {
          setIsPlaying(false);
        });
    },
    [unlocked, startCutoffLoop, stopCutoffLoop],
  );

  const playFull = useCallback((restart = true) => {
    const audio = audioRef.current;
    if (!audio) return;

    stopCutoffLoop();
    limitRef.current = null;
    setPlaybackId((id) => id + 1);
    if (restart && audio.readyState > 0) audio.currentTime = 0;

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [stopCutoffLoop]);

  const resumeFull = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    stopCutoffLoop();
    limitRef.current = null;
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [stopCutoffLoop]);

  const setLooping = useCallback((enabled) => {
    loopRef.current = enabled;
  }, []);

  const pause = useCallback(() => {
    stopCutoffLoop();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
  }, [stopCutoffLoop]);

  const unlock = useCallback(() => {
    setUnlocked(true);
    stopCutoffLoop();
    limitRef.current = null;
  }, [stopCutoffLoop]);

  const reset = useCallback(() => {
    setUnlocked(false);
    stopCutoffLoop();
    limitRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
  }, [stopCutoffLoop]);

  useEffect(() => {
    return () => stopCutoffLoop();
  }, [stopCutoffLoop]);

  useEffect(() => {
    reset();
  }, [src, reset]);

  return {
    audioRef,
    isPlaying,
    unlocked,
    playbackId,
    playSnippet,
    playFull,
    resumeFull,
    setLooping,
    pause,
    unlock,
    reset,
  };
}
