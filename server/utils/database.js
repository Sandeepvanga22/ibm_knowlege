const { Pool } = require('pg');
const { logger } = require('./logger');

// Database connection pool
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test database connection
db.on('connect', (client) => {
  logger.info('Connected to PostgreSQL database');
});

db.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Database query helper with error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await db.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query error:', { text, params, error: error.message });
    throw error;
  }
};

// Database initialization
const initializeDatabase = async () => {
  try {
    // Create tables if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        ibm_id VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        department VARCHAR(100),
        team VARCHAR(100),
        expertise TEXT[],
        reputation INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'open',
        view_count INTEGER DEFAULT 0,
        vote_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS question_tags (
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (question_id, tag_id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_accepted BOOLEAN DEFAULT FALSE,
        vote_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        answer_id INTEGER REFERENCES answers(id) ON DELETE CASCADE,
        vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, question_id),
        UNIQUE(user_id, answer_id)
      )
    `);

    // Agent-related tables
    await query(`
      CREATE TABLE IF NOT EXISTS agent_suggestions (
        id SERIAL PRIMARY KEY,
        agent_type VARCHAR(50) NOT NULL,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        suggested_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        confidence_score DECIMAL(3,2) NOT NULL,
        reasoning TEXT,
        accepted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS agent_performance (
        id SERIAL PRIMARY KEY,
        agent_type VARCHAR(50) NOT NULL,
        total_suggestions INTEGER DEFAULT 0,
        accepted_suggestions INTEGER DEFAULT 0,
        average_confidence DECIMAL(3,2) DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS knowledge_gaps (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        frequency INTEGER DEFAULT 1,
        priority VARCHAR(20) DEFAULT 'medium',
        assigned_to INTEGER REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS expertise_mapping (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        skill VARCHAR(100) NOT NULL,
        proficiency_level VARCHAR(20) DEFAULT 'intermediate',
        evidence_count INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, skill)
      )
    `);

    // Insert default tags
    await query(`
      INSERT INTO tags (name, category, description) VALUES
      ('Watson', 'AI', 'IBM Watson AI and machine learning technologies'),
      ('Cloud Pak', 'Cloud', 'IBM Cloud Pak for Data, AI, and Integration'),
      ('Red Hat', 'Infrastructure', 'Red Hat OpenShift and container technologies'),
      ('IBM Cloud', 'Cloud', 'IBM Cloud platform and services'),
      ('Kubernetes', 'Infrastructure', 'Container orchestration and management'),
      ('Docker', 'Infrastructure', 'Containerization technology'),
      ('Microservices', 'Architecture', 'Microservices architecture patterns'),
      ('API', 'Development', 'Application Programming Interfaces'),
      ('Security', 'Security', 'Security and compliance topics'),
      ('DevOps', 'Process', 'Development operations and CI/CD')
      ON CONFLICT (name) DO NOTHING
    `);

    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  db,
  query,
  initializeDatabase,
}; 