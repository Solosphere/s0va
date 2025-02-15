import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons'; 

const SortSection = ({ sortOptions, sortBy, setSortBy, showSort, setShowSort, handleSortChange }) => {
  return (
    <div className="sort-section">
      <button className="sort-button" onClick={() => setShowSort(!showSort)}>
      <FontAwesomeIcon icon={faSort} size="1x" />
      </button>

      {showSort && (
        <div className="sort-options">
          <label>
            Sort by
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                handleSortChange();
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
};

export default SortSection;
