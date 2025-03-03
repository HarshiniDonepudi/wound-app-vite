import { apiRequest } from './api';


export const loginUser = async (username, password) => {
  // Notice the path starts with a slash
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};
export const registerUser = async (userData) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};
