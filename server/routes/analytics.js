const express = require('express');
const { query } = require('../utils/database');
const { logger, logHelpers } = require('../utils/logger');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    // Get total counts
    const countsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM questions) as total_questions,
        (SELECT COUNT(*) FROM answers) as total_answers
    `);
    
    // Get recent activity
    const recentQuestionsResult = await query(`
      SELECT q.id, q.title, q.created_at, u.first_name, u.last_name
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      ORDER BY q.created_at DESC
      LIMIT 5
    `);
    
    // Get agent performance data
    const agentPerformanceResult = await query(`
      SELECT agent_type, 
             COUNT(*) as total_suggestions,
             AVG(confidence_score) as avg_confidence,
             COUNT(CASE WHEN accepted = true THEN 1 END) as accepted_count
      FROM agent_suggestions
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY agent_type
    `);
    
    const dashboard = {
      counts: countsResult.rows[0],
      recent_questions: recentQuestionsResult.rows,
      agent_performance: agentPerformanceResult.rows
    };
    
    res.json({ dashboard });
  } catch (error) {
    logger.error('Failed to get dashboard analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve dashboard data',
    });
  }
});

// @route   GET /api/analytics/questions
// @desc    Get question analytics
// @access  Private
router.get('/questions', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    // Questions by day
    const questionsByDayResult = await query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM questions
      WHERE created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);
    
    // Questions by tag
    const questionsByTagResult = await query(`
      SELECT t.name as tag, COUNT(*) as count
      FROM questions q
      JOIN question_tags qt ON q.id = qt.question_id
      JOIN tags t ON qt.tag_id = t.id
      WHERE q.created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY t.name
      ORDER BY count DESC
      LIMIT 10
    `);
    
    // Questions by status
    const questionsByStatusResult = await query(`
      SELECT status, COUNT(*) as count
      FROM questions
      WHERE created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY status
    `);
    
    res.json({
      analytics: {
        total_questions: questionsByDayResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
        questions_by_day: questionsByDayResult.rows,
        questions_by_tag: questionsByTagResult.rows,
        questions_by_status: questionsByStatusResult.rows,
      }
    });
  } catch (error) {
    logger.error('Failed to get question analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve question analytics',
    });
  }
});

// @route   GET /api/analytics/users
// @desc    Get user analytics
// @access  Private
router.get('/users', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    // User activity
    const userActivityResult = await query(`
      SELECT u.first_name, u.last_name, u.department,
             COUNT(DISTINCT q.id) as questions_asked,
             COUNT(DISTINCT a.id) as answers_given,
             u.reputation
      FROM users u
      LEFT JOIN questions q ON u.id = q.user_id AND q.created_at >= NOW() - INTERVAL '${period} days'
      LEFT JOIN answers a ON u.id = a.user_id AND a.created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY u.id, u.first_name, u.last_name, u.department, u.reputation
      ORDER BY (COUNT(DISTINCT q.id) + COUNT(DISTINCT a.id)) DESC
      LIMIT 20
    `);
    
    // Users by department
    const usersByDepartmentResult = await query(`
      SELECT department, COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY department
      ORDER BY count DESC
    `);
    
    // Top contributors
    const topContributorsResult = await query(`
      SELECT u.first_name, u.last_name, u.department,
             COUNT(DISTINCT q.id) + COUNT(DISTINCT a.id) as total_contributions,
             u.reputation
      FROM users u
      LEFT JOIN questions q ON u.id = q.user_id
      LEFT JOIN answers a ON u.id = a.user_id
      GROUP BY u.id, u.first_name, u.last_name, u.department, u.reputation
      ORDER BY total_contributions DESC, u.reputation DESC
      LIMIT 10
    `);
    
    res.json({
      user_activity: userActivityResult.rows,
      users_by_department: usersByDepartmentResult.rows,
      top_contributors: topContributorsResult.rows,
    });
  } catch (error) {
    logger.error('Failed to get user analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve user analytics',
    });
  }
});

// @route   GET /api/analytics/agents
// @desc    Get agent analytics
// @access  Private
router.get('/agents', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    // Agent performance over time
    const agentPerformanceResult = await query(`
      SELECT agent_name, DATE(created_at) as date,
             COUNT(*) as suggestions,
             AVG(confidence_score) as avg_confidence,
             COUNT(CASE WHEN user_accepted = true THEN 1 END) as accepted
      FROM agent_suggestions
      WHERE created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY agent_name, DATE(created_at)
      ORDER BY date, agent_name
    `);
    
    // Agent suggestion types
    const suggestionTypesResult = await query(`
      SELECT agent_name, suggestion_type, COUNT(*) as count
      FROM agent_suggestions
      WHERE created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY agent_name, suggestion_type
      ORDER BY agent_name, count DESC
    `);
    
    // Agent confidence distribution
    const confidenceDistributionResult = await query(`
      SELECT agent_name,
             CASE 
               WHEN confidence_score >= 0.8 THEN 'High'
               WHEN confidence_score >= 0.6 THEN 'Medium'
               ELSE 'Low'
             END as confidence_level,
             COUNT(*) as count
      FROM agent_suggestions
      WHERE created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY agent_name, confidence_level
      ORDER BY agent_name, confidence_level
    `);
    
    res.json({
      agent_performance: agentPerformanceResult.rows,
      suggestion_types: suggestionTypesResult.rows,
      confidence_distribution: confidenceDistributionResult.rows,
    });
  } catch (error) {
    logger.error('Failed to get agent analytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve agent analytics',
    });
  }
});

module.exports = router; 