import React, { useEffect, useState } from 'react';
import { fetchTrendingAlerts } from '../../api/trendingapi';
import { TrendingAlert, Report, Route } from '../../utils/types';
import { getTypeIcon, formatDate, generateSummary } from '../../utils/alertUtils';
import AlertBox from './AlertBox';
import CitRepoBox from './CitRepoBox';
import RouteBox from './RouteBox';

interface TrendingListBoxProps {
  onSelectType: (type: 'trending' | 'citizen' | 'alerts' | 'routes') => void;
  onSelectAlert: (alert: TrendingAlert) => void;
  onSelectReport: (report: Report) => void;
  onSelectRoute: (route: Route) => void;
  onRefresh: () => void;
}

const TrendingListBox: React.FC<TrendingListBoxProps> = ({ 
  onSelectType, 
  onSelectAlert, 
  onSelectReport,
  onSelectRoute,
  onRefresh,
}) => {
  const [alerts, setAlerts] = useState<TrendingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'trending' | 'citizen' | 'alerts' | 'routes'>('trending');

  const handleSelectType = (type: 'trending' | 'citizen' | 'alerts' | 'routes') => {
    setSelectedType(type);
    onSelectType(type);
  };

  const getAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchTrendingAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch trending alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedType === 'trending') {
      getAlerts();
      onRefresh(); 
    }
  };

  useEffect(() => {
    if (selectedType === 'trending') {
      getAlerts();
    }
  }, [selectedType]);

  const renderHeaderLabel = (type: string) => {
    switch (type) {
      case 'trending': return 'Trending Reports';
      case 'citizen': return 'Citizen Reports';
      case 'alerts': return 'All Alerts';
      case 'routes': return 'Routes';
      default: return '';
    }
  };

  const renderListContent = () => {
    switch (selectedType) {
      case 'trending':
        return loading ? (
          <div>Loading...</div>
        ) : alerts.length === 0 ? (
          <div>No trending alerts found.</div>
        ) : (
          <>
            <button className="refresh-button" onClick={handleRefresh}>
              Refresh
            </button>
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className="list-line"
                onClick={() => onSelectAlert(alert)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <strong>{getTypeIcon(alert.type)} {alert.type.toUpperCase()}</strong>
                </div>
                <div className="summary">{generateSummary(alert)}</div>
                <div className="details">
                  📝 {alert.reportCount} reports<br />
                  📍 {alert.location.coordinates[1].toFixed(3)}, {alert.location.coordinates[0].toFixed(3)}<br />
                  ⏱ {formatDate(alert.createdAt)}
                </div>
              </div>
            ))}
          </>
        );

      case 'citizen':
        return <CitRepoBox onSelectReport={onSelectReport}
        onRefresh={onRefresh} />;

      case 'alerts':
        return <AlertBox onSelectAlert={() => {}} 
        onRefresh={onRefresh} />;

      case 'routes':
        return <RouteBox onSelectRoute={onSelectRoute} />;
    }
  };

  return (
    <div className="trending-list-box">
      <div className="list-header">
        <div className="dropdown">
        <button className="dropdown-button">  
            {renderHeaderLabel(selectedType)} ▼
          </button> 
          <div className="dropdown-options">
            {['trending', 'citizen', 'alerts', 'routes'].filter(type => type !== selectedType).map((type) => (
              <div 
                key={type} 
                className="dropdown-option" 
                onClick={() => handleSelectType(type as 'trending' | 'citizen' | 'alerts' | 'routes')}
              >
                {renderHeaderLabel(type)} 
              </div> 
            ))} 
          </div> 
        </div>
      </div>

      <div className="list-items">
        {renderListContent()}
      </div>
    </div>
  );
};

export default TrendingListBox;