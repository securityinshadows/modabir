import React, { useEffect, useState } from 'react';
import { getRoutes, deleteRoute } from '../../api/penapi';
import { Route } from '../../utils/types';

interface RouteBoxProps {
  onSelectRoute: (route: Route) => void;
}

const RouteBox: React.FC<RouteBoxProps> = ({ onSelectRoute }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteRoute = async (id: string) => {
    try {
      await deleteRoute(id);
      setRoutes((prevRoutes) => prevRoutes.filter((route) => route._id !== id));
    } catch (error) {
      console.error('Failed to delete route:', error);
    }
  };


  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await getRoutes();
        setRoutes(data);
      } catch (error) {
        console.error('Failed to fetch routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return (
    <div className="list-items">
      {loading ? (
        <div>Loading...</div>
      ) : routes.length === 0 ? (
        <div>No routes found.</div>
      ) : (
        <ul className="alert-list">
          {routes.map((route) => (
            <li
              key={route._id}
              className="list-line"
              onClick={() => onSelectRoute(route)}
            >
              <div className="rz-header" style={{position: 'relative'}}>
              <button
            className="rz-del-button"
            onClick={() => handleDeleteRoute(route._id)}
          >
            ✕
          </button> 
               <strong>{route.name.toUpperCase()}</strong>

                
              </div>
              <div className="summary">
                <p>{route.routeType || 'No type specified.'}</p>
              </div>
              <div className="details">
                <p>📍 Start: {route.startPoint.coordinates.join(', ')}</p>
                <p>📍 End: {route.endPoint.coordinates.join(', ')}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RouteBox;