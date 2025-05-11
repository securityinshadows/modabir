import React from 'react';
import { Route } from '../../utils/types';

interface RoutePopupContentProps {
  route: Route;
}

const RoutePopupContent: React.FC<RoutePopupContentProps> = ({ route }) => {
  return (
    <div>
      <h4>{route.name}</h4>
      <p>Type: {route.routeType}</p>
      <p>Distance: {route.distance} km</p>
      <p>Safety Score: {route.safetyScore}</p>
      <button>Edit</button>
      <button>Delete</button>
    </div>
  );
};

export default RoutePopupContent;