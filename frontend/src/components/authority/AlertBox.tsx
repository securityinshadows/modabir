import React, { useEffect, useState } from 'react';
import { fetchAlerts } from '../../api/alertapi';
import { Alert } from '../../utils/types';
import { getTypeIcon, formatDate, capitalize } from '../../utils/alertUtils';
import EditAlertBox from './EditAlertForm';

interface AlertBoxProps {
  onSelectAlert: (alert: Alert) => void;
  onRefresh: () => void;
}

const AlertBox: React.FC<AlertBoxProps> = ({ onSelectAlert, onRefresh }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const getAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    getAlerts();
    onRefresh();
  };

  const handleUpdate = async () => {
    setSelectedAlert(null);
    await getAlerts();
  };

  useEffect(() => {
    getAlerts();
  }, []);

  return (
    <div className="list-items"> 
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
              className="list-line"
              onClick={() => {
                setSelectedAlert(alert);
                onSelectAlert(alert);
              }}
            >
              <div className="alert-header">
                <strong>
                  {getTypeIcon(alert.type)} {alert.type.toUpperCase()}
                </strong>
              </div>
              <div className="summary">
                <p>{alert.description || 'No description provided.'}</p>
              </div>
              <div className="details">
                <p>
                  📍 {alert.location.coordinates[1].toFixed(3)}, {alert.location.coordinates[0].toFixed(3)}
                </p>
                <p>🚨 {capitalize(alert.severity) || 'No urgency specified'} </p>
                <p>⏱ {formatDate(alert.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {selectedAlert && (
        <EditAlertBox
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div> 
  );
};

export default AlertBox;