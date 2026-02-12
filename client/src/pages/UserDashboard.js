/**
 * User Dashboard - Personal analytics, assessment history, progress charts
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

export default function UserDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/analytics/user');
        setAnalytics(data.analytics);
      } catch (e) {
        setAnalytics({ totalResponses: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const severityColors = { Low: '#38bdf8', Moderate: '#fb923c', Severe: '#f472b6' };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#a5b4fc' } },
    },
    scales: {
      x: { ticks: { color: '#a5b4fc' }, grid: { color: 'rgba(255,255,255,0.06)' } },
      y: { min: 0, max: 20, ticks: { color: '#a5b4fc' }, grid: { color: 'rgba(255,255,255,0.06)' } },
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
      <h1>My Dashboard</h1>
      <p className="subtitle">Track your mental health assessment progress</p>

      <div className="cards-row">
        <div className="stat-card">
          <span className="stat-value">{analytics?.totalResponses || 0}</span>
          <span className="stat-label">Total Assessments Completed</span>
        </div>
        <Link to="/assessments" className="stat-card link-card">
          <span className="stat-value">→</span>
          <span className="stat-label">Take New Assessment</span>
        </Link>
      </div>

      {analytics?.totalResponses > 0 ? (
        <>
          <div className="chart-section">
            <h2>Severity Distribution</h2>
            {severityData && (
                <div className="chart-box doughnut">
                <Doughnut
                  data={severityData}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#a5b4fc' } } } }}
                />
              </div>
            )}
          </div>

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
              {analytics?.recentResponses?.slice(0, 5).map((r) => (
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
                  <Link
                    to="/motivation"
                    state={{ result: r, assessmentTitle: r.assessment?.title }}
                    className="response-link"
                  >
                    View Motivation
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>You haven't completed any assessments yet.</p>
          <Link to="/assessments" className="btn-primary">
            View Assigned Assessments
          </Link>
        </div>
      )}
    </div>
  );
}
