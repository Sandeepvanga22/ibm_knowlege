const express = require('express');
const { query } = require('../utils/database');
const { logger, logHelpers } = require('../utils/logger');

const router = express.Router();

// @route   GET /api/tags
// @desc    Get all tags
// @access  Public
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT t.id, t.name, t.category, t.description,
             COUNT(qt.question_id) as question_count
      FROM tags t
      LEFT JOIN question_tags qt ON t.id = qt.tag_id
      GROUP BY t.id, t.name, t.category, t.description
      ORDER BY question_count DESC, t.name
    `);
    
    res.json({
      tags: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    logger.error('Failed to get tags:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve tags',
    });
  }
});

// @route   GET /api/tags/popular
// @desc    Get popular tags
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await query(`
      SELECT t.id, t.name, t.category,
             COUNT(qt.question_id) as question_count
      FROM tags t
      LEFT JOIN question_tags qt ON t.id = qt.tag_id
      GROUP BY t.id, t.name, t.category
      ORDER BY question_count DESC
      LIMIT $1
    `, [parseInt(limit)]);
    
    res.json({
      tags: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    logger.error('Failed to get popular tags:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve popular tags',
    });
  }
});

// @route   GET /api/tags/:id
// @desc    Get tag by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT t.id, t.name, t.category, t.description,
             COUNT(qt.question_id) as question_count
      FROM tags t
      LEFT JOIN question_tags qt ON t.id = qt.tag_id
      WHERE t.id = $1
      GROUP BY t.id, t.name, t.category, t.description
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Tag not found',
        message: 'Tag with the specified ID does not exist',
      });
    }
    
    res.json({
      tag: result.rows[0],
    });
  } catch (error) {
    logger.error('Failed to get tag:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve tag',
    });
  }
});

// @route   GET /api/tags/:id/questions
// @desc    Get questions by tag
// @access  Public
router.get('/:id/questions', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await query(`
      SELECT q.id, q.title, q.content, q.status, q.view_count, q.vote_count, q.created_at,
             u.first_name, u.last_name
      FROM questions q
      JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN users u ON q.user_id = u.id
      WHERE qt.tag_id = $1
      ORDER BY q.created_at DESC
      LIMIT $2 OFFSET $3
    `, [id, parseInt(limit), offset]);
    
    res.json({
      questions: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: result.rows.length,
    });
  } catch (error) {
    logger.error('Failed to get questions by tag:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve questions by tag',
    });
  }
});

// @route   POST /api/tags
// @desc    Create a new tag
// @access  Private
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, category, description } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token',
      });
    }
    
    if (!name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Tag name is required',
      });
    }
    
    // Check if tag already exists
    const existingTag = await query(`
      SELECT id FROM tags WHERE name = $1
    `, [name]);
    
    if (existingTag.rows.length > 0) {
      return res.status(409).json({
        error: 'Tag already exists',
        message: 'A tag with this name already exists',
      });
    }
    
    // Create tag
    const result = await query(`
      INSERT INTO tags (name, category, description)
      VALUES ($1, $2, $3)
      RETURNING id, name, category, description
    `, [name, category || 'technology', description]);
    
    logHelpers.userAction(userId, 'tag_created', { tagId: result.rows[0].id, name });
    
    res.status(201).json({
      tag: result.rows[0],
      message: 'Tag created successfully',
    });
  } catch (error) {
    logger.error('Failed to create tag:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create tag',
    });
  }
});

// @route   PUT /api/tags/:id
// @desc    Update a tag
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { name, category, description } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token',
      });
    }
    
    // Check if tag exists
    const existingTag = await query(`
      SELECT id FROM tags WHERE id = $1
    `, [id]);
    
    if (existingTag.rows.length === 0) {
      return res.status(404).json({
        error: 'Tag not found',
        message: 'Tag with the specified ID does not exist',
      });
    }
    
    // Update tag
    const result = await query(`
      UPDATE tags
      SET name = COALESCE($1, name),
          category = COALESCE($2, category),
          description = COALESCE($3, description),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, category, description
    `, [name, category, description, id]);
    
    logHelpers.userAction(userId, 'tag_updated', { tagId: id, name });
    
    res.json({
      tag: result.rows[0],
      message: 'Tag updated successfully',
    });
  } catch (error) {
    logger.error('Failed to update tag:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update tag',
    });
  }
});

// @route   DELETE /api/tags/:id
// @desc    Delete a tag
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
    
    // Check if tag exists
    const existingTag = await query(`
      SELECT id, name FROM tags WHERE id = $1
    `, [id]);
    
    if (existingTag.rows.length === 0) {
      return res.status(404).json({
        error: 'Tag not found',
        message: 'Tag with the specified ID does not exist',
      });
    }
    
    // Delete tag (cascade will handle question_tags)
    await query(`
      DELETE FROM tags WHERE id = $1
    `, [id]);
    
    logHelpers.userAction(userId, 'tag_deleted', { tagId: id, name: existingTag.rows[0].name });
    
    res.json({
      message: 'Tag deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete tag:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete tag',
    });
  }
});

module.exports = router; 