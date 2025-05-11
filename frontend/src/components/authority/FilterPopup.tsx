import React, { useState } from 'react';
import './TrendingDetailsBox.css';

interface FilterPopupProps {
  displayType: 'alerts' | 'reports';
  onApplyFilters: (filters: Record<string, string | boolean>) => void;
  onClose: () => void;
}

const FilterPopup: React.FC<FilterPopupProps> = ({
  displayType,
  onApplyFilters,
  onClose,
}) => {
  const [filters, setFilters] = useState<Record<string, string | boolean>>({});

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const alertTypes = ['flood', 'fire', 'earthquake', 'storm', 'medical'];
  const reportTypes = ['flood', 'fire', 'earthquake', 'storm', 'medical'];

  const typeOptions = displayType === 'alerts' ? alertTypes : reportTypes;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '400px' }}>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <h4 style={{ marginBottom: '1rem' }}>Filters</h4>

        {displayType === 'alerts' && (
          <>
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
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {displayType === 'reports' && (
          <>
            <div className="filter-group">
              <label>Urgency:</label>
              <select
                value={(filters.urgency as string) || ''}
                onChange={(e) => handleFilterChange('urgency', e.target.value)}
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
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

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