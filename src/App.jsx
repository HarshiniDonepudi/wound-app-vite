import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WoundListPage from './pages/WoundListPage';
import AnnotationPage from './pages/AnnotationPage';
import { AnnotationProvider } from './contexts/AnnotationContext';
import AddAnnotatorPage from './pages/AddAnnotatorPage';

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
        
        <Route path="/add-annotator" element={
          <ProtectedRoute>
            <Layout>
              <AddAnnotatorPage />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
