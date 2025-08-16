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
  const [loading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  // Configure axios defaults
  axios.defaults.baseURL = API_BASE_URL;
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Mock API responses for GitHub Pages
  const mockResponses = {
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

  const login = async (ibmId, password) => {
    try {
      // Check if we're in mock mode (GitHub Pages)
      if (window.location.hostname === 'sandeepvanga22.github.io') {
        console.log('🔧 Using mock login for GitHub Pages');
        
        // Create mock response based on IBM ID
        const mockUser = {
          id: Date.now(),
          ibmId,
          name: `${ibmId} User`,
          email: `${ibmId.toLowerCase()}@ibm.com`,
          role: 'employee'
        };
        
        const mockToken = `mock-jwt-token-${ibmId}-${Date.now()}`;
        
        setToken(mockToken);
        setUser(mockUser);
        localStorage.setItem('token', mockToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
        
        return { success: true };
      }
      
      // Normal API call
      const response = await axios.post('/auth/login', { ibmId, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
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
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Check if we're in mock mode (GitHub Pages)
        if (window.location.hostname === 'sandeepvanga22.github.io') {
          console.log('🔧 Using mock auth check for GitHub Pages');
          
          // Extract IBM ID from mock token
          const ibmIdMatch = token.match(/mock-jwt-token-([^-]+)/);
          const ibmId = ibmIdMatch ? ibmIdMatch[1] : 'EMP001';
          
          const mockUser = {
            id: 1,
            ibmId,
            name: `${ibmId} User`,
            email: `${ibmId.toLowerCase()}@ibm.com`,
            role: 'employee'
          };
          
          setUser(mockUser);
          setIsAuthenticated(true);
          return;
        }
        
        // Normal API call
        const response = await axios.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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