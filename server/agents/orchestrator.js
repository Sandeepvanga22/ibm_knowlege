const { logger, logHelpers } = require('../utils/logger');
const { agentCache } = require('../utils/redis');
const { query } = require('../utils/database');

// Import individual agents
const SmartRoutingAgent = require('./smartRoutingAgent');
const DuplicateDetectionAgent = require('./duplicateDetectionAgent');
const KnowledgeGapAgent = require('./knowledgeGapAgent');
const ExpertiseDiscoveryAgent = require('./expertiseDiscoveryAgent');

class AgentOrchestrator {
  constructor() {
    this.agents = {
      routing: new SmartRoutingAgent(),
      duplicate: new DuplicateDetectionAgent(),
      knowledgeGap: new KnowledgeGapAgent(),
      expertise: new ExpertiseDiscoveryAgent(),
    };
    
    this.isRunning = false;
    this.confidenceThreshold = parseFloat(process.env.AGENT_CONFIDENCE_THRESHOLD) || 0.7;
    
    logger.info('Agent Orchestrator initialized');
  }

  // Main orchestration method - follows IBM's perceive-reason-act pattern
  async orchestrate(questionData, context = {}) {
    try {
      logHelpers.agentAction('orchestrator', 'start', 1.0, { questionId: questionData.id });
      
      const results = {
        routing: null,
        duplicate: null,
        knowledgeGap: null,
        expertise: null,
        timestamp: new Date().toISOString(),
      };

      // Phase 1: Perception - Analyze the question
      const perception = await this.perceive(questionData, context);
      
      // Phase 2: Reasoning - Coordinate agent decisions
      const reasoning = await this.reason(perception, context);
      
      // Phase 3: Action - Execute coordinated actions
      const actions = await this.act(reasoning, context);

      // Combine results
      Object.assign(results, actions);

      // Log orchestration results
      logHelpers.agentAction('orchestrator', 'complete', this.calculateOverallConfidence(results), results);
      
      return results;
    } catch (error) {
      logHelpers.error('Agent orchestration failed', error, { questionData });
      throw error;
    }
  }

  // Perception Engine - Analyze input data
  async perceive(questionData, context) {
    const perception = {
      question: {
        id: questionData.id,
        title: questionData.title,
        content: questionData.content,
        tags: questionData.tags || [],
        userId: questionData.userId,
      },
      context: {
        userExpertise: context.userExpertise || [],
        teamContext: context.teamContext || '',
        urgency: context.urgency || 'normal',
        timestamp: new Date().toISOString(),
      },
      metadata: {
        wordCount: questionData.content.split(' ').length,
        hasCode: this.detectCode(questionData.content),
        hasError: this.detectError(questionData.content),
        technologyKeywords: this.extractTechnologyKeywords(questionData.content),
      },
    };

    logger.debug('Perception completed', perception);
    return perception;
  }

  // Reasoning Engine - Coordinate agent decisions
  async reason(perception, context) {
    const reasoning = {
      routing: null,
      duplicate: null,
      knowledgeGap: null,
      expertise: null,
    };

    // Parallel agent reasoning
    const [routingResult, duplicateResult, knowledgeGapResult, expertiseResult] = await Promise.allSettled([
      this.agents.routing.reason(perception, context),
      this.agents.duplicate.reason(perception, context),
      this.agents.knowledgeGap.reason(perception, context),
      this.agents.expertise.reason(perception, context),
    ]);

    // Process results
    if (routingResult.status === 'fulfilled') {
      reasoning.routing = routingResult.value;
    }
    if (duplicateResult.status === 'fulfilled') {
      reasoning.duplicate = duplicateResult.value;
    }
    if (knowledgeGapResult.status === 'fulfilled') {
      reasoning.knowledgeGap = knowledgeGapResult.value;
    }
    if (expertiseResult.status === 'fulfilled') {
      reasoning.expertise = expertiseResult.value;
    }

    logger.debug('Reasoning completed', reasoning);
    return reasoning;
  }

