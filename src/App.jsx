import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Moon, Sun, Users } from 'lucide-react';
import { EGYPTIAN_SONGS, CLIP_DURATIONS } from './data/songs';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import ClipProgress from './components/ClipProgress';
import GuessHistory from './components/GuessHistory';
import PlayerDisc from './components/PlayerDisc';
import SearchBar from './components/SearchBar';
import GameResult from './components/GameResult';
import './App.css';

const audioContextRef = { current: null };

function getClickAudioContext() {
  if (typeof window === 'undefined') return null;

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;

  if (!audioContextRef.current) {
    audioContextRef.current = new AudioCtor();
  }

  if (audioContextRef.current.state === 'suspended') {
    audioContextRef.current.resume().catch(() => {});
  }

  return audioContextRef.current;
}

const encodeChallengePayload = (payload) => {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  } catch {
    return '';
  }
};

const decodeChallengePayload = (encoded) => {
  try {
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(decodeURIComponent(escape(atob(padded))));
  } catch {
    return null;
  }
};

const buildChallengeSequence = (rounds, seed = Date.now()) => {
  const songs = [...EGYPTIAN_SONGS];
  let value = Number(seed) >>> 0;
  const nextRand = () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value;
  };

  for (let index = songs.length - 1; index > 0; index -= 1) {
    const swapIndex = nextRand() % (index + 1);
    [songs[index], songs[swapIndex]] = [songs[swapIndex], songs[index]];
  }

  const sequence = [];
  for (let index = 0; index < Math.max(1, rounds); index += 1) {
    sequence.push(songs[index % songs.length].id);
  }

  return sequence.slice(0, rounds);
};

const buildOpponentResults = (trackIds = [], rounds = 0, seed = Date.now()) => {
  const selectedTrackIds = Array.isArray(trackIds) ? trackIds.slice(0, Math.max(1, rounds)) : [];
  let value = Number(seed) >>> 0;
  const nextRand = () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };

  return selectedTrackIds.map((trackId, index) => {
    const song = EGYPTIAN_SONGS.find((entry) => entry.id === trackId);
    const guessed = index < Math.max(1, Math.round(rounds * 0.6));
    return {
      title: song?.title || 'Unknown song',
      correct: guessed,
      seconds: Number((2.5 + nextRand() * 3).toFixed(1)),
    };
  });
};

const buildChallengeSummary = (payload, results = [], opponentResults = []) => {
  const guessed = results.filter((r) => r.correct);
  const missed = results.filter((r) => !r.correct);
  const opponent = Array.isArray(opponentResults) && opponentResults.length > 0
    ? opponentResults
    : buildOpponentResults(payload.trackIds, payload.rounds, payload.seed || Date.now());

  const opponentGuessed = opponent.filter((entry) => entry.correct).map((entry) => ({
    title: entry.title,
    seconds: Number(entry.seconds),
  }));
  const opponentMissed = opponent.filter((entry) => !entry.correct).map((entry) => entry.title);

  return {
    player: {
      total: guessed.length,
      roundTotal: payload.rounds,
      guessed: guessed.map((entry) => ({
        title: entry.title,
        seconds: Number(entry.seconds),
      })),
      missed: missed.map((entry) => entry.title),
    },
    opponent: {
      total: opponentGuessed.length,
      roundTotal: payload.rounds,
      guessed: opponentGuessed,
      missed: opponentMissed,
    },
  };
};

function randInt(max, exclude = -1) {
  if (max <= 1) return 0;
  let n;
  do {
    n = Math.floor(Math.random() * max);
  } while (n === exclude);
  return n;
}

const ACCENT_COLORS = [
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#d946ef',
  '#f43f5e',
  '#f97316',
  '#eab308',
];

