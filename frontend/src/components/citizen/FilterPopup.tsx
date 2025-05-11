import React, { useState } from 'react';
import '../authority/TrendingDetailsBox.css';

interface FilterPopupProps {
  displayType: 'alerts';
  onApplyFilters: (filters: { [key: string]: string | boolean | { latitude: number; longitude: number } | undefined }) => void;
  onClose: () => void;
}

const FilterPopup: React.FC<FilterPopupProps> = ({ onApplyFilters, onClose }) => {
  const [filters, setFilters] = useState<{ [key: string]: string | boolean | { latitude: number; longitude: number } | undefined }>({});
  const [nearestOnly, setNearestOnly] = useState<boolean>(false);

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters({ ...filters, nearestOnly });
    onClose();
  };

  const alertTypes = ['flood', 'fire', 'earthquake', 'storm', 'medical'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '400px' }}>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <h4 style={{ marginBottom: '1rem' }}>Filters</h4>

        <div className="filter-group">
          <label>Severity:</label>
          <select
            value={(filters.severity as string) || ''}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="filter-input"
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Type:</label>
          <select
            value={(filters.type as string) || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="filter-input"
          >
            <option value="">All</option>
            {alertTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={nearestOnly}
              onChange={() => setNearestOnly((prev) => !prev)}
            />
            Show Nearest Alerts Only
          </label>
        </div>

        <div className="filter-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="apply-button" onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;