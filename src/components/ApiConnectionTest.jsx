import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import env from '../config/env';

const ApiConnectionTest = () => {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const testConnection = async () => {
    try {
      setStatus('loading');
      setError(null);
      setMessage('');

      // Try a simple request to check if the API is accessible
      const response = await apiClient.get('/config/etiology-options');
      
      setMessage(`Connection successful! Received ${response.data.length} etiology options.`);
      setStatus('success');
    } catch (err) {
      console.error('API connection error:', err);
      setError(err.message || 'An error occurred while connecting to the API');
      setStatus('error');
    }
  };

  return (
    <div className="api-test-container">
      <h2>API Connection Test</h2>
      <div className="api-info">
        <p><strong>API URL:</strong> {env.API_URL}</p>
        <p><strong>Environment:</strong> {env.IS_PRODUCTION ? 'Production' : 'Development'}</p>
      </div>
      
      <button 
        onClick={testConnection}
        disabled={status === 'loading'}
        className="test-button"
      >
        {status === 'loading' ? 'Testing...' : 'Test API Connection'}
      </button>
      
      {status === 'success' && (
        <div className="success-message">
          ✅ {message}
        </div>
      )}
      
      {status === 'error' && (
        <div className="error-message">
          ❌ Connection failed: {error}
        </div>
      )}
      
      <style jsx>{`
        .api-test-container {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin: 20px 0;
          background-color: #f9f9f9;
        }
        
        .api-info {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #eee;
          border-radius: 4px;
        }
        
        .test-button {
          padding: 10px 15px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .test-button:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }
        
        .success-message {
          margin-top: 15px;
          padding: 10px;
          background-color: #d1fae5;
          color: #065f46;
          border-radius: 4px;
        }
        
        .error-message {
          margin-top: 15px;
          padding: 10px;
          background-color: #fee2e2;
          color: #b91c1c;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default ApiConnectionTest;