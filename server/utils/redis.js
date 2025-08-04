const redis = require('redis');
const { logger } = require('./logger');

// Redis client configuration
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('Redis server refused connection');
      return new Error('Redis server refused connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      logger.error('Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      logger.error('Redis max retry attempts reached');
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  },
});

// Redis connection event handlers
redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('end', () => {
  logger.info('Redis connection ended');
});

// Connect to Redis
redisClient.connect().catch((err) => {
  logger.error('Failed to connect to Redis:', err);
});

// Redis helper functions
const redisHelpers = {
  // Set key with expiration
  async set(key, value, expireSeconds = null) {
    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      if (expireSeconds) {
        await redisClient.setEx(key, expireSeconds, serializedValue);
      } else {
        await redisClient.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  },

  // Get value by key
  async get(key) {
    try {
      const value = await redisClient.get(key);
      if (!value) return null;
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  },

  // Delete key
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  },

  // Set hash field
  async hset(key, field, value) {
    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      await redisClient.hSet(key, field, serializedValue);
      return true;
    } catch (error) {
      logger.error('Redis HSET error:', error);
      return false;
    }
  },

  // Get hash field
  async hget(key, field) {
    try {
      const value = await redisClient.hGet(key, field);
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error('Redis HGET error:', error);
      return null;
    }
  },

  // Get all hash fields
  async hgetall(key) {
    try {
      const hash = await redisClient.hGetAll(key);
      const result = {};
      
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Redis HGETALL error:', error);
      return {};
    }
  },

  // Add to sorted set
  async zadd(key, score, member) {
    try {
      await redisClient.zAdd(key, { score, value: member });
      return true;
    } catch (error) {
      logger.error('Redis ZADD error:', error);
      return false;
    }
  },

  // Get range from sorted set
  async zrange(key, start, stop, withScores = false) {
    try {
      const options = withScores ? { REV: true, WITHSCORES: true } : { REV: true };
      return await redisClient.zRange(key, start, stop, options);
    } catch (error) {
      logger.error('Redis ZRANGE error:', error);
      return [];
    }
  },

  // Increment counter
  async incr(key) {
    try {
      return await redisClient.incr(key);
    } catch (error) {
      logger.error('Redis INCR error:', error);
      return 0;
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  },

  // Set expiration on key
  async expire(key, seconds) {
    try {
      return await redisClient.expire(key, seconds);
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      return false;
    }
  },

  // Get time to live for key
  async ttl(key) {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      logger.error('Redis TTL error:', error);
      return -1;
    }
  },
};

// Agent-specific Redis functions
const agentCache = {
  // Cache agent suggestions
  async cacheSuggestion(questionId, suggestion) {
    const key = `agent:suggestion:${questionId}`;
    return await redisHelpers.set(key, suggestion, 3600); // 1 hour
  },

  // Get cached suggestion
  async getCachedSuggestion(questionId) {
    const key = `agent:suggestion:${questionId}`;
    return await redisHelpers.get(key);
  },

  // Cache user expertise
  async cacheUserExpertise(userId, expertise) {
    const key = `user:expertise:${userId}`;
    return await redisHelpers.set(key, expertise, 86400); // 24 hours
  },

  // Get cached user expertise
  async getCachedUserExpertise(userId) {
    const key = `user:expertise:${userId}`;
    return await redisHelpers.get(key);
  },

  // Cache question similarity
  async cacheSimilarQuestions(questionId, similarQuestions) {
    const key = `question:similar:${questionId}`;
    return await redisHelpers.set(key, similarQuestions, 1800); // 30 minutes
  },

  // Get cached similar questions
  async getCachedSimilarQuestions(questionId) {
    const key = `question:similar:${questionId}`;
    return await redisHelpers.get(key);
  },

  // Track agent performance
  async trackAgentPerformance(agentType, success) {
    const key = `agent:performance:${agentType}`;
    const performance = await redisHelpers.hgetall(key) || {};
    
    performance.total = (performance.total || 0) + 1;
    performance.success = (performance.success || 0) + (success ? 1 : 0);
    performance.successRate = performance.success / performance.total;
    
    return await redisHelpers.hset(key, 'performance', performance);
  },

  // Get agent performance
  async getAgentPerformance(agentType) {
    const key = `agent:performance:${agentType}`;
    return await redisHelpers.hget(key, 'performance');
  },

  // Cache knowledge gaps
  async cacheKnowledgeGaps(gaps) {
    const key = 'knowledge:gaps';
    return await redisHelpers.set(key, gaps, 3600); // 1 hour
  },

  // Get cached knowledge gaps
  async getCachedKnowledgeGaps() {
    const key = 'knowledge:gaps';
    return await redisHelpers.get(key);
  },
};

module.exports = {
  redisClient,
  redisHelpers,
  agentCache,
}; 