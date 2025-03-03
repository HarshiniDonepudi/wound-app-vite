// In src/services/api.js
export const API_URL = 'https://wound-app-vite-1.onrender.com/api';

// Helper function for making API requests
export const apiRequest = async (endpoint, options = {}) => {
  // Make sure endpoint starts with a slash
  const fixedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Get auth token from local storage
  const token = localStorage.getItem('token');
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if it exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Prepare request options
  const requestOptions = {
    ...options,
    headers,
  };
  
  // Make the request - ensure we're using the properly formatted URL
  try {
    const response = await fetch(`${API_URL}${fixedEndpoint}`, requestOptions);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    // Parse JSON response if not expecting blob
    if (options.responseType === 'blob') {
      return await response.blob();
    }
    
    // For empty responses (like 204 No Content)
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};