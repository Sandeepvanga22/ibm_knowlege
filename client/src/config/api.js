// API Configuration for different environments
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5000/api',
  },
  production: {
    baseURL: 'https://ibm-knowledge-backend.onrender.com/api',
  },
  test: {
    baseURL: 'http://localhost:5000/api',
  }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Export the appropriate configuration
export const API_BASE_URL = API_CONFIG[environment]?.baseURL || API_CONFIG.development.baseURL;

// For debugging
console.log(`🌐 API Base URL: ${API_BASE_URL} (Environment: ${environment})`);

export default API_CONFIG; 