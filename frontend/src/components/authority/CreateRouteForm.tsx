import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { createRoute } from '../../api/penapi';
import { getAdminId } from '../../utils/axiosInstance';

interface CreateRouteFormProps {
  onClose: () => void;
}

// Custom marker icon
const createMarkerIcon = () => {
  return new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Map click handler component
const MapClickHandler: React.FC<{ 
  onMapClick: (latlng: L.LatLng) => void,
  coordinates: [number, number][]
}> = ({ onMapClick, coordinates }) => {
   useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });

  return (
    <>
      {coordinates.map((coord, index) => (
        <Marker key={index} position={[coord[1], coord[0]]} icon={createMarkerIcon()}>
          <Popup>
            Point {index + 1}<br />
            Lat: {coord[1].toFixed(4)}, Lng: {coord[0].toFixed(4)}
          </Popup>
        </Marker>
      ))}
      {coordinates.length > 1 && (
        <Polyline 
          positions={coordinates.map(coord => [coord[1], coord[0]])} 
          color="blue" 
        />
      )}
    </>
  );
};

const CreateRouteForm: React.FC<CreateRouteFormProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [routeType, setType] = useState<'evacuation' | 'supply' | 'emergency-access'>('evacuation');
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);

  const handleMapClick = useCallback((latlng: L.LatLng) => {
    const { lat, lng } = latlng;
    setCoordinates(prev => [...prev, [lng, lat]]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (coordinates.length < 2) {
      alert('A route must have at least 2 points');
      return;
    }
  
    const adminId = getAdminId();
    if (!adminId) {
      alert('You must be logged in to create a route');
      return;
    }
  
    try {
      await createRoute({
        name,
        routeType,
        coordinates,
        start: coordinates[0], // Add this
        end: coordinates[coordinates.length - 1], // Add this
        startPoint: {
          type: 'Point',
          coordinates: coordinates[0],
        },
        endPoint: {
          type: 'Point',
          coordinates: coordinates[coordinates.length - 1],
        },
        createdBy: adminId,
      });
      onClose();
    } catch (error) {
      console.error('Error creating route:', error);
    }
  };

  // const clearPoints = () => {
  //  setCoordinates([]);
  //};

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="form-container" style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '80%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer'
        }}>
          ✕
        </button>
        
        <h2 style={{ marginTop: 0 }}>Create New Route</h2>
        
        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Route Name</label>
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
      style={{ width: '100%', padding: '0.5rem' }}
    />
  </div>

  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Route Type</label>
    <select
      value={routeType}
      onChange={(e) => setType(e.target.value as 'evacuation' | 'supply' | 'emergency-access')}
      style={{ width: '100%', padding: '0.5rem' }}
    >
      <option value="evacuation">Evacuation</option>
      <option value="supply">Supply</option>
      <option value="emergency-access">Emergency Access</option>
    </select>
  </div>

  <div style={{ height: '400px', border: '1px solid #ddd', marginBottom: '1rem' }}>
    <MapContainer
      center={[31.7917, -7.0926]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler onMapClick={handleMapClick} coordinates={coordinates} />
    </MapContainer>
  </div>

  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
    <button
      type="button"
      onClick={onClose}
      style={{
        padding: '0.75rem 1.5rem',
        background: '#f0f0f0',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={coordinates.length < 2}
      style={{
        padding: '0.75rem 1.5rem',
        background: coordinates.length < 2 ? '#ccc' : '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: coordinates.length < 2 ? 'not-allowed' : 'pointer',
      }}
    >
      Create Route
    </button>
  </div>
</form>
      </div>
    </div>
  );
};

export default CreateRouteForm;