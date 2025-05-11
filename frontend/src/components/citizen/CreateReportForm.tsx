import React, { useState } from 'react';
import '../../components/authority/CreateAlertForm.css';
import axiosInstance from '../../utils/axiosInstance';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { FaMapMarkerAlt } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import { AxiosError } from 'axios';
import { getAnonId } from '../../utils/anonId';

interface CreateReportFormProps {
  onClose: () => void;
}

const REPORT_TYPES = [
  { value: 'flood', display: 'Flood' },
  { value: 'fire', display: 'Fire' },
  { value: 'earthquake', display: 'Earthquake' },
  { value: 'storm', display: 'Storm' },
  { value: 'medical', display: 'Medical' },
];

const CreateReportForm: React.FC<CreateReportFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    type: '',
    urgency: 'low',
    description: '',
    latitude: '',
    longitude: '',
    anonId: getAnonId(), // check reportController.js and spamGuard.js for more info
  });
  const [showMap, setShowMap] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        setError('');
      },
      () => {
        setError('Unable to retrieve your location. Please allow location access.');
      }
    );
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

      const response = await axiosInstance.post('/reports', {
        type: formData.type,
        urgency: formData.urgency,
        description: formData.description,
        coordinates: [lng, lat],
        anonId: formData.anonId,
      });

      setSuccessMessage('Report submitted successfully!');
      console.log('Report created:', response.data);

      setFormData({ type: '', urgency: 'low', description: '', latitude: '', longitude: '', anonId: '' });
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch (err: unknown) {
        if (err instanceof AxiosError) {
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
        } else {
            setError('An unexpected error occurred. Please try again.');
        }
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
        <h2>Create Report</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label>Type:</label>
            <select name="type" value={formData.type} onChange={handleFormChange} required>
              <option value="">Select a report type</option>
              {REPORT_TYPES.map((reportType) => (
                <option key={reportType.value} value={reportType.value}>
                  {reportType.display}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Urgency:</label>
            <select name="urgency" value={formData.urgency} onChange={handleFormChange}>
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
            <label className="use-map">
              Use Map <br />
              <FaMapMarkerAlt className="map-icon" onClick={() => setShowMap((prev) => !prev)} />
            </label>
          </div>

          <button type="button" className="location-button" onClick={handleUseMyLocation}>
  Use My Location
</button>
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

export default CreateReportForm;