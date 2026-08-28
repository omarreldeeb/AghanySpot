import { Pause, Play, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { COVERS, normalizeName } from '../data/covers';

export default function GameResult({ status, song, onNext, onReplayFull, onPause, isPlaying }) {
  const won = status === 'WON';
  const [cover, setCover] = useState(null);

  useEffect(() => {
    if (!song) return;
    const title = normalizeName(song.title || '');
    const artist = normalizeName(song.artist || '');

    // try exact candidates first (based on filename)
    const file = decodeURIComponent((song.src || '').split('/').pop() || '');
    const base = file.replace(/\.[^/.]+$/, '');
    const exactCandidates = [
      `${import.meta.env.BASE_URL}Songs/Covers/${base}.jpg`,
      `${import.meta.env.BASE_URL}Songs/Covers/${base}.jpeg`,
      `${import.meta.env.BASE_URL}Songs/Covers/${base}.png`,
      `${import.meta.env.BASE_URL}Songs/Covers/${base}.webp`,
    ];

    const tryLoad = (url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(null);
        img.src = url;
      });

    (async () => {
      // prefer an explicit cover if provided on the song
      if (song.cover) {
        const ok = await tryLoad(song.cover);
        if (ok) {
          setCover(ok);
          return;
        }
      }
      for (const c of exactCandidates) {
        const ok = await tryLoad(c);
        if (ok) {
          setCover(ok);
          return;
        }
      }

      // fuzzy match against manifest using normalized keys + simple similarity
      const normalizedCovers = COVERS.map((p) => ({
        path: p,
        key: normalizeName(p.split('/').pop().replace(/\.[^/.]+$/, '')),
      }));

      const similarity = (a = '', b = '') => {
        if (!a || !b) return 0;
        const as = a.split('');
        const bs = b.split('');
        let common = 0;
        const bset = new Set(bs);
        for (const ch of as) if (bset.has(ch)) common++;
        return common / Math.max(as.length, bs.length);
      };

      // score covers by similarity to title or artist
      let best = { score: 0, path: null };
      for (const c of normalizedCovers) {
        const s1 = similarity(title, c.key);
        const s2 = similarity(artist, c.key);
        const score = Math.max(s1, s2);
        if (score > best.score) best = { score, path: c.path };
      }

      // pick best if it looks decent, otherwise try to load any matching candidate
      if (best.score >= 0.35 && best.path) {
        const ok = await tryLoad(best.path);
        if (ok) {
          setCover(best.path);
          return;
        }
      }

      // if no confident match, try to load any cover whose filename contains title/artist as substring
      for (const c of normalizedCovers) {
        if (c.key.includes(title) || c.key.includes(artist) || title.includes(c.key) || artist.includes(c.key)) {
          const ok = await tryLoad(c.path);
          if (ok) {
            setCover(c.path);
            return;
          }
        }
      }

      // last resort: try first available cover
      for (const c of COVERS) {
        const ok = await tryLoad(c);
        if (ok) {
          setCover(c);
          return;
        }
      }

      setCover(null);
    })();
  }, [song]);

  return (
    <div className={`game-result-modal`} role="dialog" aria-modal="true">
      <div className={`game-result-card ${won ? 'game-result--won' : 'game-result--lost'}`}>
        <div className="game-result-media">
          {cover ? (
            <img src={cover} alt={`${song.title} cover`} className="game-result-cover" />
          ) : (
            <div className="game-result-cover game-result-cover--placeholder" />
          )}
        </div>
        <div className="game-result-body">
          <h3 className="game-result-status">{won ? 'Correct!' : 'Out of guesses'}</h3>
          <div className="game-result__answer">
            <div className="game-result__title-row">
              <div className="game-result__title">{song.title}</div>
              <button
                type="button"
                className="game-result__play"
                onClick={isPlaying ? onPause : onReplayFull}
                aria-label={isPlaying ? 'Pause song' : 'Play song'}
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              </button>
            </div>
            <div className="game-result__artist">{song.artist}</div>
            <div className="game-result__arabic" dir="rtl">{song.arabicTitle}</div>
          </div>

          <div className="game-result__actions">
            {!isPlaying && (
              <button type="button" className="btn btn--ghost" onClick={onReplayFull}>
                Listen to full track
              </button>
            )}
            <button type="button" className="btn btn--primary" onClick={onNext}>
              <RefreshCw size={16} />
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
