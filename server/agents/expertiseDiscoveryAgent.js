const { logger, logHelpers } = require('../utils/logger');
const { agentCache } = require('../utils/redis');
const { query } = require('../utils/database');

class ExpertiseDiscoveryAgent {
  constructor() {
    this.name = 'ExpertiseDiscoveryAgent';
    this.confidenceThreshold = 0.6;
    this.performance = {
      totalDiscoveries: 0,
      confirmedExpertise: 0,
      averageConfidence: 0,
    };
  }

  // Main reasoning method - follows IBM's perceive-reason-act pattern
  async reason(perception, context = {}) {
    try {
      logHelpers.agentAction(this.name, 'reason', 1.0, { questionId: perception.question.id });
      
      const question = perception.question;
      const metadata = perception.metadata;
      
      // Analyze question for expertise indicators
      const expertiseIndicators = this.extractExpertiseIndicators(question, metadata);
      
      // Discover potential expertise from user contributions
      const userExpertise = await this.discoverUserExpertise(question.userId, context);
      
      // Analyze answer patterns for expertise
      const answerExpertise = await this.analyzeAnswerExpertise(question.userId);
      
      // Combine and validate expertise
      const combinedExpertise = this.combineExpertise(expertiseIndicators, userExpertise, answerExpertise);
      
      const result = {
        agentType: this.name,
        expertiseIndicators: expertiseIndicators,
        userExpertise: userExpertise,
        answerExpertise: answerExpertise,
        combinedExpertise: combinedExpertise,
        confidence: this.calculateOverallConfidence(combinedExpertise),
        reasoning: this.generateReasoning(question, combinedExpertise),
        timestamp: new Date().toISOString(),
      };
      
      logHelpers.agentAction(this.name, 'reason_complete', result.confidence, result);
      return result;
      
    } catch (error) {
      logHelpers.error(`${this.name} reasoning failed`, error, { perception });
      throw error;
    }
  }

  // Action method - update expertise mapping
  async act(reasoning, context = {}) {
    try {
      if (!reasoning.combinedExpertise || reasoning.combinedExpertise.length === 0) {
        return { action: 'no_expertise', executed: false };
      }
      
      // Update expertise mapping in database
      const updatedExpertise = [];
      for (const expertise of reasoning.combinedExpertise) {
        if (expertise.confidence >= this.confidenceThreshold) {
          try {
            const result = await query(`
              INSERT INTO expertise_mapping (user_id, skill, proficiency_level, evidence_count)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (user_id, skill) DO UPDATE SET
                proficiency_level = CASE 
                  WHEN expertise_mapping.evidence_count < $4 THEN $3
                  ELSE expertise_mapping.proficiency_level
                END,
                evidence_count = GREATEST(expertise_mapping.evidence_count, $4),
                last_updated = CURRENT_TIMESTAMP
              RETURNING id
            `, [expertise.userId, expertise.skill, expertise.proficiency, expertise.evidenceCount]);
            
            if (result.rows.length > 0) {
              updatedExpertise.push({
                skill: expertise.skill,
                proficiency: expertise.proficiency,
                evidenceCount: expertise.evidenceCount,
                confidence: expertise.confidence,
              });
            }
          } catch (error) {
            logger.error('Failed to update expertise mapping', error);
          }
        }
      }
      
      const action = {
        type: 'expertise_updated',
        updatedExpertise: updatedExpertise,
        totalExpertise: reasoning.combinedExpertise.length,
        highConfidenceExpertise: updatedExpertise.filter(exp => exp.confidence >= 0.8).length,
        timestamp: new Date().toISOString(),
      };
      
      logHelpers.agentAction(this.name, 'act', reasoning.confidence, action);
      return action;
      
    } catch (error) {
      logHelpers.error(`${this.name} action failed`, error, { reasoning });
      throw error;
    }
  }

