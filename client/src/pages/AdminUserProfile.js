/**
 * Admin User Profile - View a user's assessment results, graphs, and analytics
 */
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminUserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await api.get(`/analytics/admin/user/${userId}`);
        setData(res);
        setError(null);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load user profile');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetch();
  }, [userId]);

  if (loading) return <div className="loading">Loading user profile...</div>;
  if (error) {
    return (
      <div className="dashboard">
        <p className="loading" style={{ color: 'var(--accent-4)' }}>{error}</p>
        <Link to="/admin" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }
  if (!data?.user) {
    return (
      <div className="dashboard">
        <p className="loading">User not found.</p>
        <Link to="/admin" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const { user, analytics } = data;
  const severityColors = { Low: '#38bdf8', Moderate: '#fb923c', Severe: '#f472b6' };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: 'var(--text-soft)' } },
    },
    scales: {
      x: { ticks: { color: 'var(--text-soft)' }, grid: { color: 'var(--border-glass)' } },
      y: { min: 0, max: 20, ticks: { color: 'var(--text-soft)' }, grid: { color: 'var(--border-glass)' } },
    },
  };

  const severityData = analytics?.severityDistribution
    ? {
        labels: ['Low', 'Moderate', 'Severe'],
        datasets: [
          {
            data: [
              analytics.severityDistribution.Low || 0,
              analytics.severityDistribution.Moderate || 0,
              analytics.severityDistribution.Severe || 0,
            ],
            backgroundColor: [severityColors.Low, severityColors.Moderate, severityColors.Severe],
          },
        ],
      }
    : null;

  const progressCharts = (analytics?.progressByAssessment || []).map((a) => {
    const labels = a.data.map((d) => new Date(d.date).toLocaleDateString());
    const scores = a.data.map((d) => d.score);
    return {
      title: a.title,
      data: {
        labels,
        datasets: [
          {
            label: 'Score',
            data: scores,
            borderColor: '#818cf8',
            backgroundColor: 'rgba(129, 140, 248, 0.1)',
            tension: 0.3,
          },
        ],
      },
    };
  });

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary"
        >
          ← Back
        </button>
      </div>
      <h1>{user.name}</h1>
      <p className="subtitle">{user.email} • {analytics?.totalResponses || 0} assessments completed</p>

      <div className="cards-row">
        <div className="stat-card">
          <span className="stat-value">{analytics?.totalResponses || 0}</span>
          <span className="stat-label">Total Assessments</span>
        </div>
      </div>

      {analytics?.totalResponses > 0 ? (
        <>
          {severityData && (
            <div className="chart-section">
              <h2>Severity Distribution</h2>
              <div className="chart-box doughnut">
                <Doughnut
                  data={severityData}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'var(--text-soft)' } } } }}
                />
              </div>
            </div>
          )}

          {progressCharts.length > 0 && (
            <div className="chart-section">
              <h2>Progress Over Time</h2>
              <div className="progress-charts">
                {progressCharts.map((pc) => (
                  <div key={pc.title} className="chart-box">
                    <h3>{pc.title}</h3>
                    <div className="chart-inner">
                      <Line data={pc.data} options={chartOptions} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="recent-section">
            <h2>Recent Assessments</h2>
            <div className="response-list">
              {analytics?.recentResponses?.map((r) => (
                <div key={r._id} className="response-item">
                  <div>
                    <strong>{r.assessment?.title}</strong>
                    <span className="date">
                      {new Date(r.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`severity severity-${(r.severityLevel || r.severity || '').toLowerCase()}`}>
                    {r.severityLevel || r.severity}
                  </span>
                  <span className="score">Score: {r.totalScore}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>This user hasn't completed any assessments yet.</p>
          <Link to="/admin" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
