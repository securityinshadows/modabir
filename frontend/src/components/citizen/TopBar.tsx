import React, { useEffect, useState } from 'react';
import { FaComments, FaUserCircle, FaSun, FaMoon } from 'react-icons/fa';
import LoginBox from './LoginBox';
import OperationSideBar from './OperationSideBar';

const TopBar: React.FC = () => {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleLoginPopup = () => {
    setShowLoginPopup(!showLoginPopup);
  };
  
  useEffect(() => {
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }, [isDarkMode]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="top-bar">
      <div className="top-left">
        {isDarkMode ? (
              <FaSun 
                size={24} 
                onClick={() => setIsDarkMode(false)} 
                style={{ cursor: 'pointer', color: '#f1c40f' }} 
              />
            ) : (
              <FaMoon 
                size={24} 
                onClick={() => setIsDarkMode(true)} 
                style={{ cursor: 'pointer', color: '#2c3e50' }} 
              />
            )}
                
      </div>

      <div className="top-center">
        <h1>MODABIR</h1>
      </div>

      <div className="top-right">
        <FaComments size={20} 
        onClick={toggleSidebar}
        style={{ cursor: 'pointer' }}
        />
        <FaUserCircle size={24} onClick={toggleLoginPopup} style={{ cursor: 'pointer' }} />
      </div>
      {showLoginPopup && <LoginBox onClose={toggleLoginPopup} />}
      <OperationSideBar
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
    />   
    </div>

    
  );
};

export default TopBar;