  // Extract expertise indicators from question
  extractExpertiseIndicators(question, metadata) {
    const indicators = [];
    const content = question.content.toLowerCase();
    const title = question.title.toLowerCase();
    
    // Technology expertise indicators
    const technologyMap = {
      'watson': 'watson_ai',
      'kubernetes': 'kubernetes',
      'docker': 'docker',
      'openshift': 'openshift',
      'microservices': 'microservices',
      'api': 'api_development',
      'security': 'security',
      'database': 'database',
      'postgresql': 'database',
      'redis': 'database',
      'node.js': 'javascript',
      'react': 'javascript',
      'python': 'python',
      'java': 'java',
      'devops': 'devops',
    };
    
    // Check for technology mentions
    for (const [tech, skill] of Object.entries(technologyMap)) {
      if (content.includes(tech) || title.includes(tech)) {
        indicators.push({
          skill: skill,
          source: 'question_content',
          confidence: 0.6,
          evidence: `Mentioned ${tech} in question`,
        });
      }
    }
    
    // Check for code blocks (indicates technical expertise)
    if (metadata.hasCode) {
      indicators.push({
        skill: 'technical_writing',
        source: 'code_blocks',
        confidence: 0.7,
        evidence: 'Question contains code blocks',
      });
    }
    
    // Check for error patterns (indicates troubleshooting expertise)
    if (metadata.hasError) {
      indicators.push({
        skill: 'troubleshooting',
        source: 'error_patterns',
        confidence: 0.8,
        evidence: 'Question discusses errors or issues',
      });
    }
    
    return indicators;
  }

  // Discover user expertise from past contributions
  async discoverUserExpertise(userId, context) {
    try {
      // Get user's past questions and answers
      const result = await query(`
        SELECT 
          q.title, q.content, q.created_at,
          a.content as answer_content, a.is_accepted,
          array_agg(t.name) as tags
        FROM questions q
        LEFT JOIN answers a ON q.user_id = a.user_id
        LEFT JOIN question_tags qt ON q.id = qt.question_id
        LEFT JOIN tags t ON qt.tag_id = t.id
        WHERE q.user_id = $1 OR a.user_id = $1
        GROUP BY q.id, a.id
        ORDER BY q.created_at DESC, a.created_at DESC
        LIMIT 50
      `, [userId]);
      
      const expertise = [];
      
      for (const row of result.rows) {
        const content = (row.content || row.answer_content || '').toLowerCase();
        const title = row.title.toLowerCase();
        
        // Analyze content for expertise patterns
        const patterns = this.analyzeContentPatterns(content, title);
        expertise.push(...patterns);
      }
      
      return expertise;
      
    } catch (error) {
      logger.error('Failed to discover user expertise', error);
      return [];
    }
  }

  // Analyze answer expertise patterns
  async analyzeAnswerExpertise(userId) {
    try {
      // Get user's accepted answers
      const result = await query(`
        SELECT a.content, a.created_at, q.title, q.content as question_content,
               array_agg(t.name) as tags
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        LEFT JOIN question_tags qt ON q.id = qt.question_id
        LEFT JOIN tags t ON qt.tag_id = t.id
        WHERE a.user_id = $1 AND a.is_accepted = true
        GROUP BY a.id, q.id
        ORDER BY a.created_at DESC
        LIMIT 20
      `, [userId]);
      
      const expertise = [];
      
      for (const row of result.rows) {
        const answerContent = row.content.toLowerCase();
        const questionContent = row.question_content.toLowerCase();
        
        // Analyze accepted answers for expertise
        const answerPatterns = this.analyzeAnswerPatterns(answerContent, questionContent);
        expertise.push(...answerPatterns);
      }
      
      return expertise;
      
    } catch (error) {
      logger.error('Failed to analyze answer expertise', error);
      return [];
    }
  }

  // Analyze content patterns for expertise
  analyzeContentPatterns(content, title) {
    const patterns = [];
    
    // Technical depth indicators
    if (content.includes('architecture') || content.includes('design pattern')) {
      patterns.push({
        skill: 'system_design',
        source: 'content_analysis',
        confidence: 0.7,
        evidence: 'Discusses architecture or design patterns',
      });
    }
    
    if (content.includes('performance') || content.includes('optimization')) {
      patterns.push({
        skill: 'performance_optimization',
        source: 'content_analysis',
        confidence: 0.6,
        evidence: 'Discusses performance or optimization',
      });
    }
    
    if (content.includes('security') || content.includes('authentication')) {
      patterns.push({
        skill: 'security',
        source: 'content_analysis',
        confidence: 0.8,
        evidence: 'Discusses security topics',
      });
    }
    
    if (content.includes('testing') || content.includes('unit test')) {
      patterns.push({
        skill: 'testing',
        source: 'content_analysis',
        confidence: 0.7,
        evidence: 'Discusses testing practices',
      });
    }
    
    return patterns;
  }

  // Analyze answer patterns for expertise
  analyzeAnswerPatterns(answerContent, questionContent) {
    const patterns = [];
    
    // Comprehensive answer indicators
    if (answerContent.length > 500) {
      patterns.push({
        skill: 'technical_writing',
        source: 'answer_analysis',
        confidence: 0.6,
        evidence: 'Provides comprehensive answers',
      });
    }
    
    // Code examples in answers
    if (answerContent.includes('```') || answerContent.includes('<code>')) {
      patterns.push({
        skill: 'code_examples',
        source: 'answer_analysis',
        confidence: 0.7,
        evidence: 'Provides code examples in answers',
      });
    }
    
    // Step-by-step explanations
    if (answerContent.includes('step') || answerContent.includes('first') || answerContent.includes('then')) {
      patterns.push({
        skill: 'instructional_design',
        source: 'answer_analysis',
        confidence: 0.6,
        evidence: 'Provides step-by-step explanations',
      });
    }
    
    return patterns;
  }

  // Combine expertise from different sources
  combineExpertise(indicators, userExpertise, answerExpertise) {
    const combined = {};
    
    // Combine all expertise sources
    const allExpertise = [...indicators, ...userExpertise, ...answerExpertise];
    
    for (const expertise of allExpertise) {
      const skill = expertise.skill;
      
      if (!combined[skill]) {
        combined[skill] = {
          skill: skill,
          userId: expertise.userId,
          sources: [],
          totalConfidence: 0,
          evidenceCount: 0,
          proficiency: 'beginner',
        };
      }
      
      combined[skill].sources.push(expertise.source);
      combined[skill].totalConfidence += expertise.confidence;
      combined[skill].evidenceCount += 1;
    }
    
    // Calculate final confidence and proficiency
    const result = [];
    for (const [skill, data] of Object.entries(combined)) {
      const avgConfidence = data.totalConfidence / data.evidenceCount;
      
      // Determine proficiency level
      let proficiency = 'beginner';
      if (avgConfidence >= 0.8 && data.evidenceCount >= 3) {
        proficiency = 'expert';
      } else if (avgConfidence >= 0.6 && data.evidenceCount >= 2) {
        proficiency = 'intermediate';
      }
      
      result.push({
        skill: skill,
        userId: data.userId,
        confidence: avgConfidence,
        evidenceCount: data.evidenceCount,
        proficiency: proficiency,
        sources: data.sources,
      });
    }
    
    return result.sort((a, b) => b.confidence - a.confidence);
  }

  // Calculate overall confidence for expertise discovery
  calculateOverallConfidence(combinedExpertise) {
    if (combinedExpertise.length === 0) return 0;
    
    // Weight by confidence and evidence count
    let totalWeight = 0;
    let weightedConfidence = 0;
    
    for (const expertise of combinedExpertise) {
      const weight = expertise.confidence * expertise.evidenceCount;
      weightedConfidence += weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedConfidence / totalWeight : 0;
  }

  // Generate human-readable reasoning
  generateReasoning(question, combinedExpertise) {
    const reasoning = [];
    
    reasoning.push(`Analyzed expertise for question: "${question.title}"`);
    reasoning.push(`Discovered ${combinedExpertise.length} expertise areas`);
    
    if (combinedExpertise.length > 0) {
      const topExpertise = combinedExpertise[0];
      reasoning.push(`Strongest expertise: ${topExpertise.skill} (${topExpertise.proficiency} level, ${(topExpertise.confidence * 100).toFixed(1)}% confidence)`);
      reasoning.push(`Evidence sources: ${topExpertise.sources.join(', ')}`);
    }
    
    return reasoning.join('. ');
  }

  // Learning from feedback
  async learn(feedback) {
    try {
      const { userId, skill, confirmed, userFeedback } = feedback;
      
      // Update performance metrics
      this.performance.totalDiscoveries++;
      if (confirmed) {
        this.performance.confirmedExpertise++;
      }
      
      // Update expertise mapping based on feedback
      if (confirmed && userId && skill) {
        await query(`
          UPDATE expertise_mapping
          SET evidence_count = evidence_count + 1,
              last_updated = CURRENT_TIMESTAMP
          WHERE user_id = $1 AND skill = $2
        `, [userId, skill]);
      }
      
      // Update performance tracking
      await agentCache.trackAgentPerformance(this.name, confirmed);
      
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
        totalDiscoveries: this.performance.totalDiscoveries,
        confirmedExpertise: this.performance.confirmedExpertise,
        confirmationRate: this.performance.totalDiscoveries > 0 
          ? this.performance.confirmedExpertise / this.performance.totalDiscoveries 
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

module.exports = ExpertiseDiscoveryAgent; 