const express = require('express');
const { query } = require('../utils/database');
const { logger, logHelpers } = require('../utils/logger');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/questions/:questionId/answers
// @desc    Get answers for a question
// @access  Public
router.get('/questions/:questionId/answers', async (req, res) => {
  try {
    const { questionId } = req.params;
    
    const result = await query(`
      SELECT a.id, a.content, a.is_accepted, a.vote_count, a.created_at,
             u.id as user_id, u.first_name, u.last_name, u.department, u.team
      FROM answers a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.question_id = $1
      ORDER BY a.is_accepted DESC, a.vote_count DESC, a.created_at ASC
    `, [questionId]);
    
    res.json({
      answers: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    logger.error('Failed to get answers:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve answers',
    });
  }
});

// @route   POST /api/questions/:questionId/answers
// @desc    Create an answer
// @access  Private
router.post('/questions/:questionId/answers', auth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user?.id;
    const { content } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token',
      });
    }
    
    if (!content) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Answer content is required',
      });
    }
    
    // Check if question exists
    const questionResult = await query(`
      SELECT id FROM questions WHERE id = $1
    `, [questionId]);
    
    if (questionResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Question not found',
        message: 'Question with the specified ID does not exist',
      });
    }
    
    // Create answer
    const result = await query(`
      INSERT INTO answers (content, question_id, user_id)
      VALUES ($1, $2, $3)
      RETURNING id, content, created_at
    `, [content, questionId, userId]);
    
    logHelpers.userAction(userId, 'answer_created', { questionId, answerId: result.rows[0].id });
    
    res.status(201).json({
      answer: result.rows[0],
      message: 'Answer created successfully',
    });
  } catch (error) {
    logger.error('Failed to create answer:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create answer',
    });
  }
});

// @route   PUT /api/answers/:id
// @desc    Update an answer
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { content } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token',
      });
    }
    
    // Check if user owns the answer
    const ownershipResult = await query(`
      SELECT user_id FROM answers WHERE id = $1
    `, [id]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Answer not found',
        message: 'Answer with the specified ID does not exist',
      });
    }
    
    if (ownershipResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only edit your own answers',
      });
    }
    
    // Update answer
    const result = await query(`
      UPDATE answers
      SET content = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, content, updated_at
    `, [content, id]);
    
    logHelpers.userAction(userId, 'answer_updated', { answerId: id });
    
    res.json({
      answer: result.rows[0],
      message: 'Answer updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update answer:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update answer',
    });
  }
});

// @route   DELETE /api/answers/:id
// @desc    Delete an answer
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
    
    // Check if user owns the answer
    const ownershipResult = await query(`
      SELECT user_id FROM answers WHERE id = $1
    `, [id]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Answer not found',
        message: 'Answer with the specified ID does not exist',
      });
    }
    
    if (ownershipResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own answers',
      });
    }
    
    // Delete answer
    await query(`
      DELETE FROM answers WHERE id = $1
    `, [id]);
    
    logHelpers.userAction(userId, 'answer_deleted', { answerId: id });
    
    res.json({
      message: 'Answer deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete answer:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete answer',
    });
  }
});

// @route   POST /api/answers/:id/accept
// @desc    Accept an answer
// @access  Private
router.post('/:id/accept', async (req, res) => {
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
    const questionResult = await query(`
      SELECT q.user_id, a.id as answer_id
      FROM questions q
      JOIN answers a ON q.id = a.question_id
      WHERE a.id = $1
    `, [id]);
    
    if (questionResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Answer not found',
        message: 'Answer with the specified ID does not exist',
      });
    }
    
    if (questionResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only accept answers for your own questions',
      });
    }
    
    // Accept the answer
    await query(`
      UPDATE answers
      SET is_accepted = true
      WHERE id = $1
    `, [id]);
    
    logHelpers.userAction(userId, 'answer_accepted', { answerId: id });
    
    res.json({
      message: 'Answer accepted successfully',
    });
  } catch (error) {
    logger.error('Failed to accept answer:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to accept answer',
    });
  }
});

module.exports = router; 