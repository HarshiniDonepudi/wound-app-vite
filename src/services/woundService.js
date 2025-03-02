import { apiRequest } from './api';

export const getAllWounds = async () => {
  // Use the new endpoint that includes annotation status
  try {
    return await apiRequest('/wounds/with-status');
  } catch (error) {
    console.log("Annotation status endpoint not available, falling back to basic wounds endpoint");
    return apiRequest('/wounds');
  }
};

export const getWoundById = async (woundId) => {
  return apiRequest(`/wounds/${woundId}`);
};

export const getWoundImage = async (woundId) => {
  return apiRequest(`/wounds/${woundId}/image`, {
    responseType: 'blob'
  });
};

export const getAnnotations = async (woundId) => {
  return apiRequest(`/annotations/${woundId}`);
};

export const saveAnnotations = async (woundId, annotations) => {
  return apiRequest(`/annotations/${woundId}`, {
    method: 'POST',
    body: JSON.stringify(annotations),
  });
};

export const getConfigOptions = async () => {
  try {
    const etiologyOptions = await apiRequest('/config/etiology-options');
    const bodyLocations = await apiRequest('/config/body-locations');
    const categoryColors = await apiRequest('/config/category-colors');
    
    return { etiologyOptions, bodyLocations, categoryColors };
  } catch (error) {
    console.error("Error fetching config options:", error);
    throw error;
  }
};