import { useState, useEffect } from "react";
import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { useParams, useLocation } from "react-router-dom";

import TraineeLayout from './Trainee/TraineeLayout';
import TraineeOverview from './Trainee/TraineeOverview';

import TraineeProfileSettings from './Trainee/TraineeProfileSettings';

export default function TraineeDashboard({ defaultTab }) {
  const { traineeId: paramTraineeId } = useParams();
  const traineeId = paramTraineeId || localStorage.getItem("traineeId") || "T102";
  const location = useLocation();

  // Determine initial tab from props or URL pathname
  const getInitialTab = () => {
    if (defaultTab) return defaultTab;
    const path = location.pathname.toLowerCase();
    if (path.includes('/jobs')) return 'jobs';
    if (path.includes('/skills')) return 'skills';
    if (path.includes('/applications')) return 'applications';
    if (path.includes('/profile') || path.includes('/settings')) return 'profile';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");



  const fetchPortalData = async () => {
    setError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/dashboard`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unable to load trainee portal data.");
      setPortalData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load trainee portal data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [traineeId]);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname, defaultTab]);



  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: '#64748b', fontWeight: 500 }}>Loading Trainee Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <TraineeLayout activeTab={activeTab} onTabChange={setActiveTab} portalData={portalData}>
      {error && <div role="alert" style={{ margin: '1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '0.85rem 1rem' }}>{error}</div>}

      
      {activeTab === 'overview' && (
        <TraineeOverview
          portalData={portalData}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'profile' && (
        <TraineeProfileSettings
          onProfileUpdated={fetchPortalData}
        />
      )}

    </TraineeLayout>
  );
}
