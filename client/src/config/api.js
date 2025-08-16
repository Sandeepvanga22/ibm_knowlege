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

// Detect if we're on GitHub Pages
const isGitHubPages = window.location.hostname === 'sandeepvanga22.github.io';

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Special handling for GitHub Pages
let apiBaseURL;
if (isGitHubPages) {
  // For GitHub Pages, use a working backend URL
  // Using a simple backend that works immediately
  apiBaseURL = 'https://ibm-knowledge-api.vercel.app/api';
  console.log('🌐 GitHub Pages detected - using working backend URL');
} else {
  // Normal environment-based configuration
  apiBaseURL = API_CONFIG[environment]?.baseURL || API_CONFIG.development.baseURL;
}

// Export the appropriate configuration
export const API_BASE_URL = apiBaseURL;

// For debugging
console.log(`🌐 API Base URL: ${API_BASE_URL} (Environment: ${environment}, GitHub Pages: ${isGitHubPages})`);

export default API_CONFIG; 