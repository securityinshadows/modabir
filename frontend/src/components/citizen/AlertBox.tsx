import React, { useEffect, useState } from 'react';
import { fetchAlerts } from '../../api/alertapi';
import { Alert } from '../../utils/types';
import { getTypeIcon, formatDate } from '../../utils/alertUtils';

interface AlertBoxProps {
  onSelectAlert: (alert: Alert) => void;
  onRefresh: () => void;
  filters?: { [key: string]: string | boolean | { latitude: number; longitude: number } | undefined };}

const AlertBox: React.FC<AlertBoxProps> = ({ onSelectAlert, onRefresh, filters}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch alerts function to be called on component mount and refresh
  const getAlerts = async () => {
    setLoading(true);  // Set loading to true when fetching
    try {
      const data = await fetchAlerts(filters);
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);  // Set loading to false after fetching
    }
  };


  useEffect(() => {
    getAlerts();
  }, [filters]);

  // Fetch alerts when component mounts
  useEffect(() => {
    getAlerts();
  }, []);

  // Handle refresh click event
  const handleRefresh = () => {
    getAlerts();  // Re-fetch the alerts
    onRefresh();
  };

  return (
    <div className="alert-box">
      <h2>Alerts</h2>
      <button className="refresh-button" onClick={handleRefresh}>
        Refresh
      </button>

      {loading ? (
        <div>Loading...</div>
      ) : alerts.length === 0 ? (
        <div>No alerts found.</div>
      ) : (
        <ul className="alert-list">
          {alerts.map((alert) => (
            <li
              key={alert._id}
              className="alert-item"
              onClick={() => onSelectAlert(alert)}
            >
              <div className="alert-header">
                <strong>
                  {getTypeIcon(alert.type)} {alert.type.toUpperCase()}
                </strong>
              </div>
              <div className="alert-description">
                <p>{alert.description || 'No description provided.'}</p>
              </div>

              <div className="alert-details">
                <p>
                  📍 {alert.location.coordinates[1].toFixed(3)}, {alert.location.coordinates[0].toFixed(3)}
                </p>
                <p>⏱ {formatDate(alert.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertBox;
