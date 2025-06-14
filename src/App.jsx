import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WoundListPage from './pages/WoundListPage';
import AnnotationPage from './pages/AnnotationPage';
import { AnnotationProvider } from './contexts/AnnotationContext';
import ManageUsersPage from './pages/ManageUsersPage';
import StatisticsPage from './pages/StatisticsPage';
import ProfilePage from './pages/ProfilePage';
import ReviewWoundsPage from './pages/ReviewWoundsPage';
import OmittedWoundsPage from './pages/OmittedWoundsPage';

function App() {
  const { currentUser } = useAuth();

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/wounds" element={
          <ProtectedRoute>
            <Layout>
              <WoundListPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/annotate/:woundId" element={
          <ProtectedRoute>
            <Layout>
              <AnnotationProvider>
                <AnnotationPage />
              </AnnotationProvider>
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <Layout>
              <ManageUsersPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/stats" element={
          <ProtectedRoute>
            <Layout>
              <StatisticsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/review-wounds" element={currentUser?.role === 'admin' ? <ReviewWoundsPage /> : <div>Access denied.</div>} />
        <Route path="/admin/omitted-wounds" element={currentUser?.role === 'admin' ? <OmittedWoundsPage /> : <div>Access denied.</div>} />
      </Routes>
    </Router>
  );
}

export default App;
