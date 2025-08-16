import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configure axios defaults
  axios.defaults.baseURL = API_BASE_URL;
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const login = async (ibmId, password) => {
    try {
      // Check if we're in mock mode (GitHub Pages or Netlify)
      if (window.location.hostname === 'sandeepvanga22.github.io' || window.location.hostname.includes('netlify.app')) {
        console.log('🔧 Using mock login for GitHub Pages/Netlify');
        
        // Validate IBM ID format (EMP followed by 3 digits)
        const ibmIdPattern = /^EMP\d{3}$/;
        if (!ibmIdPattern.test(ibmId)) {
          return { 
            success: false, 
            error: 'Invalid IBM ID format. Please use format: EMP001, EMP002, etc.' 
          };
        }
        
        // Check if it's a valid demo IBM ID
        const validIbmIds = ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005'];
        if (!validIbmIds.includes(ibmId)) {
          return { 
            success: false, 
            error: 'Invalid IBM ID. Please use one of the demo IDs: EMP001, EMP002, EMP003, EMP004, EMP005' 
          };
        }
        
        // Create mock response based on IBM ID
        const mockUser = {
          id: Date.now(),
          ibmId,
          firstName: ibmId === 'EMP001' ? 'John' : ibmId === 'EMP002' ? 'Jane' : ibmId === 'EMP003' ? 'Mike' : ibmId === 'EMP004' ? 'Sarah' : 'David',
          lastName: ibmId === 'EMP001' ? 'Doe' : ibmId === 'EMP002' ? 'Smith' : ibmId === 'EMP003' ? 'Johnson' : ibmId === 'EMP004' ? 'Wilson' : 'Brown',
          name: `${ibmId} User`,
          email: `${ibmId.toLowerCase()}@ibm.com`,
          department: ibmId === 'EMP001' ? 'Cloud Development' : ibmId === 'EMP002' ? 'Infrastructure' : ibmId === 'EMP003' ? 'Security' : ibmId === 'EMP004' ? 'Data Science' : 'Platform Engineering',
          team: ibmId === 'EMP001' ? 'Watson AI' : ibmId === 'EMP002' ? 'Red Hat' : ibmId === 'EMP003' ? 'Cyber Security' : ibmId === 'EMP004' ? 'Analytics' : 'OpenShift',
          role: 'employee'
        };
        
        const mockToken = `mock-jwt-token-${ibmId}-${Date.now()}`;
        
        setToken(mockToken);
        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem('token', mockToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
        
        return { success: true };
      }
      
      // Normal API call
      const response = await axios.post('/auth/login', { ibmId, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Check if we're in mock mode (GitHub Pages or Netlify)
        if (window.location.hostname === 'sandeepvanga22.github.io' || window.location.hostname.includes('netlify.app')) {
          console.log('🔧 Using mock auth check for GitHub Pages/Netlify');
          
          // Extract IBM ID from mock token
          const ibmIdMatch = token.match(/mock-jwt-token-([^-]+)/);
          const ibmId = ibmIdMatch ? ibmIdMatch[1] : 'EMP001';
          
          // Validate IBM ID
          const validIbmIds = ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005'];
          if (!validIbmIds.includes(ibmId)) {
            // Invalid IBM ID, clear token and return
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          
          const mockUser = {
            id: 1,
            ibmId,
            firstName: ibmId === 'EMP001' ? 'John' : ibmId === 'EMP002' ? 'Jane' : ibmId === 'EMP003' ? 'Mike' : ibmId === 'EMP004' ? 'Sarah' : 'David',
            lastName: ibmId === 'EMP001' ? 'Doe' : ibmId === 'EMP002' ? 'Smith' : ibmId === 'EMP003' ? 'Johnson' : ibmId === 'EMP004' ? 'Wilson' : 'Brown',
            name: `${ibmId} User`,
            email: `${ibmId.toLowerCase()}@ibm.com`,
            department: ibmId === 'EMP001' ? 'Cloud Development' : ibmId === 'EMP002' ? 'Infrastructure' : ibmId === 'EMP003' ? 'Security' : ibmId === 'EMP004' ? 'Data Science' : 'Platform Engineering',
            team: ibmId === 'EMP001' ? 'Watson AI' : ibmId === 'EMP002' ? 'Red Hat' : ibmId === 'EMP003' ? 'Cyber Security' : ibmId === 'EMP004' ? 'Analytics' : 'OpenShift',
            role: 'employee'
          };
          
          setUser(mockUser);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
        
        // Normal API call
        const response = await axios.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Update isAuthenticated when user changes
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 