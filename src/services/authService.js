import { apiRequest } from './api';


export const loginUser = async (username, password) => {
  try {
    console.log('Login attempt starting for:', username);
    
    // Create the request details to examine them
    const url = API_URL + '/auth/login';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    };
    
    console.log('Making fetch request to:', url);
    console.log('With options:', options);
    
    // Try a raw fetch for debugging
    const response = await fetch(url, options);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Login response data:', data);
    return data;
  } catch (error) {
    console.error('Login error details:', error);
    throw error;
  }
};
export const registerUser = async (userData) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};
