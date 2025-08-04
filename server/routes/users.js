const express = require('express');
const { query } = require('../utils/database');
const { logger, logHelpers } = require('../utils/logger');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, ibm_id, email, first_name, last_name, department, team, expertise, reputation, created_at
      FROM users
      ORDER BY reputation DESC, created_at DESC
    `);
    
    res.json({
      users: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    logger.error('Failed to get users:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve users',
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT id, ibm_id, email, first_name, last_name, department, team, expertise, reputation, created_at
      FROM users
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User with the specified ID does not exist',
      });
    }
    
    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    logger.error('Failed to get user:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve user',
    });
  }
});

// @route   GET /api/users/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/profile/me', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token',
      });
    }
    
    const result = await query(`
      SELECT id, ibm_id, email, first_name, last_name, department, team, expertise, reputation, created_at
      FROM users
      WHERE id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found',
      });
    }
    
    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    logger.error('Failed to get user profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve user profile',
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { department, team, expertise } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token',
      });
    }
    
    const result = await query(`
      UPDATE users
      SET department = COALESCE($1, department),
          team = COALESCE($2, team),
          expertise = COALESCE($3, expertise),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, ibm_id, email, first_name, last_name, department, team, expertise, reputation, updated_at
    `, [department, team, expertise, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found',
      });
    }
    
    logHelpers.userAction(userId, 'profile_update', { department, team, expertise });
    
    res.json({
      user: result.rows[0],
      message: 'Profile updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update user profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update user profile',
    });
  }
});

// @route   GET /api/users/experts
// @desc    Get expert users
// @access  Private
router.get('/experts', async (req, res) => {
  try {
    const { skill, limit = 10 } = req.query;
    
    let queryText = `
      SELECT u.id, u.ibm_id, u.email, u.first_name, u.last_name, u.department, u.team, u.expertise, u.reputation,
             em.skill, em.proficiency_level, em.evidence_count
      FROM users u
      LEFT JOIN expertise_mapping em ON u.id = em.user_id
      WHERE u.reputation > 0
    `;
    
    const params = [];
    
    if (skill) {
      queryText += ` AND (em.skill = $1 OR u.expertise @> $2)`;
      params.push(skill, [skill]);
    }
    
    queryText += `
      ORDER BY u.reputation DESC, em.evidence_count DESC
      LIMIT $${params.length + 1}
    `;
    params.push(parseInt(limit));
    
    const result = await query(queryText, params);
    
    res.json({
      experts: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    logger.error('Failed to get experts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve experts',
    });
  }
});

module.exports = router; 