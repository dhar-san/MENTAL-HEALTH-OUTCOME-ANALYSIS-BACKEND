/**
 * Admin Assessments - List, edit, delete, assign assessments
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './AdminAssessments.css';

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [aRes, uRes] = await Promise.all([
          api.get('/assessments'),
          api.get('/users'),
        ]);
        setAssessments(aRes.data.assessments || []);
        setUsers(uRes.data.users || []);
      } catch (e) {
        setAssessments([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/assessments/${id}`);
      setAssessments((prev) => prev.filter((a) => a._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  const handleAssign = async () => {
    if (!assignModal || selectedUserIds.length === 0) return;
    try {
      await api.post(`/assessments/${assignModal}/assign`, {
        userIds: selectedUserIds,
      });
      setAssignModal(null);
      setSelectedUserIds([]);
      alert('Assessment assigned successfully');
    } catch (e) {
      alert(e.response?.data?.message || 'Assign failed');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-assessments">
      <div className="page-header">
        <h1>Manage Assessments</h1>
        <Link to="/admin/assessments/new" className="btn-primary">
          Create Assessment
        </Link>
      </div>

      <div className="assessment-table-wrap">
        <table className="assessment-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr key={a._id}>
                <td>
                  <strong>{a.title}</strong>
                </td>
                <td>
                  <span className={`type-badge type-${a.type}`}>{a.type}</span>
                </td>
                <td>{(a.questions || []).length}</td>
                <td>
                  <div className="actions">
                    <Link to={`/admin/assessments/${a._id}/edit`} className="btn-sm">
                      Edit
                    </Link>
                    <button
                      className="btn-sm assign"
                      onClick={() => setAssignModal(a._id)}
                    >
                      Assign
                    </button>
                    <button
                      className="btn-sm delete"
                      onClick={() => handleDelete(a._id, a.title)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assessments.length === 0 && (
        <div className="empty-state">
          <p>No assessments yet. Create your first assessment.</p>
          <Link to="/admin/assessments/new" className="btn-primary">
            Create Assessment
          </Link>
        </div>
      )}

      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Assign Assessment to Users</h3>
            <div className="user-checkboxes">
              {users.map((u) => (
                <label key={u._id} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(u._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds((prev) => [...prev, u._id]);
                      } else {
                        setSelectedUserIds((prev) => prev.filter((id) => id !== u._id));
                      }
                    }}
                  />
                  {u.name} ({u.email})
                </label>
              ))}
            </div>
            {users.length === 0 && <p className="muted">No users available</p>}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setAssignModal(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAssign}
                disabled={selectedUserIds.length === 0}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
