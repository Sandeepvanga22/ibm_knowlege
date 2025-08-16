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

// Detect if we're on Vercel or GitHub Pages
const isVercel = window.location.hostname.includes('vercel.app');
const isGitHubPages = window.location.hostname === 'sandeepvanga22.github.io';

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Special handling for different hosting platforms
let apiBaseURL;
if (isVercel) {
  // For Vercel deployment, use the backend URL
  apiBaseURL = 'https://ibm-knowledge-backend.vercel.app/api';
  console.log('🌐 Vercel detected - using Vercel backend URL');
} else if (isGitHubPages) {
  // For GitHub Pages, use mock authentication
  apiBaseURL = 'https://jsonplaceholder.typicode.com';
  console.log('🌐 GitHub Pages detected - using mock authentication');
  
  // Enable mock mode for immediate testing
  window.MOCK_MODE = true;
  console.log('🔧 Mock mode enabled for immediate testing');
  
  // Mock API responses for immediate testing
  if (!window.mockResponses) {
    window.mockResponses = {
      '/auth/login': {
        success: true,
        token: 'mock-jwt-token-EMP001-12345',
        user: {
          id: 1,
          ibmId: 'EMP001',
          name: 'John Doe',
          email: 'john.doe@ibm.com',
          role: 'employee'
        }
      },
      '/auth/me': {
        id: 1,
        ibmId: 'EMP001',
        name: 'John Doe',
        email: 'john.doe@ibm.com',
        role: 'employee'
      }
    };
  }
} else {
  // Normal environment-based configuration
  apiBaseURL = API_CONFIG[environment]?.baseURL || API_CONFIG.development.baseURL;
}

// Export the appropriate configuration
export const API_BASE_URL = apiBaseURL;

// For debugging
console.log(`🌐 API Base URL: ${API_BASE_URL} (Environment: ${environment}, Vercel: ${isVercel}, GitHub Pages: ${isGitHubPages})`);

export default API_CONFIG; 