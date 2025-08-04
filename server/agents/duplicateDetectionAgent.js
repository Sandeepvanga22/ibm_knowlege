const { logger, logHelpers } = require('../utils/logger');
const { agentCache } = require('../utils/redis');
const { query } = require('../utils/database');

class DuplicateDetectionAgent {
  constructor() {
    this.name = 'DuplicateDetectionAgent';
    this.confidenceThreshold = 0.6;
    this.maxSimilarQuestions = 5;
    this.similarityThreshold = 0.7;
    this.performance = {
      totalDetections: 0,
      acceptedDetections: 0,
      averageConfidence: 0,
    };
  }

  // Main reasoning method - follows IBM's perceive-reason-act pattern
  async reason(perception, context = {}) {
    try {
      logHelpers.agentAction(this.name, 'reason', 1.0, { questionId: perception.question.id });
      
      const question = perception.question;
      const metadata = perception.metadata;
      
      // Check cache first
      const cached = await agentCache.getCachedSimilarQuestions(question.id);
      if (cached) {
        logHelpers.agentAction(this.name, 'reason_cached', cached.confidence, cached);
        return cached;
      }
      
      // Extract question features for similarity analysis
      const questionFeatures = this.extractQuestionFeatures(question, metadata);
      
      // Find similar questions
      const similarQuestions = await this.findSimilarQuestions(questionFeatures, context);
      
      // Calculate similarity scores
      const similarityResults = await this.calculateSimilarity(question, similarQuestions);
      
      // Filter by similarity threshold
      const relevantSimilarities = similarityResults.filter(result => 
        result.similarity >= this.similarityThreshold
      );
      
      const result = {
        agentType: this.name,
        similarQuestions: relevantSimilarities,
        confidence: this.calculateOverallConfidence(relevantSimilarities),
        reasoning: this.generateReasoning(question, relevantSimilarities),
        timestamp: new Date().toISOString(),
      };
      
      // Cache the result
      await agentCache.cacheSimilarQuestions(question.id, result);
      
      logHelpers.agentAction(this.name, 'reason_complete', result.confidence, result);
      return result;
      
    } catch (error) {
      logHelpers.error(`${this.name} reasoning failed`, error, { perception });
      throw error;
    }
  }

  // Action method - provide duplicate suggestions
  async act(reasoning, context = {}) {
    try {
      if (!reasoning.similarQuestions || reasoning.similarQuestions.length === 0) {
        return { action: 'no_duplicates', executed: false };
      }
      
      const action = {
        type: 'duplicate_suggestions',
        similarQuestions: reasoning.similarQuestions,
        warning: `Found ${reasoning.similarQuestions.length} similar questions. Consider checking these before posting.`,
        timestamp: new Date().toISOString(),
      };
      
      logHelpers.agentAction(this.name, 'act', reasoning.confidence, action);
      return action;
      
    } catch (error) {
      logHelpers.error(`${this.name} action failed`, error, { reasoning });
      throw error;
    }
  }

  // Extract features from question for similarity analysis
  extractQuestionFeatures(question, metadata) {
    const features = {
      title: question.title.toLowerCase(),
      content: question.content.toLowerCase(),
      tags: question.tags || [],
      technologyKeywords: metadata.technologyKeywords || [],
      hasCode: metadata.hasCode,
      hasError: metadata.hasError,
      wordCount: metadata.wordCount,
      complexity: this.calculateComplexity(metadata),
    };
    
    // Extract key phrases from title and content
    features.keyPhrases = this.extractKeyPhrases(question.title + ' ' + question.content);
    
    return features;
  }

  // Extract key phrases from text
  extractKeyPhrases(text) {
    const phrases = [];
    const words = text.toLowerCase().split(/\s+/);
    
    // Extract 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(words.slice(i, i + 2).join(' '));
    }
    for (let i = 0; i < words.length - 2; i++) {
      phrases.push(words.slice(i, i + 3).join(' '));
    }
    