export default function App() {
  const [songIndex, setSongIndex] = useState(() => Math.floor(Math.random() * EGYPTIAN_SONGS.length));
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [gameStatus, setGameStatus] = useState('PLAYING');
  const [selectedEra, setSelectedEra] = useState('Any era');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Any');
  const [volume, setVolume] = useState(1);
  const [accent, setAccent] = useState(() => ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)]);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [is1v1Mode, setIs1v1Mode] = useState(false);
  const [challengeConfig, setChallengeConfig] = useState(null);
  const [challengeQueue, setChallengeQueue] = useState([]);
  const [challengeRoundIndex, setChallengeRoundIndex] = useState(0);
  const [challengeResults, setChallengeResults] = useState([]);
  const [challengeSummary, setChallengeSummary] = useState(null);
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [challengeRoundsInput, setChallengeRoundsInput] = useState(5);
  const [challengeError, setChallengeError] = useState('');
  const [challengeStatus, setChallengeStatus] = useState('idle');
  const [challengeOpponentResults, setChallengeOpponentResults] = useState([]);
  const [roundFeedback, setRoundFeedback] = useState('');
  const [copyToast, setCopyToast] = useState('');
  const challengeRoundStartedAt = useRef(Date.now());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return window.localStorage.getItem('aghanyspot-theme') !== 'light';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
    try {
      window.localStorage.setItem('aghanyspot-theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // Continue without persistence when storage is unavailable.
    }
  }, [isDarkMode]);

  const filteredSongs = useMemo(() => {
    return EGYPTIAN_SONGS.filter((s) => {
      const eraMatch = selectedEra === 'Any era' || s.era === selectedEra;
      const diffMatch = selectedDifficulty === 'Any' || s.difficulty === selectedDifficulty;
      return eraMatch && diffMatch;
    });
  }, [selectedEra, selectedDifficulty]);

  // show a temporary notification when filters produce an empty pool
  const [noMatchVisible, setNoMatchVisible] = useState(false);
  const noMatchTimer = useRef(null);
  const resetFiltersTimer = useRef(null);

  useEffect(() => {
    // only show when user has selected a constrained filter
    const userFiltered = selectedEra !== 'Any era' || selectedDifficulty !== 'Any';
    if (filteredSongs.length === 0 && userFiltered) {
      setNoMatchVisible(true);
      if (noMatchTimer.current) clearTimeout(noMatchTimer.current);
      noMatchTimer.current = setTimeout(() => setNoMatchVisible(false), 3000);

      // after showing the toast, reset filters back to defaults so the UI matches the active pool
      if (resetFiltersTimer.current) clearTimeout(resetFiltersTimer.current);
      resetFiltersTimer.current = setTimeout(() => {
        setSelectedEra('Any era');
        setSelectedDifficulty('Any');
      }, 500);
    }

    return () => {
      if (noMatchTimer.current) {
        clearTimeout(noMatchTimer.current);
        noMatchTimer.current = null;
      }
      if (resetFiltersTimer.current) {
        clearTimeout(resetFiltersTimer.current);
        resetFiltersTimer.current = null;
      }
    };
  }, [filteredSongs.length, selectedEra, selectedDifficulty]);

  // active pool falls back to full pool if filters empty
  const activePool = useMemo(() => {
    if (filteredSongs.length === 0) {
      console.warn('No songs match the selected filters — falling back to the full song pool.');
      return EGYPTIAN_SONGS;
    }
    return filteredSongs;
  }, [filteredSongs]);

  useEffect(() => {
    if (activePool.length === 0) return;
    if (songIndex >= activePool.length) setSongIndex(0);
  }, [activePool.length, songIndex]);

  const currentSong = activePool[songIndex] || EGYPTIAN_SONGS[0];

  const challengeSongMap = useMemo(
    () => Object.fromEntries(EGYPTIAN_SONGS.map((song) => [song.id, song])),
    [],
  );

  const challengeActiveSongList = useMemo(() => {
    if (!is1v1Mode || challengeQueue.length === 0) return [];
    return challengeQueue.map((songId) => challengeSongMap[songId]).filter(Boolean);
  }, [challengeQueue, challengeSongMap, is1v1Mode]);

  const challengeCurrentSong = challengeActiveSongList[challengeRoundIndex] || currentSong;

  useEffect(() => {
    setAccent((previous) => {
      const choices = ACCENT_COLORS.filter((color) => color !== previous);
      return choices[Math.floor(Math.random() * choices.length)];
    });
  }, [currentSong.id]);

  const currentSongForView = is1v1Mode ? challengeCurrentSong : currentSong;

  const { audioRef, isPlaying, unlocked, playbackId, playSnippet, playFull, resumeFull, setLooping, pause, unlock, reset } =
    useAudioPlayer(currentSongForView?.src);

  // keep audio volume in sync
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume, audioRef]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    setSuggestions(
      EGYPTIAN_SONGS.filter((s) => {
        const at = (s.arabicTitle || '').toLowerCase();
        const aa = (s.arabicArtist || '').toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          at.includes(q) ||
          aa.includes(q)
        );
      }),
    );
  }, [query]);

  useEffect(() => {
    challengeRoundStartedAt.current = Date.now();
  }, [is1v1Mode, challengeRoundIndex]);

  useEffect(() => {
    if (!is1v1Mode) return;
    setRoundFeedback('');
  }, [challengeRoundIndex, challengeStatus, is1v1Mode]);

  const syncChallengeRecord = useCallback((payload, statusOverride = null) => {
    if (!payload?.challengeId) return;
    const key = `aghanyspot-challenge:${payload.challengeId}`;
    const nextValue = {
      ...payload,
      status: statusOverride || payload.status || 'waiting',
    };

    try {
      window.localStorage.setItem(key, JSON.stringify(nextValue));
    } catch {
      // Ignore when localStorage is unavailable.
    }

    return nextValue;
  }, []);

  const applyChallengeRecord = useCallback((payload) => {
    if (!payload || !Array.isArray(payload.trackIds) || payload.trackIds.length === 0) return;

    const normalizedPayload = {
      ...payload,
      rounds: Number(payload.rounds) || payload.trackIds.length,
      joined: Boolean(payload.joined),
      host: Boolean(payload.host),
    };

    setIs1v1Mode(true);
    setChallengeConfig(normalizedPayload);
    setChallengeQueue(normalizedPayload.trackIds);
    setChallengeRoundIndex(0);
    setChallengeResults([]);
    setChallengeSummary(null);
    setChallengeStatus(normalizedPayload.status || 'waiting');
    setChallengeOpponentResults(buildOpponentResults(normalizedPayload.trackIds, normalizedPayload.rounds, normalizedPayload.seed || Date.now()));
    setGameStatus('PLAYING');
    setStep(0);
    setQuery('');
    setSuggestions([]);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('challenge');
    if (!encoded) return;

    const payload = decodeChallengePayload(encoded);
    if (!payload || !Array.isArray(payload.trackIds) || payload.trackIds.length === 0) return;

    const guestPayload = { ...payload, host: false, joined: Boolean(payload.joined) };
    applyChallengeRecord(guestPayload);
  }, []);

  useEffect(() => {
    if (!challengeConfig?.challengeId) return;

    const storageKey = `aghanyspot-challenge:${challengeConfig.challengeId}`;
    const handleStorage = (event) => {
      if (event.key !== storageKey || !event.newValue) return;

      try {
        const nextPayload = JSON.parse(event.newValue);
        if (!nextPayload) return;
        setChallengeConfig((current) => ({ ...current, ...nextPayload }));
        if (nextPayload.joined === true && challengeStatus === 'waiting') {
          setChallengeConfig((current) => ({ ...current, joined: true }));
        }
        if (nextPayload.status === 'playing' && challengeStatus !== 'playing') {
          setChallengeStatus('playing');
        }
      } catch {
        // Ignore malformed storage payloads.
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [challengeConfig?.challengeId, challengeStatus]);

  const handlePlay = useCallback(() => {
    if (is1v1Mode && challengeStatus !== 'playing') return;
    if (gameStatus !== 'PLAYING') {
      resumeFull();
    } else {
      // always start snippet playback from the start of the track
      playSnippet(step, loopEnabled);
    }
  }, [audioRef, gameStatus, is1v1Mode, challengeStatus, loopEnabled, playSnippet, resumeFull, step]);

  const playUiClick = useCallback(() => {
    const ctx = getClickAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(900, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.07);

    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(Math.min(1, volume * 0.12), ctx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.09);
  }, [volume]);

  const handleLoopToggle = () => {
    if (is1v1Mode && challengeStatus !== 'playing') return;
    setLoopEnabled((enabled) => {
      const nextEnabled = !enabled;
      setLooping(nextEnabled);
      playUiClick();
      return nextEnabled;
    });
  };

  const submitGuess = (selectedSong) => {
    if (gameStatus !== 'PLAYING') return;

    const currentChallengeSong = is1v1Mode ? challengeCurrentSong : currentSong;
    const isCorrect = selectedSong.id === currentChallengeSong.id;

    if (is1v1Mode && challengeConfig) {
      const roundDuration = Number(((Date.now() - challengeRoundStartedAt.current) / 1000).toFixed(1));
      const result = {
        title: currentChallengeSong.title,
        correct: isCorrect,
        seconds: roundDuration,
      };

      const nextResults = [...challengeResults, result];
      setChallengeResults(nextResults);
      setRoundFeedback(isCorrect ? 'Correct!' : `Not this one — it was ${currentChallengeSong.title}`);

      window.setTimeout(() => {
        setRoundFeedback('');
      }, 1200);

      if (challengeRoundIndex + 1 >= challengeConfig.rounds) {
        const finalSummary = buildChallengeSummary(challengeConfig, nextResults, challengeOpponentResults);
        setChallengeSummary(finalSummary);
        setGameStatus('PLAYING');
        setQuery('');
        setSuggestions([]);
        return;
      }

      setQuery('');
      setSuggestions([]);
      window.setTimeout(() => {
        setChallengeRoundIndex((prev) => prev + 1);
        setStep(0);
      }, 1200);
      return;
    }

    setGuesses((prev) => [
      ...prev,
      {
        text: `${selectedSong.title} — ${selectedSong.artist}`,
        correct: isCorrect,
        duration: CLIP_DURATIONS[step],
      },
    ]);
    setQuery('');
    setSuggestions([]);

    if (isCorrect) {
      setGameStatus('WON');
      unlock();
      playFull();
    } else if (step + 1 >= CLIP_DURATIONS.length) {
      setGameStatus('LOST');
      unlock();
      playFull();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    if (gameStatus !== 'PLAYING') return;

    const currentChallengeSong = is1v1Mode ? challengeCurrentSong : currentSong;

    if (is1v1Mode && challengeConfig && challengeStatus === 'playing') {
      if (step + 1 >= CLIP_DURATIONS.length) {
        const roundDuration = Number(((Date.now() - challengeRoundStartedAt.current) / 1000).toFixed(1));
        const nextResults = [...challengeResults, {
          title: currentChallengeSong.title,
          correct: false,
          seconds: roundDuration,
        }];
        setChallengeResults(nextResults);
        setRoundFeedback(`Skipped — it was ${currentChallengeSong.title}`);

        window.setTimeout(() => {
          setRoundFeedback('');
        }, 1200);

        if (challengeRoundIndex + 1 >= challengeConfig.rounds) {
          const finalSummary = buildChallengeSummary(challengeConfig, nextResults, challengeOpponentResults);
          setChallengeSummary(finalSummary);
          setQuery('');
          setSuggestions([]);
          return;
        }

        window.setTimeout(() => {
          setChallengeRoundIndex((prev) => prev + 1);
          setStep(0);
          setQuery('');
          setSuggestions([]);
        }, 1200);
        return;
      }

      pause();
      setStep((prev) => prev + 1);
      return;
    }

    pause();
    if (step + 1 >= CLIP_DURATIONS.length) {
      setGameStatus('LOST');
      unlock();
      playFull();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const resetChallengeMode = () => {
    setIs1v1Mode(false);
    setChallengeConfig(null);
    setChallengeQueue([]);
    setChallengeRoundIndex(0);
    setChallengeResults([]);
    setChallengeSummary(null);
    setChallengeStatus('idle');
    setChallengeModalOpen(false);
    setGameStatus('PLAYING');
    setStep(0);
    setGuesses([]);
    setQuery('');
    setSuggestions([]);
    if (window.location.search) {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }
    reset();
    setSongIndex(() => randInt(activePool.length, -1));
  };

  const resetGame = () => {
    reset();
    setSongIndex((prev) => randInt(activePool.length, prev));
    setStep(0);
    setGuesses([]);
    setGameStatus('PLAYING');
    setQuery('');
  };

  const rerollAll = () => {
    reset();
    setSongIndex((prev) => randInt(activePool.length, prev));
    setStep(0);
    setGuesses([]);
    setGameStatus('PLAYING');
  };

  // When filters change, reset the game and pick a fresh song from the active pool
  useEffect(() => {
    reset();
    setSongIndex(() => randInt(activePool.length, -1));
    setStep(0);
    setGuesses([]);
    setGameStatus('PLAYING');
  }, [selectedEra, selectedDifficulty]);

  const eraOptions = useMemo(() => {
    const set = new Set(EGYPTIAN_SONGS.map((s) => s.era));
    return ['Any era', ...Array.from(set)];
  }, []);

  const showStandardControls = !is1v1Mode && !challengeSummary;

  const shareChallengeLink = useCallback(() => {
    if (!challengeConfig) return;
    const url = new URL(window.location.href);
    url.searchParams.set('challenge', encodeChallengePayload(challengeConfig));
    const link = url.toString();
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopyToast('Challenge link copied to clipboard!');
    setTimeout(() => setCopyToast(''), 2200);
    window.history.replaceState({}, '', url.toString());
    return link;
  }, [challengeConfig]);

  const openChallengeModal = () => {
    setChallengeRoundsInput(5);
    setChallengeError('');
    setChallengeModalOpen(true);
  };

  const confirmChallenge = () => {
    const parsedValue = Number(challengeRoundsInput);
    const rounds = Number.isFinite(parsedValue) ? Math.trunc(parsedValue) : 0;

    if (!Number.isInteger(parsedValue) || rounds < 1 || rounds > 25) {
      setChallengeError('Max is 25 rounds.');
      return;
    }

    setChallengeError('');
    const trackIds = buildChallengeSequence(rounds, Date.now());
    const payload = {
      rounds,
      trackIds,
      challengeId: `challenge-${Date.now()}`,
      challengerId: `challenger-${Math.random().toString(36).slice(2, 10)}`,
      seed: `${Date.now()}`,
      host: true,
      joined: false,
    };

    setChallengeConfig(payload);
    setChallengeQueue(trackIds);
    setChallengeRoundIndex(0);
    setChallengeResults([]);
    setChallengeSummary(null);
    setChallengeOpponentResults(buildOpponentResults(trackIds, rounds, payload.seed));
    setChallengeStatus('waiting');
    setIs1v1Mode(true);
    setChallengeModalOpen(false);
    setGameStatus('PLAYING');
    setStep(0);
    setQuery('');
    setSuggestions([]);

    const url = new URL(window.location.href);
    url.searchParams.set('challenge', encodeChallengePayload(payload));
    window.history.replaceState({}, '', url.toString());
    syncChallengeRecord(payload, 'waiting');
    shareChallengeLink();
  };

  const setChallengeJoined = useCallback((joinedPayload) => {
    const nextPayload = { ...challengeConfig, ...joinedPayload, joined: true, host: false };
    setChallengeConfig(nextPayload);
    setChallengeStatus('waiting');
    setChallengeOpponentResults(buildOpponentResults(nextPayload.trackIds, nextPayload.rounds, nextPayload.seed || Date.now()));
    syncChallengeRecord(nextPayload, 'waiting');
    const url = new URL(window.location.href);
    url.searchParams.set('challenge', encodeChallengePayload(nextPayload));
    window.history.replaceState({}, '', url.toString());
  }, [challengeConfig, syncChallengeRecord]);

  const summaryPlayer = challengeSummary?.player || { total: 0, roundTotal: 0, guessed: [], missed: [] };
  const summaryOpponent = challengeSummary?.opponent || { total: 0, roundTotal: 0, guessed: [], missed: [] };
  const isChallengeRoundsValid = Number.isInteger(challengeRoundsInput) && challengeRoundsInput >= 1 && challengeRoundsInput <= 25;
  const isChallengeHost = Boolean(challengeConfig?.host);

  const challengeButtonLabel = is1v1Mode && challengeStatus === 'waiting' ? (isChallengeHost ? 'Challenge' : 'Waiting') : 'Challenge a Friend';

  return (
    <div className={`app ${isDarkMode ? 'app--dark' : 'app--light'}`}>
      <div className="app__bg" aria-hidden="true" />
      <div className="app__glow app__glow--left" aria-hidden="true" />
      <div className="app__glow app__glow--right" aria-hidden="true" />

      {challengeSummary && is1v1Mode ? (
        <main className="shell">
          <section className="stage challenge-summary-panel">
            <header className="header challenge-summary-header">
              <div className="header__badge">1V1 Results</div>
              <h1 className="header__title">Challenge Complete</h1>
            </header>

            <div className="challenge-summary-grid">
              <div className="challenge-summary-card">
                <h3>Your Results</h3>
                <div className="challenge-summary-total">{summaryPlayer.total}/{summaryPlayer.roundTotal} Guessed</div>
                <div className="challenge-summary-section">
                  <h4>Guessed</h4>
                  {summaryPlayer.guessed.length > 0 ? (
                    <ul>
                      {summaryPlayer.guessed.map((entry, index) => (
                        <li key={`${entry.title}-${index}`}>
                          {entry.title} — {entry.seconds}s
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No correct guesses.</p>
                  )}
                </div>
                <div className="challenge-summary-section">
                  <h4>Missed</h4>
                  {summaryPlayer.missed.length > 0 ? (
                    <ul>
                      {summaryPlayer.missed.map((title, index) => (
                        <li key={`${title}-${index}`}>{title}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Perfect run.</p>
                  )}
                </div>
              </div>

              <div className="challenge-summary-card challenge-summary-card--opponent">
                <h3>Opponent's Results</h3>
                <div className="challenge-summary-total">{summaryOpponent.total}/{summaryOpponent.roundTotal} Guessed</div>
                <div className="challenge-summary-section">
                  <h4>Guessed</h4>
                  {summaryOpponent.guessed.length > 0 ? (
                    <ul>
                      {summaryOpponent.guessed.map((entry, index) => (
                        <li key={`${entry.title}-${index}`}>
                          {entry.title} — {entry.seconds}s
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No correct guesses.</p>
                  )}
                </div>
                <div className="challenge-summary-section">
                  <h4>Missed</h4>
                  {summaryOpponent.missed.length > 0 ? (
                    <ul>
                      {summaryOpponent.missed.map((title, index) => (
                        <li key={`${title}-${index}`}>{title}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Opponent scored perfectly.</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn--primary challenge-return-btn"
              onClick={() => {
                playUiClick();
                resetChallengeMode();
              }}
            >
              Return to Home
            </button>
          </section>
        </main>
      ) : (
        <main className="shell shell--cols">
          {showStandardControls && (
            <aside className="sidebar sidebar--left">
              <div className="panel">
                <h4 className="panel__title">DIFFICULTY</h4>
                <div className="pills">
                  {['Any', 'Easy', 'Medium', 'Hard', 'Expert', 'Impossible'].map((p) => (
                    <button
                      key={p}
                      className={[
                        'pill',
                        selectedDifficulty === p && 'pill--active',
                      ]
                        .join(' ')}
                      onClick={() => {
                        playUiClick();
                        setSelectedDifficulty(p);
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="panel panel--bottom">
                <button className="btn btn--ghost" onClick={() => {
                  playUiClick();
                  rerollAll();
                }}>
                  Reroll all
                </button>
                <button className="btn btn--ghost challenge-trigger-btn" onClick={() => {
                  playUiClick();
                  openChallengeModal();
                }}>
                  Challenge a Friend
                </button>
              </div>
            </aside>
          )}

          <section className="stage">
            <header className="header">
              <div className="header__actions">
                <button
                  type="button"
                  className="challenge-header-btn"
                  aria-label="Challenge a friend"
                  title="Challenge a friend"
                  onClick={() => {
                    playUiClick();
                    openChallengeModal();
                  }}
                >
                  <Users size={18} aria-hidden="true" />
                  <span>{challengeButtonLabel}</span>
                </button>

                <button
                  type="button"
                  className="theme-toggle"
                  onClick={() => {
                    playUiClick();
                    setIsDarkMode((darkMode) => !darkMode);
                  }}
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  aria-pressed={!isDarkMode}
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
              <div className="header__badge">🇪🇬 Egyptian Music</div>
              <h1 className="header__title">AghanySpot</h1>
              <p className="header__subtitle">{is1v1Mode ? `1v1 Round ${challengeRoundIndex + 1}/${challengeConfig?.rounds || 1}` : 'Guess the Song'}</p>
            </header>

            {is1v1Mode && challengeStatus === 'waiting' && (
              <div className="challenge-waiting-bar">
                <div className="challenge-waiting-bar__text">
                  {isChallengeHost ? 'Waiting for opponent to join' : 'Challenge link received'}
                </div>
                <button type="button" className="btn btn--ghost" onClick={() => {
                  playUiClick();
                  shareChallengeLink();
                }}>
                  Copy link
                </button>
                {isChallengeHost ? (
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={!challengeConfig?.joined}
                    onClick={() => {
                      playUiClick();
                      if (challengeConfig?.joined) {
                        setChallengeStatus('playing');
                        syncChallengeRecord({ ...challengeConfig, status: 'playing' }, 'playing');
                      }
                    }}
                  >
                    Start challenge
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => {
                      playUiClick();
                      if (!challengeConfig) return;
                      setChallengeJoined(challengeConfig);
                    }}
                  >
                    Join challenge
                  </button>
                )}
              </div>
            )}

            {roundFeedback && (
              <div className="round-feedback" role="status" aria-live="polite">
                {roundFeedback}
              </div>
            )}

            <div className="card">
              {showStandardControls && (
                <div className="top-row">
                  <div className="era-tabs">
                    {eraOptions.map((era) => (
                      <button
                        key={era}
                        className={['era-pill', selectedEra === era && 'era-pill--active']
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => {
                          playUiClick();
                          setSelectedEra(era);
                        }}
                      >
                        {era}
                      </button>
                    ))}
                  </div>

                  <div className="difficulty-badges">
                    {['Any', 'Easy', 'Medium', 'Hard', 'Expert', 'Impossible'].map((d) => {
                      const cls = d === 'Any' ? 'pill' : `badge badge--${d.toLowerCase()}`;
                      return (
                        <button
                          key={d}
                          className={[cls, selectedDifficulty === d && 'badge--active'].filter(Boolean).join(' ')}
                          onClick={() => {
                            playUiClick();
                            setSelectedDifficulty(d);
                          }}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <ClipProgress step={step} gameStatus={gameStatus} />

              <PlayerDisc
                audioRef={audioRef}
                isPlaying={isPlaying}
                unlocked={unlocked}
                clipDuration={CLIP_DURATIONS[step]}
                accent={accent}
                onPlay={handlePlay}
                onPause={pause}
                step={step}
                playbackId={playbackId}
                loopEnabled={loopEnabled}
                onLoopToggle={handleLoopToggle}
                onUiClick={playUiClick}
              />

              <GuessHistory guesses={guesses} />

              {gameStatus !== 'PLAYING' && !is1v1Mode && (
                <GameResult
                  status={gameStatus}
                  song={currentSong}
                  onNext={resetGame}
                  onReplayFull={gameStatus === 'LOST' ? playFull : resumeFull}
                  onPause={pause}
                  isPlaying={isPlaying}
                  onUiClick={playUiClick}
                />
              )}

              {gameStatus === 'PLAYING' && (
                <SearchBar
                  query={query}
                  suggestions={suggestions}
                  step={step}
                  disabled={is1v1Mode && challengeStatus !== 'playing'}
                  onQueryChange={setQuery}
                  onSelect={submitGuess}
                  onSkip={handleSkip}
                  onUiClick={playUiClick}
                />
              )}
            </div>
          </section>

          {showStandardControls && (
            <aside className="sidebar sidebar--right">
              <div className="panel">
                <h4 className="panel__title">VOLUME</h4>
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
              </div>
            </aside>
          )}
        </main>
      )}

      {challengeModalOpen && (
        <div className="challenge-modal-backdrop" onClick={() => setChallengeModalOpen(false)}>
          <div className="challenge-modal" onClick={(event) => event.stopPropagation()}>
            <h3>How many rounds do you want to play?</h3>
            <label className="challenge-modal__label" htmlFor="challenge-rounds">
              Round count
            </label>
            <input
              id="challenge-rounds"
              type="number"
              step="1"
              min="1"
              max="25"
              value={challengeRoundsInput}
              onChange={(event) => {
                const rawInput = event.target.value;
                const rawValue = Number(rawInput);

                if (rawInput === '') {
                  setChallengeRoundsInput(1);
                  setChallengeError('Max is 25 rounds.');
                  return;
                }

                if (!Number.isInteger(rawValue) || rawValue < 1 || rawValue > 25) {
                  setChallengeRoundsInput(Math.min(25, Math.max(1, Math.trunc(rawValue || 1))));
                  setChallengeError('Max is 25 rounds.');
                  return;
                }

                setChallengeRoundsInput(rawValue);
                setChallengeError('');
              }}
            />
            {challengeError && <p className="challenge-modal__error">{challengeError}</p>}
            <div className="challenge-modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => {
                playUiClick();
                setChallengeModalOpen(false);
              }}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!isChallengeRoundsValid}
                onClick={() => {
                  playUiClick();
                  confirmChallenge();
                }}
              >
                Create challenge
              </button>
            </div>
          </div>
        </div>
      )}

      {copyToast && (
        <div className="copy-toast" role="status">
          {copyToast}
        </div>
      )}
      {/* Temporary non-blocking toast when no songs match the selected filters */}
      <div className={`toast-wrapper`} aria-live="polite">
        <div
          className={[
            'toast',
            noMatchVisible ? 'toast--visible' : 'toast--hidden',
          ]
            .filter(Boolean)
            .join(' ')}
          role="alert"
        >
          <div className="toast__body">For this difficulty there are no songs for this era at this moment.</div>
          <button className="toast__close" onClick={() => {
            playUiClick();
            setNoMatchVisible(false);
          }} aria-label="Dismiss">×</button>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={currentSongForView?.src || currentSong.src}
        preload="auto"
        playsInline
        onEnded={() => pause()}
      />
    </div>
  );
}
