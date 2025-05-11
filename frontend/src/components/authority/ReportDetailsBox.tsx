import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import './ReportDetailsBox.css';
import { Report } from '../../utils/types';

interface ReportDetailsBoxProps {
  report: Report;
  onClose: () => void;
}

const ReportDetailsBox: React.FC<ReportDetailsBoxProps> = ({ report, onClose }) => {
  const [showSimilarReports, setShowSimilarReports] = useState(false);
  const [similarReports, setSimilarReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimilarReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/reports/${report._id}/similar`);
      setSimilarReports(response.data.data);
    } catch {
      setError('Failed to fetch similar reports.');
    } finally {
      setLoading(false);
    }
  };




  const handleDeleteReport = async () => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await axiosInstance.delete(`/reports/${report._id}`);
        alert('Report successfully deleted.');
            onClose();
       
        // Close the modal after deletion
      } catch {
        setError('Failed to delete the report.');
      }
    }
  };

  const handleDismissAll = async () => {
    if (window.confirm('Are you sure you want to dismiss all similar reports?')) {
      try {
        await axiosInstance.delete(`/reports/${report._id}/similar`);
        setSimilarReports([]);
        alert('All similar reports have been dismissed.');
      } catch {
        setError('Failed to dismiss similar reports.');
      }
    }
  };

  const renderSimilarReports = () => (
    <div className="modal-columns">
      <div className="modal-left">
        <h3>Similar Reports</h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : similarReports.length === 0 ? (
          <p>No similar reports found.</p>
        ) : (
          <div className="report-list">
            {similarReports.map((similarReport) => (
              <div key={similarReport._id} className="list-line mini-line">
                <div>
                  <strong>📢 {similarReport.type.toUpperCase()}</strong>
                </div>
                <div className="summary">
                  {similarReport.description || 'No description provided.'}
                </div>
                <div className="details">
                  📍 Coordinates: {similarReport.location.coordinates.join(', ')} <br />
                  ⏱ Created: {new Date(similarReport.createdAt).toLocaleString()} <br />
                  🚨 Urgency: {similarReport.urgency}
                </div>
              </div>
            ))}
          </div>
        )}
        {similarReports.length > 0 && (
          <button className="dismiss-all-button" onClick={handleDismissAll}>
            Dismiss All
          </button>
        )}
      </div>
      <div className="modal-right">
        {renderReportDetails()}
      </div>
    </div>
  );

  const renderReportDetails = () => (
    <div>
      <h2>{report.type.toUpperCase()}</h2>
      <p>
        <strong>Description:</strong> {report.description || 'No description provided.'}
      </p>
      <p>
        <strong>Coordinates:</strong> {report.location.coordinates.join(', ')}
      </p>
      <p>
        <strong>Urgency:</strong> {report.urgency}
      </p>
      <p>
        <strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}
      </p>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        {showSimilarReports ? (
          renderSimilarReports()
        ) : (
          <div>
            {renderReportDetails()}
            <button
              className="similar-reports-button"
              onClick={() => {
                setShowSimilarReports(true);
                fetchSimilarReports();
              }}
            >
              View Similar Reports
            </button>
            <button className="delete-report-button" onClick={handleDeleteReport}>
         Delete Report
      </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailsBox;