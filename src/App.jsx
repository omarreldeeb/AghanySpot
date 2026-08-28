import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { EGYPTIAN_SONGS, CLIP_DURATIONS } from './data/songs';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import ClipProgress from './components/ClipProgress';
import GuessHistory from './components/GuessHistory';
import PlayerDisc from './components/PlayerDisc';
import SearchBar from './components/SearchBar';
import GameResult from './components/GameResult';
import './App.css';

function randInt(max, exclude = -1) {
  if (max <= 1) return 0;
  let n;
  do {
    n = Math.floor(Math.random() * max);
  } while (n === exclude);
  return n;
}

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

  const { audioRef, isPlaying, unlocked, playSnippet, playFull, pause, unlock, reset } =
    useAudioPlayer(currentSong?.src);

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

  const handlePlay = useCallback(() => {
    if (gameStatus !== 'PLAYING') {
      playFull();
    } else {
      // always start snippet playback from the start of the track
      if (audioRef.current) audioRef.current.currentTime = 0;
      playSnippet(step);
    }
  }, [gameStatus, playFull, playSnippet, step]);

  const submitGuess = (selectedSong) => {
    if (gameStatus !== 'PLAYING') return;

    const isCorrect = selectedSong.id === currentSong.id;
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
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    if (gameStatus !== 'PLAYING') return;
    // advance the clip step but do not record skips in the visible guess history
    if (step + 1 >= CLIP_DURATIONS.length) {
      setGameStatus('LOST');
      unlock();
    } else {
      setStep((prev) => prev + 1);
    }
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

  return (
    <div className="app">
      <div className="app__bg" aria-hidden="true" />
      <div className="app__glow app__glow--left" aria-hidden="true" />
      <div className="app__glow app__glow--right" aria-hidden="true" />

      <main className="shell shell--cols">
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
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setSelectedDifficulty(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="panel panel--bottom">
            <button className="btn btn--ghost" onClick={rerollAll}>
              Reroll all
            </button>
          </div>
        </aside>

        <section className="stage">
          <header className="header">
            <div className="header__badge">🇪🇬 Egyptian Music</div>
            <h1 className="header__title">AghanySpot</h1>
            <p className="header__subtitle">Guess the track</p>
          </header>

          <div className="card">
            <div className="top-row">
              <div className="era-tabs">
                {eraOptions.map((era) => (
                  <button
                    key={era}
                    className={['era-pill', selectedEra === era && 'era-pill--active']
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setSelectedEra(era)}
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
                      onClick={() => setSelectedDifficulty(d)}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <ClipProgress step={step} gameStatus={gameStatus} />

            <PlayerDisc
              audioRef={audioRef}
              isPlaying={isPlaying}
              unlocked={unlocked}
              clipDuration={CLIP_DURATIONS[step]}
              accent={currentSong?.accent}
              onPlay={handlePlay}
              onPause={pause}
              step={step}
            />

            <GuessHistory guesses={guesses} />

            {gameStatus !== 'PLAYING' && (
              <GameResult
                status={gameStatus}
                song={currentSong}
                onNext={resetGame}
                onReplayFull={playFull}
                isPlaying={isPlaying}
              />
            )}

            {gameStatus === 'PLAYING' && (
              <SearchBar
                query={query}
                suggestions={suggestions}
                step={step}
                onQueryChange={setQuery}
                onSelect={submitGuess}
                onSkip={handleSkip}
              />
            )}
          </div>

          <footer className="footer">
            <span>{activePool.length} tracks</span>
            <span className="footer__dot">·</span>
            <span>Song {songIndex + 1}</span>
          </footer>
        </section>

        <aside className="sidebar sidebar--right">
          <div className="panel">
            <h4 className="panel__title">VOLUME</h4>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
          </div>
        </aside>
      </main>
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
          <button className="toast__close" onClick={() => setNoMatchVisible(false)} aria-label="Dismiss">×</button>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={currentSong.src}
        preload="auto"
        playsInline
        onEnded={() => pause()}
      />
    </div>
  );
}
