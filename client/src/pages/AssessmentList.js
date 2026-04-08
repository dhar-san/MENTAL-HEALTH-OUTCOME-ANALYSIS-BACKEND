/**
 * Assessment List - User's assigned assessments + Quick Assessment
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './AssessmentList.css';

export default function AssessmentList() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/assessments');
        setAssessments(data.assessments || []);
      } catch (e) {
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleQuickAssessment = async () => {
    setQuickLoading(true);
    setQuickError('');
    try {
      const { data } = await api.get('/assessments/random-questions');
      if (data?.assessment?._id) {
        navigate(`/assessments/${data.assessment._id}`);
      } else {
        setQuickError('Failed to load questions');
      }
    } catch (e) {
      setQuickError(e.response?.data?.message || 'Failed to start assessment');
    } finally {
      setQuickLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading assessments...</div>;

  return (
    <div className="assessment-list-page">
      <h1>My Assessments</h1>
      <p className="subtitle">Complete your assigned mental health assessments</p>

      <div className="quick-assessment-card">
        <h3>Quick Assessment</h3>
        <p>Get 10 personalized questions. Each time you take it, you'll receive new questions.</p>
        <button
          className="btn-primary btn-quick"
          onClick={handleQuickAssessment}
          disabled={quickLoading}
        >
          {quickLoading ? 'Loading questions...' : 'Take Quick Assessment →'}
        </button>
        {quickError && <p className="quick-error">{quickError}</p>}
      </div>

      {assessments.length > 0 && (
        <>
          <h2 className="section-title">Assigned Assessments</h2>
          <div className="assessment-grid">
            {assessments.map((a) => (
              <Link key={a._id} to={`/assessments/${a._id}`} className="assessment-card">
                <span className={`type-badge type-${a.type}`}>{a.type}</span>
                <h3>{a.title}</h3>
                {a.description && <p>{a.description}</p>}
                <span className="take-link">Take Assessment →</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {assessments.length === 0 && (
        <div className="empty-state">
          <p>No admin-assigned assessments yet.</p>
          <p className="muted">Use Quick Assessment above, or wait for an admin to assign assessments.</p>
        </div>
      )}
    </div>
  );
}
