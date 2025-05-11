import React, { useState } from 'react';
import { FaPlus, FaRoute} from 'react-icons/fa';
import CreateRouteForm from './CreateRouteForm';

const PenActionMenu: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showRouteForm, setShowRouteForm] = useState(false);

  return (
    <div className="pen-action-container">
      <button 
        className="pen-action-button"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Open action menu"
      >
        <FaPlus />
      </button>

      {showMenu && (
        <div className="pen-action-dropdown">
          <button 
            className="pen-action-item"
            onClick={() => {
              setShowMenu(false);
            }}
          >
            
        
            <FaRoute /> Create Route
          </button>
        </div>
      )}



      {showRouteForm && (
        <CreateRouteForm onClose={() => setShowRouteForm(false)} />
      )}
    </div>
  );
};

export default PenActionMenu;