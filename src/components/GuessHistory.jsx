import { CheckCircle2, XCircle, SkipForward } from 'lucide-react';
import { CLIP_DURATIONS } from '../data/songs';

export default function GuessHistory({ guesses }) {
  // render only actual guesses (no empty placeholder rows)
  if (!guesses || guesses.length === 0) return <div className="guess-history" />;

  return (
    <div className="guess-history">
      {guesses.map((guess, idx) => {
        const dur = CLIP_DURATIONS[idx];
        const label = dur ? (dur < 1 ? `${dur.toFixed(1)}s` : `${dur}s`) : '';
        return (
          <div key={idx} className={`guess-row guess-row--filled`}>
            <span className="guess-row__step">{label}</span>
            <div className="guess-row__content">
              {guess.correct && <CheckCircle2 size={16} className="icon--win" />}
              {guess.skipped && <SkipForward size={16} className="icon--skip" />}
              {!guess.correct && !guess.skipped && <XCircle size={16} className="icon--loss" />}
              <span>{guess.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
