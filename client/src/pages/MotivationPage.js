/**
 * Motivation & Recovery Page
 * Standalone page for viewing motivation from dashboard (past assessments)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import MotivationRecovery from '../components/MotivationRecovery';
import './Dashboard.css';

export default function MotivationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result);
  const [loading, setLoading] = useState(!location.state?.result);

  useEffect(() => {
    if (location.state?.result) return;
    const fetch = async () => {
      try {
        const { data } = await api.get('/analytics/user');
        const recent = data.analytics?.recentResponses?.[0];
        if (recent) setResult(recent);
      } catch (e) {}
      setLoading(false);
    };
    fetch();
  }, [location.state]);

  if (loading) return <div className="loading">Loading...</div>;

  if (!result) {
    return (
      <div className="dashboard" style={{ textAlign: 'center', padding: '3rem' }}>
        <p className="loading">Complete an assessment first to view your Motivation & Recovery guide.</p>
        <button
          className="btn-primary"
          style={{ marginTop: '1rem' }}
          onClick={() => navigate('/assessments')}
        >
          Take Assessment
        </button>
        <button
          className="btn-secondary"
          style={{ marginTop: '1rem', marginLeft: '0.5rem' }}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <MotivationRecovery
      result={result}
      assessmentTitle={location.state?.assessmentTitle || result.assessment?.title}
    />
  );
}
