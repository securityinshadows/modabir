import React, { useEffect, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline
} from 'react-leaflet';
import L from 'leaflet';
import { fetchAlerts } from '../../api/alertapi';
import { fetchTrendingAlerts } from '../../api/trendingapi';
import { getRoutes as fetchRoutes } from '../../api/penapi';
import { Alert, TrendingAlert, Route } from '../../utils/types';
import { FaExclamationTriangle, FaFilter, FaQuestionCircle } from 'react-icons/fa';
import { capitalize } from '../../utils/alertUtils';
import CreateReportForm from './CreateReportForm';
import FilterPopup from './FilterPopup';
import DisasterResources from './Resources';
import 'leaflet/dist/leaflet.css';

const DefaultIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const YellowIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapBoxProps {
  selectedAlert: Alert | null;
  filters?: { [key: string]: string | boolean | { latitude: number; longitude: number } | undefined };
  onApplyFilters?: (filters: { [key: string]: string | boolean | { latitude: number; longitude: number } | undefined }) => void;
}

const MapBox: React.FC<MapBoxProps> = ({ selectedAlert, filters = {}, onApplyFilters }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trendingAlerts, setTrendingAlerts] = useState<TrendingAlert[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showResourcesPopup, setShowResourcesPopup] = useState(false);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  const applyFilters = async (appliedFilters: {

    [key: string]: string | boolean | { latitude: number; longitude: number } | undefined;
  }) => {
    try {
      if (onApplyFilters) {
        onApplyFilters(appliedFilters);
      }
      const { nearestOnly, ...sanitizedFilters } = appliedFilters;

      if (nearestOnly && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const data = await fetchAlerts(sanitizedFilters);
            const nearestAlerts = data.filter((alert: Alert) => {
              const [alertLng, alertLat] = alert.location.coordinates;
              const distance = Math.sqrt(
                Math.pow(alertLat - latitude, 2) + Math.pow(alertLng - longitude, 2)
              );
              return distance < 0.5;
            });
            setAlerts(nearestAlerts);
          },
          (error) => {
            console.error('Failed to retrieve location:', error);
          }
        );
      } else {
        const data = await fetchAlerts(sanitizedFilters);
        setAlerts(data);
      }
    } catch (error) {
      console.error('Failed to fetch filtered alerts:', error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [alertsData, trendingData, routesData] = await Promise.all([
          fetchAlerts(filters),
          fetchTrendingAlerts(),
          fetchRoutes(),
        ]);

        setAlerts(alertsData);
        setTrendingAlerts(trendingData);
        setRoutes(routesData);
      } catch (error) {
        console.error('Failed to fetch initial map data:', error);
      }
    };

    fetchInitialData();
  }, [filters]);

  const FlyToSelected = () => {
    const map = useMap();

    useEffect(() => {
      if (selectedAlert) {
        const [lng, lat] = selectedAlert.location.coordinates;
        map.flyTo([lat, lng], 10, { duration: 1.5 });

        const marker = markerRefs.current[selectedAlert._id];
        if (marker) marker.openPopup();
      }
    }, [selectedAlert, map]);

    return null;
  };

  return (
    <div className="map-container">
      <MapContainer
        center={[31.7917, -7.0926]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: '80%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToSelected />

        {alerts.map((alert) => (
          <Marker
            key={alert._id}
            position={[alert.location.coordinates[1], alert.location.coordinates[0]]}
            icon={DefaultIcon}
            ref={(ref) => {
              if (ref) markerRefs.current[alert._id] = ref;
            }}
          >
            <Popup>
              <strong>{capitalize(alert.type)}</strong>
              <br />
              {alert.description || 'No description available.'}
            </Popup>
          </Marker>
        ))}

        {trendingAlerts.map((alert) => (
          <Marker
            key={alert._id}
            position={[alert.location.coordinates[1], alert.location.coordinates[0]]}
            icon={YellowIcon}
            ref={(ref) => {
              if (ref) markerRefs.current[alert._id] = ref;
            }}
          >
            <Popup>
              <strong>{capitalize(alert.type)}</strong>
              <br />
              {alert.summary || 'No summary available.'}
            </Popup>
          </Marker>
        ))}

      {routes?.map((route) => {
        const start = [route.startPoint.coordinates[1], route.startPoint.coordinates[0]];
        const end = [route.endPoint.coordinates[1], route.endPoint.coordinates[0]];
        return (
          <Polyline
            key={route._id}
            positions={[start, end] as  [number, number][]}
            color="black"
            weight={4}
          >
            <Popup>
              <strong>{route.name}</strong><br />
              {route.routeType || 'No type'}
            </Popup>
          </Polyline>
        );
      })} 
         
      </MapContainer>

      <div className="map-controls" style={{ height: '20%' }}>
        <FaFilter size={24} onClick={() => setShowFilterPopup(true)} style={{ cursor: 'pointer' }} />
        <FaExclamationTriangle
          size={24}
          onClick={() => setShowReportForm(true)}
          style={{ cursor: 'pointer' }}
        />
        <FaQuestionCircle
          size={24}
          onClick={() => setShowResourcesPopup(true)}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {showReportForm && <CreateReportForm onClose={() => setShowReportForm(false)} />}
      {showFilterPopup && (
        <FilterPopup
          displayType="alerts"
          onApplyFilters={applyFilters}
          onClose={() => setShowFilterPopup(false)}
        />
      )}
      {showResourcesPopup && (
        <div className="dr-modal-overlay">
          <div className="dr-modal-content">
            <button className="close-button" onClick={() => setShowResourcesPopup(false)}>
              ✖
            </button>
            <DisasterResources />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapBox;
