import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { Alert, Report, TrendingAlert, Route } from '../../utils/types';
import { capitalize } from '../../utils/alertUtils';
import { FaPenNib, FaExclamationTriangle, FaFilter, FaRoute } from 'react-icons/fa';
import CreateAlertForm from './CreateAlertForm.tsx';
import CreateZoneForm from './CreateZoneForm.tsx';
import CreateRouteForm from './CreateRouteForm';
import { fetchAlerts } from '../../api/alertapi';
import { fetchTrendingAlerts } from '../../api/trendingapi';
import axiosInstance from '../../utils/axiosInstance';
import FilterPopup from './FilterPopup.tsx'
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const YellowIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png', // Replace with a yellow marker icon URL
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const BlueIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', // Replace with a yellow marker icon URL
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


L.Marker.prototype.options.icon = DefaultIcon;

interface MapBoxProps {
  selectedAlert: Alert | Report | TrendingAlert | null;
  displayType: 'alerts' | 'reports' | 'trendingAlerts' | 'routes';
  routes?: Route[];
}


const FlyToSelected = ({ selectedAlert }: { selectedAlert: Alert | Report | TrendingAlert | null }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedAlert && 'location' in selectedAlert) {
      const [lng, lat] = selectedAlert.location.coordinates;
      map.flyTo([lat, lng], 10, { duration: 1.5 });
    }
  }, [selectedAlert, map]);

  return null;
};

const MapBox: React.FC<MapBoxProps> = ({ selectedAlert, displayType,  routes }) => {
    const [data, setData] = useState<(Alert | Report | TrendingAlert)[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAlertForm, setShowAlertForm] = useState(false);
    const [showPenMenu, setShowPenMenu] = useState(false);
    const [showZoneForm, setShowZoneForm] = useState(false);
    const [showRouteForm, setShowRouteForm] = useState(false);
    const markerRefs = useRef<Record<string, L.Marker>>({});
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [showTrendingFilterWarning, setShowTrendingFilterWarning] = useState(false);
  
    const applyFilters = async (appliedFilters: Record<string, string | boolean>) => {
      try {
        let response;
        if (displayType === 'alerts') {
          response = await axiosInstance.get('/alerts', { params: appliedFilters });
        } else if (displayType === 'reports') {
          response = await axiosInstance.get('/reports', { params: appliedFilters });
        }
        setData(response?.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch filtered data:', error);
      }
    };


 //   const handleFilterClick = () => {
  //      if (displayType === 'trendingAlerts') {
 //         setShowTrendingFilterWarning(true);
  //        setTimeout(() => setShowTrendingFilterWarning(false), 3000);
 //       } else {
 //         setShowFilterPopup(true);
 //       }
 //     };
    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
  
          let response;
          if (displayType === 'alerts') {
            response = await fetchAlerts();
            setData(response);
          } else if (displayType === 'reports') {
            response = await axiosInstance.get('/reports');
            setData(Array.isArray(response.data) ? response.data : response.data.data || []);
          } else if (displayType === 'trendingAlerts') {
            response = await fetchTrendingAlerts();
            setData(response);
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
          setError('Failed to load data');
          setData([]);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [displayType]);
  
    if (loading) {
      return <div className="map-container">Loading map data...</div>;
    }
  
    if (error) {
      return <div className="map-container">{error}</div>;
    }
  
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
  
          <FlyToSelected selectedAlert={selectedAlert} />
  
          {/* Render alerts, reports, or trending alerts */}
{Array.isArray(data) &&
  data.map((item) => {
    if (!item.location || !item.location.coordinates) {
      console.warn('Invalid item location:', item);
      return null;
    }

    const coordinates = item.location.coordinates;
    const lat = coordinates[1];
    const lng = coordinates[0];

    // Determine the icon based on the item type
    let icon = DefaultIcon; // Default to red for alerts
    if ('severity' in item) {
      icon = DefaultIcon; // Red for alerts
    } else if ('summary' in item) {
      icon = YellowIcon; // Yellow for trending alerts
    } else if ('description' in item && !('severity' in item)) {
      icon = BlueIcon; // Blue for citizen reports
    }

    return (
      <Marker
        key={item._id}
        position={[lat, lng]}
        icon={icon}
        ref={(ref) => {
          if (ref) markerRefs.current[item._id] = ref;
        }}
      >
        <Popup>
          <strong>{capitalize(item.type)}</strong>
          <br />
          {'description' in item
            ? item.description
            : 'summary' in item
            ? item.summary
            : 'No details available'}
          <br />
          {item.createdAt && `Created: ${new Date(item.createdAt).toLocaleString()}`}
        </Popup>
      </Marker>
    );
  })}

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

  
          {showZoneForm && (
            <div className="leaflet-top leaflet-left">
              <div className="leaflet-control">
                <CreateZoneForm onClose={() => setShowZoneForm(false)} />
              </div>
            </div>
          )}
  
          {showRouteForm && (
            <div className="leaflet-top leaflet-left">
              <div className="leaflet-control">
                <CreateRouteForm onClose={() => setShowRouteForm(false)} />
              </div>
            </div>
          )}
        </MapContainer>
  
        <div className="map-controls" style={{ height: '20%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '220px', position: 'relative' }}>
          <FaPenNib size={24} onClick={() => setShowPenMenu(!showPenMenu)} style={{ cursor: 'pointer' }} />
          <FaExclamationTriangle size={24} onClick={() => setShowAlertForm(true)} style={{ cursor: 'pointer' }} /> 
          <FaFilter
  size={24}
  onClick={() => displayType !== 'trendingAlerts' && setShowFilterPopup(true)}
  onClickCapture={() => displayType === 'trendingAlerts' && setShowTrendingFilterWarning(true)}
  style={{ cursor: 'pointer' }} onMouseLeave={() => setShowTrendingFilterWarning(false)}/>
          {showTrendingFilterWarning && (
    <div 
      className="trending-filter-warning"
      style={{
        position: 'absolute',
        bottom: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#ff9800',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '4px',
        zIndex: '1000',
        animation: 'fadeInOut 3s ease-in-out'
      }}
    >
      Filtering is not available in Trending view
    </div>
          )}
  
          {showPenMenu && (
            <div className='pen-menu'>
              <button
                onClick={() => {
                  setShowRouteForm(true);
                  setShowPenMenu(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
              >
                <FaRoute /> Create Route
              </button>
            </div>
          )}
        </div>
  
        {showAlertForm && <CreateAlertForm onClose={() => setShowAlertForm(false)} />}
        {showFilterPopup && (displayType === 'alerts' || displayType === 'reports') && (
  <FilterPopup
    displayType={displayType}
    onApplyFilters={applyFilters}
    onClose={() => setShowFilterPopup(false)}
  />
)}
      </div>
    );
  };
  
  export default MapBox;