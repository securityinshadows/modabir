import React, { useState } from 'react';
import './CreateAlertForm.css';
import axiosInstance from '../../utils/axiosInstance';
import { Alert } from '../../utils/types';
import { AxiosError } from 'axios';
import { updateAlert } from '../../api/alertapi';

interface EditAlertBoxProps {
  alert: Alert;
  onClose: () => void;
  onUpdate: () => void; // Callback to refresh the alert list after update/delete
}

const ALERT_TYPES = [
  { value: 'fire', display: 'Fire' },
  { value: 'flood', display: 'Flood' },
  { value: 'earthquake', display: 'Earthquake' },
  { value: 'storm', display: 'Storm' },
  { value: 'medical', display: 'Medical' },
];

const EditAlertBox: React.FC<EditAlertBoxProps> = ({ alert, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    type: alert.type,
    severity: alert.severity,
    description: alert.description,
    latitude: alert.location.coordinates[1].toString(),
    longitude: alert.location.coordinates[0].toString(),
  });
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

      const updatedData = {
        type: formData.type,
        severity: formData.severity,
        description: formData.description,
        coordinates: [lng, lat],
      };
  
      await updateAlert(alert._id, updatedData);

      setSuccessMessage('Alert updated successfully!');
      onUpdate(); // Refresh the alert list
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch (unknown) {
        if (unknown instanceof AxiosError) {
            setError(unknown.response?.data?.message || 'Failed to update alert. Please try again.');
        } else {
            setError('An unexpected error occurred. Please try again.');
        }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await axiosInstance.delete(`/alerts/${alert._id}`);
        setSuccessMessage('Alert deleted successfully!');
        setTimeout(() => {
          onClose();
        }, 2000);
      } catch (unknown) {
        if (unknown instanceof AxiosError) {
          setError('Failed to delete alert. Please try again.');
        }
        else {
            setError('An unexpected error occurred. Please try again.');
        }
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <h2>Edit Alert</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
          <label>Type:&nbsp;   
            {
                ALERT_TYPES.find((alertType) => alertType.value === formData.type)?.display || formData.type
            } </label>
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
          </div>
          <div className="form-buttons">
            <button type="submit" className="submit-button">
              Update
            </button>
            <button type="button" className="submit-button" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAlertBox;