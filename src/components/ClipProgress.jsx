import { CLIP_DURATIONS } from '../data/songs';

export default function ClipProgress({ step, gameStatus }) {
  return (
    <div className="clip-progress">
      {CLIP_DURATIONS.map((dur, i) => {
        const isPast = i < step;
        const isCurrent = i === step && gameStatus === 'PLAYING';
        const isFailed = isPast || (gameStatus === 'LOST' && i <= step);
        const format = dur === 2 ? '2.5s' : dur < 1 ? `${dur.toFixed(1)}s` : `${dur}s`;
        return (
          <div key={dur} className="clip-progress__item">
            <div
              className={[
                'clip-progress__bar',
                isPast && 'clip-progress__bar--past',
                isCurrent && 'clip-progress__bar--current',
                gameStatus === 'LOST' && isFailed && 'clip-progress__bar--failed',
                gameStatus === 'WON' && isPast && 'clip-progress__bar--won',
              ]
                .filter(Boolean)
                .join(' ')}
            />
            <span
              className={[
                'clip-progress__label',
                isCurrent && 'clip-progress__label--current',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {format}
            </span>
          </div>
        );
      })}
    </div>
  );
}
