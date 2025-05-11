import React, { useState } from 'react';
import TopBar from '../../components/citizen/TopBar';
import MapBox from '../../components/citizen/MapBox';
import AlertBox from '../../components/citizen/AlertBox';
import { Alert } from '../../utils/types';
import '../../styles/citizen/Index.css';

interface AlertFilters {
    [key: string]: string | boolean | { latitude: number; longitude: number } | undefined;
  }

const Index: React.FC = () => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [filters, setFilters] = useState<AlertFilters>({});

    const handleApplyFilters = (newFilters: AlertFilters) => {
        setFilters(newFilters);
      };
    

  
 const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1); // Increment to trigger refresh
  }; 

  const handleSelectAlert = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  return (
    <div className="citizen-page">
    <TopBar />
    <div className="main-area">
      <div className="left-side">
        <MapBox 
        onApplyFilters={handleApplyFilters}
        key={refreshTrigger}
        selectedAlert={selectedAlert} />
      </div>
      <div className="right-side">
        <AlertBox onSelectAlert={handleSelectAlert}
        onRefresh={handleRefresh}
        filters={filters} />
      </div>
    </div>
  </div>
);
};

export default Index;