    // Filter out common words and short phrases
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return phrases.filter(phrase => 
      phrase.length > 3 && 
      !commonWords.includes(phrase) &&
      phrase.split(' ').length >= 2
    );
  }

  // Calculate question complexity
  calculateComplexity(metadata) {
    if (metadata.hasCode && metadata.wordCount > 200) return 'high';
    if (metadata.wordCount > 150) return 'medium';
    return 'low';
  }

  // Find similar questions in database
  async findSimilarQuestions(questionFeatures, context) {
    try {
      // Build search query based on features
      const searchTerms = [
        ...questionFeatures.technologyKeywords,
        ...questionFeatures.keyPhrases.slice(0, 5), // Top 5 key phrases
      ];
      
      const searchQuery = `
        SELECT q.id, q.title, q.content, q.created_at, q.vote_count, q.view_count,
               u.first_name, u.last_name,
               array_agg(t.name) as tags
        FROM questions q
        LEFT JOIN users u ON q.user_id = u.id
        LEFT JOIN question_tags qt ON q.id = qt.question_id
        LEFT JOIN tags t ON qt.tag_id = t.id
        WHERE q.id != $1
        AND (
          ${searchTerms.map((term, index) => 
            `(q.title ILIKE $${index + 2} OR q.content ILIKE $${index + 2})`
          ).join(' OR ')}
        )
        GROUP BY q.id, u.first_name, u.last_name
        ORDER BY q.created_at DESC
        LIMIT 50
      `;
      
      const params = [questionFeatures.questionId || 0, ...searchTerms.map(term => `%${term}%`)];
      const result = await query(searchQuery, params);
      
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        createdAt: row.created_at,
        voteCount: row.vote_count,
        viewCount: row.view_count,
        author: `${row.first_name} ${row.last_name}`,
        tags: row.tags.filter(tag => tag !== null),
      }));
      
    } catch (error) {
      logger.error('Failed to find similar questions', error);
      return [];
    }
  }

  // Calculate similarity between current question and similar questions
  async calculateSimilarity(currentQuestion, similarQuestions) {
    const similarities = [];
    
    for (const similarQuestion of similarQuestions) {
      let similarity = 0;
      let reasoning = [];
      
      // Title similarity
      const titleSimilarity = this.calculateTextSimilarity(
        currentQuestion.title.toLowerCase(),
        similarQuestion.title.toLowerCase()
      );
      similarity += titleSimilarity * 0.4;
      reasoning.push(`Title similarity: ${(titleSimilarity * 100).toFixed(1)}%`);
      
      // Content similarity
      const contentSimilarity = this.calculateTextSimilarity(
        currentQuestion.content.toLowerCase(),
        similarQuestion.content.toLowerCase()
      );
      similarity += contentSimilarity * 0.3;
      reasoning.push(`Content similarity: ${(contentSimilarity * 100).toFixed(1)}%`);
      
      // Tag similarity
      const tagSimilarity = this.calculateTagSimilarity(
        currentQuestion.tags || [],
        similarQuestion.tags || []
      );
      similarity += tagSimilarity * 0.2;
      reasoning.push(`Tag similarity: ${(tagSimilarity * 100).toFixed(1)}%`);
      
      // Technology keyword similarity
      const keywordSimilarity = this.calculateKeywordSimilarity(
        currentQuestion.technologyKeywords || [],
        this.extractTechnologyKeywords(similarQuestion.title + ' ' + similarQuestion.content)
      );
      similarity += keywordSimilarity * 0.1;
      reasoning.push(`Technology similarity: ${(keywordSimilarity * 100).toFixed(1)}%`);
      
      similarities.push({
        questionId: similarQuestion.id,
        title: similarQuestion.title,
        content: similarQuestion.content.substring(0, 200) + '...',
        author: similarQuestion.author,
        createdAt: similarQuestion.createdAt,
        voteCount: similarQuestion.voteCount,
        viewCount: similarQuestion.viewCount,
        tags: similarQuestion.tags,
        similarity: similarity,
        reasoning: reasoning.join('; '),
      });
    }
    
    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  // Calculate text similarity using Jaccard similarity
  calculateTextSimilarity(text1, text2) {
    const words1 = new Set(text1.split(/\s+/).filter(word => word.length > 2));
    const words2 = new Set(text2.split(/\s+/).filter(word => word.length > 2));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // Calculate tag similarity
  calculateTagSimilarity(tags1, tags2) {
    if (tags1.length === 0 && tags2.length === 0) return 0;
    if (tags1.length === 0 || tags2.length === 0) return 0;
    
    const set1 = new Set(tags1.map(tag => tag.toLowerCase()));
    const set2 = new Set(tags2.map(tag => tag.toLowerCase()));
    
    const intersection = new Set([...set1].filter(tag => set2.has(tag)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // Calculate keyword similarity
  calculateKeywordSimilarity(keywords1, keywords2) {
    if (keywords1.length === 0 && keywords2.length === 0) return 0;
    if (keywords1.length === 0 || keywords2.length === 0) return 0;
    
    const set1 = new Set(keywords1.map(keyword => keyword.toLowerCase()));
    const set2 = new Set(keywords2.map(keyword => keyword.toLowerCase()));
    
    const intersection = new Set([...set1].filter(keyword => set2.has(keyword)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // Extract technology keywords from text
  extractTechnologyKeywords(text) {
    const technologyKeywords = [
      'watson', 'cloud', 'kubernetes', 'docker', 'openshift', 'red hat',
      'ibm cloud', 'cloud pak', 'api', 'microservices', 'devops',
      'security', 'database', 'postgresql', 'redis', 'node.js', 'react',
      'javascript', 'python', 'java', 'go', 'rust', 'ai', 'ml',
    ];
    
    return technologyKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Calculate overall confidence for duplicate detection
  calculateOverallConfidence(similarities) {
    if (similarities.length === 0) return 0;
    
    const maxSimilarity = Math.max(...similarities.map(s => s.similarity));
    const avgSimilarity = similarities.reduce((sum, s) => sum + s.similarity, 0) / similarities.length;
    
    // Weight max similarity more heavily
    return (maxSimilarity * 0.7) + (avgSimilarity * 0.3);
  }

  // Generate human-readable reasoning
  generateReasoning(question, similarities) {
    const reasoning = [];
    
    reasoning.push(`Analyzed question: "${question.title}"`);
    reasoning.push(`Found ${similarities.length} similar questions`);
    
    if (similarities.length > 0) {
      const topSimilarity = similarities[0];
      reasoning.push(`Most similar: "${topSimilarity.title}" (${(topSimilarity.similarity * 100).toFixed(1)}% match)`);
      reasoning.push(`Reasoning: ${topSimilarity.reasoning}`);
    }
    
    return reasoning.join('. ');
  }

  // Learning from feedback
  async learn(feedback) {
    try {
      const { questionId, accepted, similarQuestionId, userFeedback } = feedback;
      
      // Update performance metrics
      this.performance.totalDetections++;
      if (accepted) {
        this.performance.acceptedDetections++;
      }
      
      // Store feedback for learning
      await query(`
        INSERT INTO agent_suggestions (agent_type, question_id, suggested_user_id, confidence_score, accepted)
        VALUES ($1, $2, $3, $4, $5)
      `, [this.name, questionId, similarQuestionId, feedback.similarity || 0, accepted]);
      
      // Update performance tracking
      await agentCache.trackAgentPerformance(this.name, accepted);
      
      logger.info(`${this.name} learned from feedback`, { feedback });
      
    } catch (error) {
      logger.error(`${this.name} learning failed`, error);
    }
  }

  // Get performance metrics
  async getPerformance() {
    try {
      const performance = await agentCache.getAgentPerformance(this.name);
      
      return {
        agentType: this.name,
        totalDetections: this.performance.totalDetections,
        acceptedDetections: this.performance.acceptedDetections,
        acceptanceRate: this.performance.totalDetections > 0 
          ? this.performance.acceptedDetections / this.performance.totalDetections 
          : 0,
        averageConfidence: this.performance.averageConfidence,
        cachedPerformance: performance,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`${this.name} performance retrieval failed`, error);
      return null;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const performance = await this.getPerformance();
      
      return {
        status: 'healthy',
        agentType: this.name,
        performance: performance,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        agentType: this.name,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Shutdown
  async shutdown() {
    logger.info(`${this.name} shutting down`);
    // Clean up any resources if needed
  }
}

module.exports = DuplicateDetectionAgent; 