import { CLIP_DURATIONS } from '../data/songs';

export default function ClipProgress({ step, gameStatus }) {
  return (
    <div className="clip-progress">
      {CLIP_DURATIONS.map((dur, i) => {
        const isPast = i < step;
        const isCurrent = i === step && gameStatus === 'PLAYING';
        const isFailed = isPast || (gameStatus === 'LOST' && i <= step);
        const displayValue = dur === 0.35 ? '0.5' : dur === 1.5 ? '2' : dur;
        const format = displayValue < 1 ? `${Number(displayValue).toFixed(1)}s` : `${displayValue}s`;
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
