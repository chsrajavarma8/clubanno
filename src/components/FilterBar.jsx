import { CATEGORIES } from '../data/seed'

export default function FilterBar({ activeFilters, onToggleFilter, onClear, matchCount, totalCount }) {
  const filtering = activeFilters.length > 0
  return (
    <div className="filter-bar">
      <div className="filter-chips">
        <button
          type="button"
          className={`chip${activeFilters.length === 0 ? ' selected' : ''}`}
          onClick={onClear}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat}
            className={`chip${activeFilters.includes(cat) ? ' selected' : ''}`}
            onClick={() => onToggleFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      {filtering && typeof matchCount === 'number' && (
        <span className="filter-count">
          Showing {matchCount} of {totalCount}
        </span>
      )}
    </div>
  )
}
