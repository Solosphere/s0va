// import React from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSort } from '@fortawesome/free-solid-svg-icons'; 

// const SortSection = ({ sortOptions, sortBy, setSortBy, showSort, setShowSort, handleSortChange }) => {
//   return (
//     <div className="sort-section">
//       <button className="sort-button" onClick={() => setShowSort(!showSort)}>
//       <FontAwesomeIcon icon={faSort} size="1x" />
//       </button>

//       {showSort && (
//         <div className="sort-options">
//           <label>
//             Sort by
//             <select
//               value={sortBy}
//               onChange={(e) => {
//                 setSortBy(e.target.value);
//                 handleSortChange();
//               }}
//             >
//               {sortOptions.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </label>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SortSection;

import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';

const SortSection = ({ sortOptions, sortBy, setSortBy, showSort, setShowSort, handleSortChange }) => {
  const sortRef = useRef(null); // Ref to detect outside clicks

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSort(false);
      }
    };

    if (showSort) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSort]);

  return (
    <div className="sort-container" ref={sortRef}>
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
