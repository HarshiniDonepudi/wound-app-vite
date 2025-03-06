// src/services/woundService.js
import apiClient from './api';


export const getAllWounds = async () => {
  try {

    try {
      const response = await apiClient.get('/wounds/with-status');
      return response.data;
    } catch (err) {
    
      console.log("Annotation status endpoint not available, falling back to basic wounds endpoint");
      const response = await apiClient.get('/wounds');
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching wounds:', error);
    throw error;
  }
};


export const getWoundById = async (woundId) => {
  try {
    const response = await apiClient.get(`/wounds/${woundId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching wound ${woundId}:`, error);
    throw error;
  }
};


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


export const getAnnotations = async (woundId) => {
  try {
    const response = await apiClient.get(`/annotations/${woundId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching annotations for wound ${woundId}:`, error);
    throw error;
  }
};


export const saveAnnotations = async (woundId, annotations) => {
  try {
    const response = await apiClient.post(`/annotations/${woundId}`, annotations);
    return response.data;
  } catch (error) {
    console.error(`Error saving annotations for wound ${woundId}:`, error);
    throw error;
  }
};


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