  // Action Executor - Execute coordinated actions with human-in-the-loop
  async act(reasoning, context) {
    const actions = {
      routing: null,
      duplicate: null,
      knowledgeGap: null,
      expertise: null,
    };

    // Execute actions based on confidence thresholds
    for (const [agentType, result] of Object.entries(reasoning)) {
      if (result && result.confidence >= this.confidenceThreshold) {
        try {
          const action = await this.agents[agentType].act(result, context);
          actions[agentType] = {
            ...result,
            action: action,
            executed: true,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          logger.error(`Agent ${agentType} action failed`, error);
          actions[agentType] = {
            ...result,
            action: null,
            executed: false,
            error: error.message,
            timestamp: new Date().toISOString(),
          };
        }
      } else if (result) {
        actions[agentType] = {
          ...result,
          action: null,
          executed: false,
          reason: 'Below confidence threshold',
          timestamp: new Date().toISOString(),
        };
      }
    }

    logger.debug('Actions completed', actions);
    return actions;
  }

  // Calculate overall confidence for orchestration
  calculateOverallConfidence(results) {
    const confidences = Object.values(results)
      .filter(result => result && result.confidence)
      .map(result => result.confidence);
    
    if (confidences.length === 0) return 0;
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  // Utility methods for perception
  detectCode(content) {
    const codePatterns = [
      /```[\s\S]*?```/g,
      /`[^`]+`/g,
      /<code>[\s\S]*?<\/code>/g,
      /\b(function|class|const|let|var|if|for|while)\b/g,
    ];
    return codePatterns.some(pattern => pattern.test(content));
  }

  detectError(content) {
    const errorPatterns = [
      /\b(error|exception|fail|crash|bug)\b/gi,
      /Error:/g,
      /Exception:/g,
      /Failed to/g,
    ];
    return errorPatterns.some(pattern => pattern.test(content));
  }

  extractTechnologyKeywords(content) {
    const technologyKeywords = [
      'watson', 'cloud', 'kubernetes', 'docker', 'openshift', 'red hat',
      'ibm cloud', 'cloud pak', 'api', 'microservices', 'devops',
      'security', 'database', 'postgresql', 'redis', 'node.js', 'react',
      'javascript', 'python', 'java', 'go', 'rust', 'ai', 'ml',
    ];
    
    const foundKeywords = technologyKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return foundKeywords;
  }

  // Agent-specific orchestration methods
  async routeQuestion(questionData, context = {}) {
    const result = await this.orchestrate(questionData, context);
    return result.routing;
  }

  async detectDuplicates(questionData, context = {}) {
    const result = await this.orchestrate(questionData, context);
    return result.duplicate;
  }

  async identifyKnowledgeGaps(questionData, context = {}) {
    const result = await this.orchestrate(questionData, context);
    return result.knowledgeGap;
  }

  async discoverExpertise(questionData, context = {}) {
    const result = await this.orchestrate(questionData, context);
    return result.expertise;
  }

  // Performance monitoring
  async getAgentPerformance() {
    const performance = {};
    
    for (const [agentType, agent] of Object.entries(this.agents)) {
      try {
        performance[agentType] = await agent.getPerformance();
      } catch (error) {
        logger.error(`Failed to get performance for ${agentType}`, error);
        performance[agentType] = null;
      }
    }
    
    return performance;
  }

  // Learning and adaptation
  async learnFromFeedback(feedback) {
    for (const [agentType, agent] of Object.entries(this.agents)) {
      if (feedback[agentType]) {
        try {
          await agent.learn(feedback[agentType]);
        } catch (error) {
          logger.error(`Learning failed for ${agentType}`, error);
        }
      }
    }
  }

  // Health check
  async healthCheck() {
    const health = {
      status: 'healthy',
      agents: {},
      timestamp: new Date().toISOString(),
    };

    for (const [agentType, agent] of Object.entries(this.agents)) {
      try {
        health.agents[agentType] = await agent.healthCheck();
      } catch (error) {
        health.agents[agentType] = { status: 'unhealthy', error: error.message };
        health.status = 'degraded';
      }
    }

    return health;
  }

  // Shutdown orchestration
  async shutdown() {
    logger.info('Shutting down Agent Orchestrator');
    this.isRunning = false;
    
    for (const [agentType, agent] of Object.entries(this.agents)) {
      try {
        await agent.shutdown();
        logger.info(`Agent ${agentType} shutdown complete`);
      } catch (error) {
        logger.error(`Agent ${agentType} shutdown failed`, error);
      }
    }
    
    logger.info('Agent Orchestrator shutdown complete');
  }
}

module.exports = {
  AgentOrchestrator,
}; 