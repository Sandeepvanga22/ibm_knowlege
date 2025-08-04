const express = require('express');
const { query } = require('../utils/database');
const { logger, logHelpers } = require('../utils/logger');
const auth = require('../middleware/auth');
const { AgentOrchestrator } = require('../agents/orchestrator');

const router = express.Router();

// @route   GET /api/questions
// @desc    Get all questions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, search } = req.query;
    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT q.id, q.title, q.content, q.status, q.view_count, q.vote_count, q.created_at,
             u.first_name, u.last_name,
             array_agg(t.name) as tags
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
    `;
    
    const params = [];
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(`(q.title ILIKE $${params.length + 1} OR q.content ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    
    if (tag) {
      whereConditions.push(`t.name = $${params.length + 1}`);
      params.push(tag);
    }
    
    if (whereConditions.length > 0) {
      queryText += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    queryText += `
      GROUP BY q.id, u.first_name, u.last_name
      ORDER BY q.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(parseInt(limit), offset);
    
    const result = await query(queryText, params);
    
    res.json({
      questions: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: result.rows.length,
    });
  } catch (error) {
    logger.error('Failed to get questions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve questions',
    });
  }
});

// @route   GET /api/questions/recent
// @desc    Get recent questions
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const result = await query(`
      SELECT q.id, q.title, q.content, q.created_at, q.vote_count,
             u.first_name, u.last_name,
             array_agg(t.name) as tags
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      GROUP BY q.id, u.first_name, u.last_name
      ORDER BY q.created_at DESC
      LIMIT 10
    `);
    
    res.json({
      questions: result.rows,
    });
  } catch (error) {
    logger.error('Failed to get recent questions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve recent questions',
    });
  }
});

// @route   GET /api/questions/:id
// @desc    Get question by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Increment view count
    await query(`
      UPDATE questions
      SET view_count = view_count + 1
      WHERE id = $1
    `, [id]);
    
    const result = await query(`
      SELECT q.id, q.title, q.content, q.status, q.view_count, q.vote_count, q.created_at,
             u.id as user_id, u.first_name, u.last_name, u.department, u.team,
             array_agg(t.name) as tags
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE q.id = $1
      GROUP BY q.id, u.id, u.first_name, u.last_name, u.department, u.team
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Question not found',
        message: 'Question with the specified ID does not exist',
      });
    }
    
    res.json({
      question: result.rows[0],
    });
  } catch (error) {
    logger.error('Failed to get question:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve question',
    });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { title, content, tags } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token',
      });
    }
    
    if (!title || !content) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title and content are required',
      });
    }
    
    // Create question
    const questionResult = await query(`
      INSERT INTO questions (title, content, user_id)
      VALUES ($1, $2, $3)
      RETURNING id, title, content, created_at
    `, [title, content, userId]);
    
    const questionId = questionResult.rows[0].id;
    
    // Add tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Get or create tag
        const tagResult = await query(`
          INSERT INTO tags (name, category)
          VALUES ($1, 'technology')
          ON CONFLICT (name) DO NOTHING
          RETURNING id
        `, [tagName]);
        
        if (tagResult.rows.length > 0) {
          const tagId = tagResult.rows[0].id;
          
          // Link tag to question
          await query(`
            INSERT INTO question_tags (question_id, tag_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [questionId, tagId]);
        }
      }
    }
    
    logHelpers.userAction(userId, 'question_created', { questionId, title });
    
    // Trigger AI agents
    try {
      const agentOrchestrator = new AgentOrchestrator();
      const questionData = {
        id: questionId,
        title,
        content,
        tags,
        userId,
        createdAt: questionResult.rows[0].created_at
      };
      
      const agentResults = await agentOrchestrator.orchestrate(questionData);
      logger.info('Agent orchestration completed', { questionId, agentResults });
      
      // Store agent suggestions in database
      for (const [agentType, result] of Object.entries(agentResults)) {
        if (result && result.confidence >= 0.7) {
          await query(`
            INSERT INTO agent_suggestions (agent_type, question_id, suggested_user_id, confidence_score, reasoning, accepted)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            agentType,
            questionId,
            result.suggestedUserId || userId,
            result.confidence,
            result.reasoning || `Agent ${agentType} suggestion`,
            false
          ]);
        }
      }
    } catch (error) {
      logger.error('Agent orchestration failed', error);
    }
    
    res.status(201).json({
      question: questionResult.rows[0],
      message: 'Question created successfully',
    });
  } catch (error) {
    logger.error('Failed to create question:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create question',
    });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update a question
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { title, content, tags } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token',
      });
    }
    
    // Check if user owns the question
    const ownershipResult = await query(`
      SELECT user_id FROM questions WHERE id = $1
    `, [id]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Question not found',
        message: 'Question with the specified ID does not exist',
      });
    }
    
    if (ownershipResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only edit your own questions',
      });
    }
    
    // Update question
    const result = await query(`
      UPDATE questions
      SET title = COALESCE($1, title),
          content = COALESCE($2, content),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, title, content, updated_at
    `, [title, content, id]);
    
    logHelpers.userAction(userId, 'question_updated', { questionId: id });
    
    res.json({
      question: result.rows[0],
      message: 'Question updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update question:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update question',
    });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token',
      });
    }
    
    // Check if user owns the question
    const ownershipResult = await query(`
      SELECT user_id FROM questions WHERE id = $1
    `, [id]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Question not found',
        message: 'Question with the specified ID does not exist',
      });
    }
    
    if (ownershipResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own questions',
      });
    }
    
    // Delete question (cascade will handle related data)
    await query(`
      DELETE FROM questions WHERE id = $1
    `, [id]);
    
    logHelpers.userAction(userId, 'question_deleted', { questionId: id });
    
    res.json({
      message: 'Question deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete question:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete question',
    });
  }
});

module.exports = router; 