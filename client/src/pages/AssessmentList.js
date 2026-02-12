/**
 * Assessment List - User's assigned assessments
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './AssessmentList.css';

export default function AssessmentList() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="loading">Loading assessments...</div>;

  return (
    <div className="assessment-list-page">
      <h1>My Assessments</h1>
      <p className="subtitle">Complete your assigned mental health assessments</p>

      {assessments.length === 0 ? (
        <div className="empty-state">
          <p>No assessments assigned to you yet.</p>
          <p className="muted">An admin will assign assessments to you.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
