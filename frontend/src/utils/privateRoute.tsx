import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  isAuthenticated: boolean;
  role: string;
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isAuthenticated, role, children }) => {
  // Check if the user is authenticated, if not, redirect to the home page
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Check if the user has the necessary role, if not, redirect to the unauthorized page
  if (role !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }

  // Render the protected route if authenticated and authorized
  return <>{children}</>;
};

export default PrivateRoute;
