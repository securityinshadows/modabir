import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './utils/privateRoute';
// Page Imports
import Dashboard from './pages/authority/Dashboard';
import Index from './pages/citizen/Index';
import Unauthorized from './pages/citizen/Unauthorized';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role') || '';
    setIsAuthenticated(!!token);
    setRole(storedRole);
    setLoading(false); // we only render routes after auth info is loaded
  }, []);

  if (loading) return <div>Loading...</div>; // Optional: can replace with spinner or splash screen

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/authority/dashboard"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated} role={role}>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
