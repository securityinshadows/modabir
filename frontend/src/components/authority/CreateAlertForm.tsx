import React, { useState } from 'react';
import './CreateAlertForm.css';
import axiosInstance from '../../utils/axiosInstance';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { FaMapMarkerAlt } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

interface CreateAlertFormProps {
  onClose: () => void;
}

const ALERT_TYPES = [
  { value: 'fire', display: 'Fire' },
  { value: 'flood', display: 'Flood' },
  { value: 'earthquake', display: 'Earthquake' },
  { value: 'storm', display: 'Storm' },
  { value: 'medical', display: 'Medical' },
  { value: 'other', display: 'Other' },
];

const CreateAlertForm: React.FC<CreateAlertFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    type: '',
    severity: 'low',
    description: '',
    latitude: '',
    longitude: '',
  });
  const [showMap, setShowMap] = useState(false); // Toggle map visibility
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates. Please enter valid latitude and longitude.');
      }

      const response = await axiosInstance.post('/alerts', {
        type: formData.type,
        severity: formData.severity,
        description: formData.description,
        coordinates: [lng, lat],
      });

      setSuccessMessage('Alert created successfully!');
      console.log('Alert created:', response.data);

      // Reset form and close modal
      setFormData({ type: '', severity: 'low', description: '', latitude: '', longitude: '' });
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000); // Close modal after 2 seconds
    } catch  {
      setError('Failed to create alert. Please try again.');
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setFormData((prev) => ({
          ...prev,
          latitude: e.latlng.lat.toFixed(6),
          longitude: e.latlng.lng.toFixed(6),
        }));
      },
    });
    return null;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <h2>Create Alert</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>Type:</label>
            <select name="type" value={formData.type} onChange={handleFormChange} required>
              <option value="">Select an alert type</option>
              {ALERT_TYPES.map((alertType) => (
                <option key={alertType.value} value={alertType.value}>
                  {alertType.display}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Severity:</label>
            <select name="severity" value={formData.severity} onChange={handleFormChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea name="description" value={formData.description} onChange={handleFormChange} required />
          </div>
          <div className="form-group">
          
            <label>Latitude:</label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Longitude:</label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleFormChange}
              required
            />
            <label className="use-map"> Use Map <br />
            <FaMapMarkerAlt className="map-icon" onClick={() => setShowMap((prev) => !prev)} />
            </label>
        
          </div>
          {showMap && (
            <div className="map-container">
              <MapContainer
                center={[31.7917, -7.0926]} // Morocco
                zoom={6}
                style={{ height: '300px', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler />
                {formData.latitude && formData.longitude && (
                  <Marker
                    position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
                  />
                )}
              </MapContainer>
            </div>
          )}
          <div className="form-buttons">
            <button type="submit" className="submit-button">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAlertForm;