import React from 'react';

const ListBox: React.FC = () => {
  return (
    <div className="list-container">
      <div className="list-header">
        <h2>TRENDING REPORTS</h2>
        <p>Check All</p>
      </div>
      <div className="list-items">
        {/* Placeholder lines for now */}
        <div className="list-line"></div>
        <div className="list-line"></div>
      </div>
    </div>
  );
};

export default ListBox;
