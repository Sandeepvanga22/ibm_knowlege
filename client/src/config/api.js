// API Configuration for different environments
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5000/api',
  },
  production: {
    baseURL: 'https://ibm-knowledge-backend.vercel.app/api',
  },
  test: {
    baseURL: 'http://localhost:5000/api',
  }
};

// Detect if we're on Vercel, Netlify, or GitHub Pages
const isVercel = window.location.hostname.includes('vercel.app');
const isNetlify = window.location.hostname.includes('netlify.app');
const isGitHubPages = window.location.hostname === 'sandeepvanga22.github.io';

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Special handling for different hosting platforms
let apiBaseURL;
if (isVercel) {
  // For Vercel deployment, use the backend URL
  apiBaseURL = 'https://ibm-knowledge-backend.vercel.app/api';
  console.log('🌐 Vercel detected - using Vercel backend URL');
} else if (isNetlify) {
  // For Netlify deployment, use relative URLs for mock API
  apiBaseURL = '';
  console.log('🌐 Netlify detected - using mock API with relative URLs');
  
  // Enable mock mode for immediate testing
  window.MOCK_MODE = true;
  console.log('🔧 Mock mode enabled for immediate testing');
} else if (isGitHubPages) {
  // For GitHub Pages, use relative URLs for mock API
  apiBaseURL = '';
  console.log('🌐 GitHub Pages detected - using mock API with relative URLs');
  
  // Enable mock mode for immediate testing
  window.MOCK_MODE = true;
  console.log('🔧 Mock mode enabled for immediate testing');
} else {
  // Normal environment-based configuration
  apiBaseURL = API_CONFIG[environment]?.baseURL || API_CONFIG.development.baseURL;
}

// Export the appropriate configuration
export const API_BASE_URL = apiBaseURL;

// For debugging
console.log(`🌐 API Base URL: ${API_BASE_URL} (Environment: ${environment}, Vercel: ${isVercel}, Netlify: ${isNetlify}, GitHub Pages: ${isGitHubPages})`);

// Mock API will be initialized in App.js

export default API_CONFIG; 