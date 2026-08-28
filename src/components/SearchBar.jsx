import { Search, SkipForward } from 'lucide-react';
import { CLIP_DURATIONS } from '../data/songs';

export default function SearchBar({
  query,
  suggestions,
  step,
  onQueryChange,
  onSelect,
  onSkip,
}) {
  return (
    <div className="search-bar">
      <div className="search-bar__row">
        <div className="search-bar__input-wrap">
          <Search size={18} className="search-bar__icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Name that track"
            className="search-bar__input"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button type="button" className="search-bar__skip" onClick={onSkip}>
          <SkipForward size={16} />
          <span>{step === CLIP_DURATIONS.length - 1 ? 'Give up' : 'Skip'}</span>
        </button>
      </div>

      {suggestions.length > 0 && (
        <ul className="search-bar__dropdown">
          {suggestions.map((song) => (
            <li key={song.id}>
              <button type="button" onClick={() => onSelect(song)}>
                <span className="search-bar__title">{song.title}</span>
                <span className="search-bar__artist">{song.artist}</span>
                <span className="search-bar__arabic" dir="rtl">
                  {song.arabicTitle} · {song.arabicArtist}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
