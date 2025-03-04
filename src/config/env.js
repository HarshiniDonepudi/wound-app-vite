// Environment variables with fallbacks
const env = {
    // API URL from environment variable, with fallback
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    
    // Is this a production environment?
    IS_PRODUCTION: import.meta.env.MODE === 'production',
    
    // Version information
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '0.1.0',
    
    // Other environment-specific settings can go here
  };
  
  // Log environment config in non-production environments
  if (!env.IS_PRODUCTION) {
    console.log('Environment Configuration:', env);
  }
  
  export default env;