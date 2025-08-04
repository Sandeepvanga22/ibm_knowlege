const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../utils/database');
const { logger, logHelpers } = require('../utils/logger');
const auth = require('../middleware/auth');

const router = express.Router();

// IBM SSO Configuration
const IBM_SSO_CONFIG = {
  clientId: process.env.IBM_SSO_CLIENT_ID,
  clientSecret: process.env.IBM_SSO_CLIENT_SECRET,
  employeeApiUrl: process.env.IBM_EMPLOYEE_API_URL,
};

// Mock IBM employee data for development
const mockEmployees = [
  {
    ibmId: 'EMP001',
    email: 'john.doe@ibm.com',
    firstName: 'John',
    lastName: 'Doe',
    department: 'Cloud Development',
    team: 'Watson AI',
    expertise: ['watson', 'cloud', 'ai'],
  },
  {
    ibmId: 'EMP002',
    email: 'jane.smith@ibm.com',
    firstName: 'Jane',
    lastName: 'Smith',
    department: 'Infrastructure',
    team: 'Red Hat',
    expertise: ['kubernetes', 'openshift', 'docker'],
  },
  {
    ibmId: 'EMP003',
    email: 'mike.johnson@ibm.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    department: 'Security',
    team: 'Cyber Security',
    expertise: ['security', 'authentication', 'compliance'],
  },
];

// Helper function to get IBM employee data
async function getIBMEmployeeData(ibmId) {
  try {
    // In production, this would call IBM's employee API
    // For now, we'll use mock data
    const employee = mockEmployees.find(emp => emp.ibmId === ibmId);
    
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    return employee;
  } catch (error) {
    logger.error('Failed to get IBM employee data:', error);
    throw error;
  }
}

// Helper function to create or update user
async function createOrUpdateUser(employeeData) {
  try {
    const result = await query(`
      INSERT INTO users (ibm_id, email, first_name, last_name, department, team, expertise)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (ibm_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        department = EXCLUDED.department,
        team = EXCLUDED.team,
        expertise = EXCLUDED.expertise,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      employeeData.ibmId,
      employeeData.email,
      employeeData.firstName,
      employeeData.lastName,
      employeeData.department,
      employeeData.team,
      employeeData.expertise,
    ]);
    
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to create/update user:', error);
    throw error;
  }
}

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      ibmId: user.ibm_id,
      email: user.email,
    },
    process.env.JWT_SECRET
    // No expiration - tokens will never expire
  );
}

// @route   POST /api/auth/login
// @desc    Authenticate user with IBM SSO
// @access  Public
router.post('/login', [
  body('ibmId').notEmpty().withMessage('IBM ID is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array(),
      });
    }

    const { ibmId, password } = req.body;

    // For development, accept any password for mock users
    // In production, this would validate against IBM SSO
    if (process.env.NODE_ENV === 'development') {
      // Check if user exists in mock data
      const employee = mockEmployees.find(emp => emp.ibmId === ibmId);
      if (!employee) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid IBM ID or password',
        });
      }

      // Get or create user in database
      const user = await createOrUpdateUser(employee);
      
      // Generate token
      const token = generateToken(user);
      
      // Log successful login
      logHelpers.userAction(user.id, 'login', { ibmId });
      
      res.json({
        token,
        user: {
          id: user.id,
          ibmId: user.ibm_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          department: user.department,
          team: user.team,
          expertise: user.expertise,
          reputation: user.reputation,
        },
      });
    } else {
      // Production IBM SSO integration would go here
      res.status(501).json({
        error: 'Not implemented',
        message: 'IBM SSO integration not implemented in this demo',
      });
    }
  } catch (error) {
    logger.error('Login failed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // Extract user from JWT token (middleware would set this)
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token',
      });
    }

    // Get user from database
    const result = await query(`
      SELECT id, ibm_id, email, first_name, last_name, department, team, expertise, reputation
      FROM users
      WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found',
      });
    }

    const user = result.rows[0];
    
    res.json({
      user: {
        id: user.id,
        ibmId: user.ibm_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        department: user.department,
        team: user.team,
        expertise: user.expertise,
        reputation: user.reputation,
      },
    });
  } catch (error) {
    logger.error('Failed to get user profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user profile',
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      logHelpers.userAction(userId, 'logout');
    }
    
    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout failed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Logout failed',
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token',
      });
    }

    // Get user from database
    const result = await query(`
      SELECT id, ibm_id, email
      FROM users
      WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found',
      });
    }

    const user = result.rows[0];
    const token = generateToken(user);
    
    res.json({
      token,
    });
  } catch (error) {
    logger.error('Token refresh failed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Token refresh failed',
    });
  }
});

// @route   GET /api/auth/ibm-sso
// @desc    Get IBM SSO configuration
// @access  Public
router.get('/ibm-sso', (req, res) => {
  res.json({
    clientId: IBM_SSO_CONFIG.clientId,
    redirectUri: process.env.IBM_SSO_REDIRECT_URI,
    scope: 'openid profile email',
  });
});

module.exports = router; 