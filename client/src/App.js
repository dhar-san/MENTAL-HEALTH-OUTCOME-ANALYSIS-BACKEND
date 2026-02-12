/**
 * Main App - Routing and layout
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AssessmentList from './pages/AssessmentList';
import TakeAssessment from './pages/TakeAssessment';
import AdminAssessments from './pages/AdminAssessments';
import AdminCreateAssessment from './pages/AdminCreateAssessment';
import AdminUserProfile from './pages/AdminUserProfile';
import MotivationPage from './pages/MotivationPage';

function PrivateRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

function IndexRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<IndexRoute />} />
      <Route path="/dashboard" element={<PrivateRoute><Layout><UserDashboard /></Layout></PrivateRoute>} />
      <Route path="/assessments" element={<PrivateRoute><Layout><AssessmentList /></Layout></PrivateRoute>} />
      <Route path="/assessments/:id" element={<PrivateRoute><Layout><TakeAssessment /></Layout></PrivateRoute>} />
      <Route path="/motivation" element={<PrivateRoute><Layout><MotivationPage /></Layout></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute adminOnly><Layout><AdminDashboard /></Layout></PrivateRoute>} />
      <Route path="/admin/assessments" element={<PrivateRoute adminOnly><Layout><AdminAssessments /></Layout></PrivateRoute>} />
      <Route path="/admin/assessments/new" element={<PrivateRoute adminOnly><Layout><AdminCreateAssessment /></Layout></PrivateRoute>} />
      <Route path="/admin/assessments/:id/edit" element={<PrivateRoute adminOnly><Layout><AdminCreateAssessment /></Layout></PrivateRoute>} />
      <Route path="/admin/users/:userId" element={<PrivateRoute adminOnly><Layout><AdminUserProfile /></Layout></PrivateRoute>} />
      <Route path="*" element={<IndexRoute />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
