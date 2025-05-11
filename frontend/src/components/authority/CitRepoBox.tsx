import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Report } from '../../utils/types';

interface CitRepoBoxProps {
  onSelectReport: (report: Report) => void;
  onRefresh: () => void;
}

const CitRepoBox: React.FC<CitRepoBoxProps> = ({ onSelectReport, onRefresh }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/reports');
      setReports(response.data.data);
      setError(null);
    } catch {
      setError('Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchReports();
    onRefresh();
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="list-items">
      <button className="refresh-button" onClick={handleRefresh}>
        Refresh
      </button>
      {reports.length === 0 ? (
        <div>No reports found.</div>
      ) : (
        reports.map((report) => (
          <div 
            key={report._id} 
            className="list-line" 
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectReport(report)}
          >
            <div>
              <strong>📢 {report.type.toUpperCase()}</strong>
            </div>
            <div className="summary">{report.description}</div>
            <div className="details">
              📍 {report.location.coordinates[1].toFixed(3)}, {report.location.coordinates[0].toFixed(3)}<br />
              ⏱ {new Date(report.createdAt).toLocaleString()}<br />
              🚨 Urgency: {report.urgency}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CitRepoBox;