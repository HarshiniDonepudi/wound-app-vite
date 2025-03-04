// src/services/woundService.js
import apiClient from './api';

// Get all wounds with annotation status
export const getAllWounds = async () => {
  try {
    // Try the endpoint that includes annotation status
    try {
      const response = await apiClient.get('/wounds/with-status');
      return response.data;
    } catch (err) {
      // Fall back to basic endpoint if annotation status isn't available
      console.log("Annotation status endpoint not available, falling back to basic wounds endpoint");
      const response = await apiClient.get('/wounds');
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching wounds:', error);
    throw error;
  }
};

// Get a specific wound by ID
export const getWoundById = async (woundId) => {
  try {
    const response = await apiClient.get(`/wounds/${woundId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching wound ${woundId}:`, error);
    throw error;
  }
};

// Get wound image as blob
export const getWoundImage = async (woundId) => {
  try {
    const response = await apiClient.get(`/wounds/${woundId}/image`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching wound image ${woundId}:`, error);
    throw error;
  }
};

// Get annotations for a wound
export const getAnnotations = async (woundId) => {
  try {
    const response = await apiClient.get(`/annotations/${woundId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching annotations for wound ${woundId}:`, error);
    throw error;
  }
};

// Save annotations for a wound
export const saveAnnotations = async (woundId, annotations) => {
  try {
    const response = await apiClient.post(`/annotations/${woundId}`, annotations);
    return response.data;
  } catch (error) {
    console.error(`Error saving annotations for wound ${woundId}:`, error);
    throw error;
  }
};

// Get configuration options
export const getConfigOptions = async () => {
  try {
    const etiologyResponse = await apiClient.get('/config/etiology-options');
    const locationsResponse = await apiClient.get('/config/body-locations');
    const colorsResponse = await apiClient.get('/config/category-colors');
    
    return {
      etiologyOptions: etiologyResponse.data,
      bodyLocations: locationsResponse.data,
      categoryColors: colorsResponse.data
    };
  } catch (error) {
    console.error('Error fetching config options:', error);
    throw error;
  }
};