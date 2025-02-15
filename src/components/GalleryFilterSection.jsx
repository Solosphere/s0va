import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons'; 

const GalleryFilterSection = ({ filters, setFilters, showFilters, setShowFilters, handleFilterChange  }) => {
    return (
        <div className="filter-section">
            <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
            <FontAwesomeIcon icon={faFilter} size="1x" />
            </button>
       

            {showFilters && (
        <div className="filters">
          <label>
            Date
            <select
              value={filters.date}
              onChange={(e) => {
                setFilters({ ...filters, date: e.target.value });
                handleFilterChange(); 
            }}
            >
              <option value="all">All</option>
              <option value="2018">2018</option>
              <option value="2019">2019</option>
              <option value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>
          </label>

          <label>
            Media
            <select
              value={filters.media}
              onChange={(e) => {
                setFilters({ ...filters, media: e.target.value });
                handleFilterChange(); 
            }}
            >
              <option value="all">All</option>
              <option value="Digital">Digital</option>
              <option value="Website">Website</option>
              <option value="Oil">Oil</option>
              <option value="Tattoo">Tattoo</option>
              <option value="Acrylic">Acrylic</option>
              <option value="Marker">Marker</option>
              <option value="Graphite">Graphite</option>
              <option value="Charcoal">Charcoal</option>
              <option value="Sculpture">Sculpture</option>
              <option value="Collage">Collage</option>
              <option value="Video">Video</option>
            </select>
          </label>
        </div>
      )}
    </div>
    );
};

export default GalleryFilterSection;