import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaPlusCircle, FaUserCircle, FaSun, FaMoon } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import OperationSideBar from './OperationSideBar';
import RegisterBox from './RegisterBox';

const TopBar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRegisterBoxOpen, setIsRegisterBoxOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleRegisterBox = () => setIsRegisterBoxOpen(!isRegisterBoxOpen);
  const toggleAccountMenu = () => setIsAccountMenuOpen(!isAccountMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };


  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
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
          <FaComments 
            size={24} 
            onClick={toggleSidebar} 
            style={{ cursor: 'pointer' }} 
            className={isSidebarOpen ? 'active' : ''}
          />
          <FaPlusCircle 
            size={24}
            onClick={toggleRegisterBox} 
            style={{ cursor: 'pointer' }} 
          />
          
          <div ref={accountRef} style={{ position: 'relative', display: 'inline-block' }}>
            <FaUserCircle 
              size={24} 
              onClick={toggleAccountMenu} 
              style={{ cursor: 'pointer', verticalAlign: 'middle' }} 
            />
  {isAccountMenuOpen && (
    <div className="account-dropdown">
      <button className="logout-button" onClick={handleLogout}>
        Log Out
      </button>
    </div>
            )}
          </div>
        </div>
      </div>

      <OperationSideBar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {isRegisterBoxOpen && (
        <RegisterBox onClose={() => setIsRegisterBoxOpen(false)} />
      )}
    </>
  );
};

export default TopBar;
