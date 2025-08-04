const express = require('express');
const { query } = require('../utils/database');
const { logger, logHelpers } = require('../utils/logger');

const router = express.Router();

// @route   GET /api/agents/performance
// @desc    Get agent performance metrics
// @access  Private
router.get('/performance', async (req, res) => {
  try {
    const result = await query(`
      SELECT agent_type, 
             COUNT(*) as total_suggestions,
             AVG(confidence_score) as avg_confidence,
             COUNT(CASE WHEN accepted = true THEN 1 END) as accepted_suggestions,
             COUNT(CASE WHEN accepted = false THEN 1 END) as rejected_suggestions
      FROM agent_suggestions
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY agent_type
      ORDER BY total_suggestions DESC
    `);
    
    res.json({
      performance: result.rows,
      total_agents: result.rows.length,
      message: "Agent performance data retrieved successfully"
    });
  } catch (error) {
    logger.error('Failed to get agent performance:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve agent performance',
    });
  }
});

// @route   GET /api/agents/suggestions
// @desc    Get recent agent suggestions
// @access  Private
router.get('/suggestions', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const result = await query(`
      SELECT s.id, s.agent_type, s.reasoning as suggestion_data, 
             s.confidence_score, s.accepted, s.created_at,
             u.first_name, u.last_name
      FROM agent_suggestions s
      LEFT JOIN users u ON s.suggested_user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT $1
    `, [limit]);
    
    res.json({
      suggestions: result.rows,
      total: result.rows.length,
      message: "Agent suggestions retrieved successfully"
    });
  } catch (error) {
    logger.error('Failed to get agent suggestions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve agent suggestions',
    });
  }
});

// @route   POST /api/agents/feedback
// @desc    Provide feedback on agent suggestions
// @access  Private
router.post('/feedback', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { suggestion_id, accepted, feedback_notes } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token',
      });
    }
    
    if (!suggestion_id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Suggestion ID is required',
      });
    }
    
    // Update suggestion with feedback
    const result = await query(`
      UPDATE agent_suggestions
      SET user_accepted = $1, 
          feedback_notes = $2,
          feedback_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, agent_name, suggestion_type, user_accepted
    `, [accepted, feedback_notes, suggestion_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Suggestion not found',
        message: 'Suggestion with the specified ID does not exist',
      });
    }
    
    logHelpers.agentAction(result.rows[0].agent_name, 'feedback_received', {
      suggestionId: suggestion_id,
      accepted,
      feedbackNotes: feedback_notes
    });
    
    res.json({
      message: 'Feedback submitted successfully',
      suggestion: result.rows[0],
    });
  } catch (error) {
    logger.error('Failed to submit agent feedback:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to submit feedback',
    });
  }
});

// @route   GET /api/agents/knowledge-gaps
// @desc    Get identified knowledge gaps
// @access  Private
router.get('/knowledge-gaps', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, topic, description, impact_level, frequency_count, 
             created_at, updated_at
      FROM knowledge_gaps
      ORDER BY impact_level DESC, frequency_count DESC
      LIMIT 50
    `);
    
    res.json({
      knowledge_gaps: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    logger.error('Failed to get knowledge gaps:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve knowledge gaps',
    });
  }
});

// @route   GET /api/agents/expertise-mapping
// @desc    Get expertise mapping data
// @access  Private
router.get('/expertise-mapping', async (req, res) => {
  try {
    const { skill } = req.query;
    
    let queryText = `
      SELECT em.id, em.skill, em.proficiency_level, em.evidence_count,
             em.last_updated, u.first_name, u.last_name, u.department
      FROM expertise_mapping em
      LEFT JOIN users u ON em.user_id = u.id
    `;
    
    const params = [];
    
    if (skill) {
      queryText += ` WHERE em.skill = $1`;
      params.push(skill);
    }
    
    queryText += ` ORDER BY em.proficiency_level DESC, em.evidence_count DESC`;
    
    const result = await query(queryText, params);
    
    res.json({
      expertise_mapping: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    logger.error('Failed to get expertise mapping:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve expertise mapping',
    });
  }
});

module.exports = router; 