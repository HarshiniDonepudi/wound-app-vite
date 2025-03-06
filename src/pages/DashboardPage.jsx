import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getAllWounds, getConfigOptions } from '../services/woundService';
import ApiConnectionTest from '../components/ApiConnectionTest';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalWounds: 0,
    categories: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [showApiTest, setShowApiTest] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Load all wounds
        const wounds = await getAllWounds();
        // Load categories
        const { etiologyOptions } = await getConfigOptions();

        // Generate demo recent activity (in a real app, this would come from your API)
        const recentActivity = [
          {
            id: 1,
            action: 'Created annotation',
            wound_id: wounds.length > 0 ? wounds[0].id : '12345',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            user: currentUser.username
          },
          {
            id: 2,
            action: 'Viewed wound image',
            wound_id: wounds.length > 1 ? wounds[1].id : '67890',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
            user: currentUser.username
          },
          {
            id: 3,
            action: 'Updated annotation',
            wound_id: wounds.length > 0 ? wounds[0].id : '12345',
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
            user: currentUser.username
          }
        ];

        setStats({
          totalWounds: wounds.length,
          categories: etiologyOptions || [],
          recentActivity
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser.username]);

  // Format relative time for activity timestamps
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__inner">
          <div className="dashboard-spinner"></div>
          <p className="dashboard-loading__text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Message */}
      <div className="dashboard-welcome">
        <h1>Welcome, {currentUser.full_name}!</h1>
        <p className="dashboard-subtext">
          Use the Wound Annotation Tool to view and annotate wound images.
        </p>
        
        {/* API Test Toggle */}
        <button 
          onClick={() => setShowApiTest(!showApiTest)}
          className="api-test-toggle"
          style={{
            padding: '8px 12px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            marginTop: '10px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            visibility: 'false'
          }}
        >
          {showApiTest ? 'Hide API Test' : 'Show API Test'}
        </button>
        
        {showApiTest && <ApiConnectionTest />}
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        {/* Total Wounds Card */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <div className="dashboard-icon-wrapper dashboard-icon-wrapper--primary">
              <svg className="dashboard-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="dashboard-card__info">
              <h3 className="dashboard-card__title">Total Wounds</h3>
              <p className="dashboard-card__value">{stats.totalWounds}</p>
            </div>
          </div>
          <div className="dashboard-card__footer">
            <Link to="/wounds" className="dashboard-link">View all wounds</Link>
          </div>
        </div>

        {/* User Role Card */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <div className="dashboard-icon-wrapper dashboard-icon-wrapper--green">
              <svg className="dashboard-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="dashboard-card__info">
              <h3 className="dashboard-card__title">Your Role</h3>
              <p className="dashboard-card__value capitalize">{currentUser.role}</p>
            </div>
          </div>
          <div className="dashboard-card__footer">
            <Link to="/profile" className="dashboard-link">View profile</Link>
          </div>
        </div>

        {/* Categories Card */}
        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <div className="dashboard-icon-wrapper dashboard-icon-wrapper--purple">
              <svg className="dashboard-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="dashboard-card__info">
              <h3 className="dashboard-card__title">Wound Categories</h3>
              <p className="dashboard-card__value">{stats.categories.length}</p>
            </div>
          </div>
          <div className="dashboard-card__footer">
            <span className="dashboard-text--info">Available for annotations</span>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-card">
          <h2 className="dashboard-section-title">Quick Actions</h2>
          <div className="dashboard-actions">
            <Link to="/wounds" className="dashboard-action dashboard-action--primary">
              <div className="dashboard-action__icon-wrapper">
                <div className="dashboard-action__icon-bg">
                  <svg className="dashboard-action__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="dashboard-action__title">Browse Images</h3>
              <p className="dashboard-action__desc">View and annotate wound images</p>
            </Link>

            <Link to="/annotations" className="dashboard-action dashboard-action--green">
              <div className="dashboard-action__icon-wrapper">
                <div className="dashboard-action__icon-bg">
                  <svg className="dashboard-action__icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
              <h3 className="dashboard-action__title">My Annotations</h3>
              <p className="dashboard-action__desc">View recent annotations</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card">
          <h2 className="dashboard-section-title">Recent Activity</h2>
          <ul className="dashboard-activity-list">
            {stats.recentActivity.map((activity) => (
              <li key={activity.id} className="dashboard-activity-item">
                <div className="dashboard-activity-icon-wrapper">
                  <div className="dashboard-activity-icon-bg">
                    <svg className="dashboard-activity-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {activity.action.includes('Created') && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M12 4v16m8-8H4" />
                      )}
                      {activity.action.includes('Updated') && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2" />
                      )}
                      {activity.action.includes('Viewed') && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </div>
                </div>
                <div className="dashboard-activity-content">
                  <p className="dashboard-activity-action">{activity.action}</p>
                  <p className="dashboard-activity-wound">
                    <Link to={`/annotate/${activity.wound_id}`} className="dashboard-link--underline">
                      Wound ID: {activity.wound_id}
                    </Link>
                  </p>
                </div>
                <div className="dashboard-activity-time">
                  {formatRelativeTime(activity.timestamp)}
                </div>
              </li>
            ))}
          </ul>
          <div className="dashboard-activity-footer">
            <Link to="/activity" className="dashboard-link--underline">
              View all activity
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;