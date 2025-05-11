import React, { useState } from 'react';
import TopBar from '../../components/authority/TopBar';
import MapBox from '../../components/authority/MapBox';
import TrendingListBox from '../../components/authority/TrendingListBox';
import AlertBox from '../../components/authority/AlertBox';
import CitRepoBox from '../../components/authority/CitRepoBox';
import TrendingDetailsBox from '../../components/authority/TrendingDetailsBox';
import EditAlertForm from '../../components/authority/EditAlertForm';
import ReportDetailsBox from '../../components/authority/ReportDetailsBox';
import '../../styles/authority/Dashboard.css';
import { Alert, TrendingAlert, Report, Route } from '../../utils/types';

const Dashboard: React.FC = () => {
  const [selectedTrendingAlert, setSelectedTrendingAlert] = useState<TrendingAlert | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [displayType, setDisplayType] = useState<'alerts' | 'reports' | 'trendingAlerts' | 'routes'>('trendingAlerts');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1); // Increment to trigger refresh
  };


  // handlers used to sleect items
  const handleSelectTrendingAlert = (alert: TrendingAlert) => {
    setSelectedTrendingAlert(alert);
    setSelectedAlert(null);
    setSelectedReport(null);
    setShowModal(true);
  };

    const handleSelectRoute = (route: Route) => {
        setSelectedRoute(route);
        setShowModal(true);
    };


  const handleSelectAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setSelectedTrendingAlert(null);
    setSelectedReport(null);
    setShowModal(true);
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setSelectedTrendingAlert(null);
    setSelectedAlert(null);
    setShowModal(true);
  };

  const handleSelectType = (type: 'trending' | 'citizen' | 'alerts' | 'routes') => {
    setDisplayType(
      type === 'trending' ? 'trendingAlerts' :
      type === 'citizen' ? 'reports' :
      type === 'routes' ? 'routes' :
      'alerts'
    );
  };

  // Render the appropriate modal based on the selected item
  const renderDetailsModal = () => {
    if (!showModal) return null;

    if (selectedTrendingAlert) {
      return (
        <TrendingDetailsBox
          alert={selectedTrendingAlert}
          onSelectReport={handleSelectReport}
          onClose={() => {
            setSelectedTrendingAlert(null);
            setShowModal(false);
            
          }}
        />
      );
    }

    if (selectedAlert) {
      return (
        <EditAlertForm
          alert={selectedAlert}
          onClose={() => {
            setSelectedAlert(null);
            setShowModal(false);
          }}
          onUpdate={() => {
            // Refresh alerts or perform any necessary updates
          }}
        />
      );
    }

    if (selectedReport) {
      return (
        <ReportDetailsBox
          report={selectedReport}
          onClose={() => {
            setSelectedReport(null);
            setShowModal(false);
            
          }}
        />
      );
    }

    return null;
  };

  return (
    <div className="dashboard">
      <TopBar />

      <div className="main-area">
        <div className="left-side">
          <MapBox
           key={refreshTrigger}
            selectedAlert={selectedTrendingAlert || selectedAlert || selectedReport}
            displayType={displayType}
            routes={selectedRoute ? [selectedRoute] : []}
          />
        </div>
        <div className="right-side">
          <TrendingListBox 
            
            onSelectType={handleSelectType}
            onSelectAlert={handleSelectTrendingAlert}
            onSelectReport={handleSelectReport} 
            onSelectRoute={handleSelectRoute}
            onRefresh = {handleRefresh}
          />
          <AlertBox 
          onSelectAlert={handleSelectAlert} 
          onRefresh = {handleRefresh}
                                    />
          <CitRepoBox onSelectReport={handleSelectReport} 
                      onRefresh = {handleRefresh}
                                            />
          <div className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`} 
            onClick={() => setIsSidebarOpen(false)} 

          />
        </div>
      </div>

      {renderDetailsModal()}
    </div>
  );
};

export default Dashboard;


