/**
 * Admin Dashboard - Aggregated analytics, trends, severity distribution
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/analytics/admin');
        setAnalytics(data.analytics);
      } catch (e) {
        setAnalytics({});
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  const severityColors = { Low: '#38bdf8', Moderate: '#fb923c', Severe: '#f472b6' };
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

  const trendData = analytics?.trendsByDay?.length
    ? {
        labels: analytics.trendsByDay.map((d) => d.date.slice(5)),
        datasets: [
          {
            label: 'Responses per day',
            data: analytics.trendsByDay.map((d) => d.count),
            backgroundColor: 'rgba(129, 140, 248, 0.6)',
          },
        ],
      }
    : null;

  const participationData = analytics?.participationStats?.length
    ? {
        labels: analytics.participationStats.map((s) => s.title),
        datasets: [
          {
            label: 'Completions',
            data: analytics.participationStats.map((s) => s.completionCount),
            backgroundColor: 'rgba(192, 132, 252, 0.6)',
          },
        ],
      }
    : null;

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <p className="subtitle">Overview of mental health analytics and trends</p>

      <div className="cards-row">
        <div className="stat-card">
          <span className="stat-value">{analytics?.totalResponses || 0}</span>
          <span className="stat-label">Total Responses</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{analytics?.uniqueUsers || 0}</span>
          <span className="stat-label">Unique Users</span>
        </div>
        <Link to="/admin/assessments" className="stat-card link-card">
          <span className="stat-value">→</span>
          <span className="stat-label">Manage Assessments</span>
        </Link>
      </div>

      <div className="admin-charts">
        {severityData && (
          <div className="chart-section">
            <h2>Severity Distribution</h2>
            <div className="chart-box doughnut">
              <Doughnut
                data={severityData}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#a5b4fc' } } } }}
              />
            </div>
          </div>
        )}

        {trendData && (
          <div className="chart-section">
            <h2>Trends (Last 30 Days)</h2>
            <div className="chart-box" style={{ height: 220 }}>
              <Bar
                data={trendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { labels: { color: '#a5b4fc' } } },
                  scales: {
                    x: { ticks: { color: '#a5b4fc' }, grid: { color: 'rgba(255,255,255,0.06)' } },
                    y: { beginAtZero: true, ticks: { color: '#a5b4fc' }, grid: { color: 'rgba(255,255,255,0.06)' } },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {participationData && (
        <div className="chart-section">
          <h2>Assessment Participation</h2>
          <div className="chart-box" style={{ height: 250 }}>
              <Bar
                data={participationData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: { legend: { labels: { color: '#a5b4fc' } } },
                  scales: {
                    x: { beginAtZero: true, ticks: { color: '#a5b4fc' }, grid: { color: 'rgba(255,255,255,0.06)' } },
                    y: { ticks: { color: '#a5b4fc' }, grid: { color: 'rgba(255,255,255,0.06)' } },
                  },
                }}
              />
          </div>
        </div>
      )}

      {analytics?.recentResponses?.length > 0 && (
        <div className="recent-section">
          <h2>Recent Assessments Taken</h2>
          <div className="response-list">
            {analytics.recentResponses.map((r) => (
              <Link
                key={r._id}
                to={`/admin/users/${r.user?._id || r.user}`}
                className="response-item response-item-link"
              >
                <div>
                  <strong>{r.user?.name || 'Unknown User'}</strong>
                  <span className="date">
                    {r.assessment?.title} • {new Date(r.completedAt).toLocaleDateString()}
                  </span>
                </div>
                <span className={`severity severity-${(r.severityLevel || r.severity || '').toLowerCase()}`}>
                  {r.severityLevel || r.severity}
                </span>
                <span className="score">Score: {r.totalScore}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(!analytics?.totalResponses && !analytics?.participationStats?.length) && (
        <div className="empty-state">
          <p>No analytics data yet. Create assessments and assign them to users.</p>
          <Link to="/admin/assessments" className="btn-primary">
            Manage Assessments
          </Link>
        </div>
      )}
    </div>
  );
}
