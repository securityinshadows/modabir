import React from 'react';
import './TrendingDetailsBox.css';
import { TrendingAlert, Report } from '../../utils/types.js'; 
import { getTypeIcon, capitalize} from '../../utils/alertUtils.js';

interface Props {
  alert: TrendingAlert;
  onSelectReport: (report: Report) => void;
  onClose: () => void;
}
const TrendingDetailsBox: React.FC<Props> = ({ alert, onClose, onSelectReport }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <div className="modal-columns">
          <div className="modal-left">
            <h2>{alert.type.toUpperCase()}</h2>
            <p><strong>Summary:</strong> {alert.summary ? capitalize(alert.summary) : 'No summary provided.'}</p>            <p><strong>Coordinates:</strong> {alert.location.coordinates.join(', ')}</p>
            <p><strong>Reports Involved:</strong> {alert.reportCount}</p>
            <p><strong>Created:</strong> {new Date(alert.createdAt).toLocaleString()}</p>
            <p><strong>Expires:</strong> {new Date(alert.expiresAt).toLocaleString()}</p>
          </div>

          <div className="modal-right">
            <h3>Contributing Reports</h3>
            <div className="report-list">
              {alert.reports.length === 0 ? (
                <p>No reports found.</p>
              ) : (
                alert.reports.map((report) => (
                    <div key={report._id} 
                    className="list-line mini-line"
                    onClick={() => onSelectReport(report)}
                    >
                    <div>
                      <strong>{getTypeIcon(report.type)} {report.type.toUpperCase()}</strong>
                    </div>
                    <div className="summary">
                      {report.description ? report.description : 'No description provided.'}
                    </div>
                    <div className="details">
                        📍 Coordinates: {report.location.coordinates.join(', ')} <br />
                        ⏱ Created: {new Date(report.createdAt).toLocaleString()} <br/>
                        🚨 Urgency: {capitalize(report.urgency)} <br />
                      </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingDetailsBox;
