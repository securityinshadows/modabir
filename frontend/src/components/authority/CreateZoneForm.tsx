import React, { useState } from 'react';
import { createZone } from '../../api/penapi';
import { getAdminId } from '../../utils/axiosInstance';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface CreateZoneFormProps {
  onClose: () => void;
}

const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const CreateZoneForm: React.FC<CreateZoneFormProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'safe-area' | 'evacuation' | 'medical' | 'shelter' | 'hazard'>('safe-area');
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setCoordinates(prev => [...prev, [lng, lat]]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (coordinates.length < 3) {
      setError('A zone must have at least 3 points');
      return;
    }

    const adminId = getAdminId();
    if (!adminId) {
      setError('You must be logged in to create a zone');
      return;
    }

    try {
      const closedCoordinates = [...coordinates, coordinates[0]];
      
      await createZone({
        name,
        type,
        description,
        geometry: {
          type: 'Polygon',
          coordinates: [closedCoordinates]
        },
        createdBy: adminId,

      });
      console.log('Submiting Zone', JSON.stringify({
        name,
        type,
        description,
        geometry: {
          type: 'Polygon',
          coordinates: [closedCoordinates]
        },
        createdBy: adminId,
      }, null, 2));
      
      onClose();
    } catch (error) {
      console.error('Error creating zone:', error);
      setError('Failed to create zone. Please check your inputs.');
    }
  };

  const clearPoints = () => {
    setCoordinates([]);
  };

  const calculateMapCenter = () => {
    if (coordinates.length === 0) return [31.7917, -7.0926] as [number, number];
    
    const sum = coordinates.reduce((acc, [lng, lat]) => {
      return [acc[0] + lng, acc[1] + lat];
    }, [0, 0]);
    
    return [sum[1] / coordinates.length, sum[0] / coordinates.length] as [number, number];
  };

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
      zIndex: 1000,
      overflow: 'auto'
    }}>
      <div className="modal-content" style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <button 
          className="close-button" 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
        
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ marginTop: 0 }}>Create New Zone</h2>
          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          flex: 1,
          minHeight: 0
        }}>
          {/* Left Column - Form Inputs */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            paddingRight: '0.5rem'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="safe-area">Safe Area</option>
                <option value="evacuation">Evacuation</option>
                <option value="medical">Medical</option>
                <option value="shelter">Shelter</option>
                <option value="hazard">Hazard</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem', flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  minHeight: '100px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* Right Column - Map and Points */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>
            <div style={{ 
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ 
                height: '300px',
                width: '100%',
                border: '2px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '1rem'
              }}>
                <MapContainer
                  center={calculateMapCenter()}
                  zoom={coordinates.length > 0 ? 13 : 6}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler onMapClick={handleMapClick} />
                  {coordinates.map((coord, idx) => (
                    <Marker key={idx} position={[coord[1], coord[0]]} />
                  ))}
                  {coordinates.length > 1 && (
                    <Polyline 
                      positions={[...coordinates, coordinates[0]].map(coord => [coord[1], coord[0]])}
                      color="#3b82f6"
                      weight={3}
                    />
                  )}
                </MapContainer>
              </div>

              <div style={{ 
                flex: '0 0 auto',
                marginBottom: '1rem'
              }}>
                <p style={{ marginBottom: '0.5rem' }}>Click on the map to add points to your zone</p>
                <p>Points: {coordinates.length}</p>
                {coordinates.length > 0 && (
                  <div>
                    <button 
                      type="button" 
                      onClick={clearPoints}
                      style={{ 
                        marginRight: '0.5rem', 
                        padding: '0.5rem 1rem',
                        background: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Clear Points
                    </button>
                    <div style={{ 
                      maxHeight: '150px', 
                      overflowY: 'auto', 
                      marginTop: '0.5rem',
                      border: '1px solid #ddd',
                      padding: '0.5rem',
                      borderRadius: '4px'
                    }}>
                      {coordinates.map((coord, index) => (
                        <div key={index} style={{ 
                          padding: '0.25rem 0',
                          borderBottom: index < coordinates.length - 1 ? '1px solid #eee' : 'none'
                        }}>
                          Point {index + 1}: {coord[1].toFixed(4)}, {coord[0].toFixed(4)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: '#ccc', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={coordinates.length < 3}
            onClick={handleSubmit}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: coordinates.length < 3 ? '#ccc' : '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: coordinates.length < 3 ? 'not-allowed' : 'pointer'
            }}
          >
            Create Zone
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateZoneForm;