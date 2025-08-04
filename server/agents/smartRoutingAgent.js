const { logger, logHelpers } = require('../utils/logger');
const { agentCache } = require('../utils/redis');
const { query } = require('../utils/database');

class SmartRoutingAgent {
  constructor() {
    this.name = 'SmartRoutingAgent';
    this.confidenceThreshold = 0.7;
    this.maxSuggestions = 3;
    this.performance = {
      totalSuggestions: 0,
      acceptedSuggestions: 0,
      averageConfidence: 0,
    };
  }

  // Main reasoning method - follows IBM's perceive-reason-act pattern
  async reason(perception, context = {}) {
    try {
      logHelpers.agentAction(this.name, 'reason', 1.0, { questionId: perception.question.id });
      
      const question = perception.question;
      const metadata = perception.metadata;
      
      // Extract expertise requirements from question
      const requiredExpertise = this.extractExpertiseRequirements(question, metadata);
      
      // Find potential experts
      const potentialExperts = await this.findPotentialExperts(requiredExpertise, context);
      
      // Calculate confidence scores
      const suggestions = await this.calculateSuggestions(potentialExperts, question, metadata);
      
      // Sort by confidence and limit results
      const topSuggestions = suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, this.maxSuggestions);
      
      const result = {
        agentType: this.name,
        suggestions: topSuggestions,
        confidence: this.calculateOverallConfidence(topSuggestions),
        reasoning: this.generateReasoning(question, topSuggestions, requiredExpertise),
        timestamp: new Date().toISOString(),
      };
      
      // Cache the result
      await agentCache.cacheSuggestion(question.id, result);
      
      logHelpers.agentAction(this.name, 'reason_complete', result.confidence, result);
      return result;
      
    } catch (error) {
      logHelpers.error(`${this.name} reasoning failed`, error, { perception });
      throw error;
    }
  }

  // Action method - execute routing suggestions
  async act(reasoning, context = {}) {
    try {
      if (!reasoning.suggestions || reasoning.suggestions.length === 0) {
        return { action: 'no_suggestions', executed: false };
      }
      
      // In a real implementation, this would send notifications
      // For now, we'll just log the action
      const action = {
        type: 'expert_suggestions',
        suggestions: reasoning.suggestions,
        notifications: reasoning.suggestions.map(suggestion => ({
          userId: suggestion.userId,
          message: `You've been suggested as an expert for: "${reasoning.question?.title}"`,
          confidence: suggestion.confidence,
        })),
        timestamp: new Date().toISOString(),
      };
      
      logHelpers.agentAction(this.name, 'act', reasoning.confidence, action);
      return action;
      
    } catch (error) {
      logHelpers.error(`${this.name} action failed`, error, { reasoning });
      throw error;
    }
  }

  // Extract expertise requirements from question content
  extractExpertiseRequirements(question, metadata) {
    const requirements = {
      technologies: metadata.technologyKeywords || [],
      skills: [],
      urgency: 'normal',
      complexity: 'medium',
    };
    
    // Analyze question content for skill requirements
    const content = question.content.toLowerCase();
    const title = question.title.toLowerCase();
    
    // Technology-specific skills
    if (content.includes('watson') || title.includes('watson')) {
      requirements.skills.push('watson_ai');
    }
    if (content.includes('kubernetes') || content.includes('openshift')) {
      requirements.skills.push('kubernetes');
      requirements.skills.push('container_orchestration');
    }
    if (content.includes('docker')) {
      requirements.skills.push('docker');
      requirements.skills.push('containerization');
    }
    if (content.includes('api') || content.includes('rest')) {
      requirements.skills.push('api_development');
    }
    if (content.includes('security') || content.includes('authentication')) {
      requirements.skills.push('security');
    }
    if (content.includes('database') || content.includes('postgresql')) {
      requirements.skills.push('database');
    }
    if (content.includes('microservices')) {
      requirements.skills.push('microservices');
    }
    if (content.includes('devops') || content.includes('ci/cd')) {
      requirements.skills.push('devops');
    }
    
    // Urgency detection
    if (content.includes('urgent') || content.includes('critical') || content.includes('blocker')) {
      requirements.urgency = 'high';
    }
    
    // Complexity detection
    if (metadata.hasCode && metadata.wordCount > 200) {
      requirements.complexity = 'high';
    } else if (metadata.wordCount < 50) {
      requirements.complexity = 'low';
    }
    
    return requirements;
  }

  // Find potential experts based on expertise requirements
  async findPotentialExperts(requirements, context) {
    try {
      // Get users with relevant expertise
      const expertiseQuery = `
        SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, u.department, u.team,
               u.expertise, u.reputation, em.skill, em.proficiency_level, em.evidence_count
        FROM users u
        LEFT JOIN expertise_mapping em ON u.id = em.user_id
        WHERE u.id IS NOT NULL
        AND (
          ${requirements.skills.map(skill => `em.skill = $${requirements.skills.indexOf(skill) + 1}`).join(' OR ')}
          OR u.expertise && $${requirements.skills.length + 1}
        )
        ORDER BY u.reputation DESC, em.evidence_count DESC
        LIMIT 20
      `;
      
      const params = [...requirements.skills, requirements.skills];
      const result = await query(expertiseQuery, params);
      
      // Group by user and calculate expertise scores
      const userExpertise = {};
      
      result.rows.forEach(row => {
        if (!userExpertise[row.id]) {
          userExpertise[row.id] = {
            userId: row.id,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            department: row.department,
            team: row.team,
            reputation: row.reputation,
            expertise: row.expertise || [],
            skills: {},
            totalEvidence: 0,
          };
        }
        
        if (row.skill) {
          userExpertise[row.id].skills[row.skill] = {
            proficiency: row.proficiency_level,
            evidenceCount: row.evidence_count,
          };
          userExpertise[row.id].totalEvidence += row.evidence_count;
        }
      });
      
      return Object.values(userExpertise);
      
    } catch (error) {
      logger.error('Failed to find potential experts', error);
      return [];
    }
  }

  // Calculate confidence scores for expert suggestions
  async calculateSuggestions(potentialExperts, question, metadata) {
    const suggestions = [];
    
    for (const expert of potentialExperts) {
      let confidence = 0;
      let reasoning = [];
      
      // Base confidence from reputation
      confidence += Math.min(expert.reputation / 100, 0.3);
      reasoning.push(`Reputation: ${expert.reputation}`);
      
      // Skill match confidence
      const skillMatches = this.calculateSkillMatches(expert, metadata.technologyKeywords);
      confidence += skillMatches.score * 0.4;
      reasoning.push(`Skill matches: ${skillMatches.matches.join(', ')}`);
      
      // Evidence confidence
      confidence += Math.min(expert.totalEvidence / 50, 0.2);
      reasoning.push(`Evidence count: ${expert.totalEvidence}`);
      
      // Availability factor (simplified)
      const availabilityScore = await this.checkAvailability(expert.userId);
      confidence += availabilityScore * 0.1;
      reasoning.push(`Availability: ${availabilityScore > 0.5 ? 'High' : 'Medium'}`);
      
      // Cap confidence at 1.0
      confidence = Math.min(confidence, 1.0);
      
      suggestions.push({
        userId: expert.userId,
        firstName: expert.firstName,
        lastName: expert.lastName,
        email: expert.email,
        department: expert.department,
        team: expert.team,
        confidence: confidence,
        reasoning: reasoning.join('; '),
        skillMatches: skillMatches.matches,
        reputation: expert.reputation,
      });
    }
    
    return suggestions;
  }

  // Calculate skill matches between expert and question
  calculateSkillMatches(expert, technologyKeywords) {
    let score = 0;
    const matches = [];
    
    // Check explicit skills
    for (const [skill, details] of Object.entries(expert.skills)) {
      if (technologyKeywords.some(keyword => 
        keyword.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(keyword.toLowerCase())
      )) {
        score += details.evidenceCount * 0.1;
        matches.push(skill);
      }
    }
    
    // Check expertise array
    for (const expertise of expert.expertise) {
      if (technologyKeywords.some(keyword => 
        expertise.toLowerCase().includes(keyword.toLowerCase())
      )) {
        score += 0.2;
        matches.push(expertise);
      }
    }
    
    return { score: Math.min(score, 1.0), matches };
  }

  // Check expert availability (simplified)
  async checkAvailability(userId) {
    try {
      // In a real implementation, this would check calendar, Slack status, etc.
      // For now, return a random availability score
      const cacheKey = `availability:${userId}`;
      const cached = await agentCache.redisHelpers.get(cacheKey);
      
      if (cached !== null) {
        return cached;
      }
      
      // Simulate availability check
      const availability = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
      await agentCache.redisHelpers.set(cacheKey, availability, 300); // 5 minutes
      
      return availability;
    } catch (error) {
      logger.error('Failed to check availability', error);
      return 0.5; // Default to medium availability
    }
  }

  // Calculate overall confidence for suggestions
  calculateOverallConfidence(suggestions) {
    if (suggestions.length === 0) return 0;
    
    const avgConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length;
    const maxConfidence = Math.max(...suggestions.map(s => s.confidence));
    
    // Weight average and max confidence
    return (avgConfidence * 0.7) + (maxConfidence * 0.3);
  }

  // Generate human-readable reasoning
  generateReasoning(question, suggestions, requirements) {
    const reasoning = [];
    
    reasoning.push(`Question requires expertise in: ${requirements.skills.join(', ')}`);
    reasoning.push(`Found ${suggestions.length} potential experts`);
    
    if (suggestions.length > 0) {
      const topSuggestion = suggestions[0];
      reasoning.push(`Top suggestion: ${topSuggestion.firstName} ${topSuggestion.lastName} (${topSuggestion.confidence.toFixed(2)} confidence)`);
      reasoning.push(`Reasoning: ${topSuggestion.reasoning}`);
    }
    
    return reasoning.join('. ');
  }

  // Learning from feedback
  async learn(feedback) {
    try {
      const { questionId, accepted, suggestionId, userFeedback } = feedback;
      
      // Update performance metrics
      this.performance.totalSuggestions++;
      if (accepted) {
        this.performance.acceptedSuggestions++;
      }
      
      // Store feedback for learning
      await query(`
        INSERT INTO agent_suggestions (agent_type, question_id, suggested_user_id, confidence_score, accepted)
        VALUES ($1, $2, $3, $4, $5)
      `, [this.name, questionId, suggestionId, feedback.confidence || 0, accepted]);
      
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
        totalSuggestions: this.performance.totalSuggestions,
        acceptedSuggestions: this.performance.acceptedSuggestions,
        acceptanceRate: this.performance.totalSuggestions > 0 
          ? this.performance.acceptedSuggestions / this.performance.totalSuggestions 
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

module.exports = SmartRoutingAgent; 