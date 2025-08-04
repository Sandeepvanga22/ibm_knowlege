const { logger, logHelpers } = require('../utils/logger');
const { agentCache } = require('../utils/redis');
const { query } = require('../utils/database');

class KnowledgeGapAgent {
  constructor() {
    this.name = 'KnowledgeGapAgent';
    this.confidenceThreshold = 0.6;
    this.performance = {
      totalGaps: 0,
      identifiedGaps: 0,
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
      const cached = await agentCache.getCachedKnowledgeGaps();
      if (cached && cached.questionId === question.id) {
        logHelpers.agentAction(this.name, 'reason_cached', cached.confidence, cached);
        return cached;
      }
      
      // Analyze question for potential knowledge gaps
      const gapAnalysis = this.analyzeKnowledgeGaps(question, metadata);
      
      // Check if this represents a recurring pattern
      const recurringPattern = await this.checkRecurringPattern(gapAnalysis);
      
      // Calculate impact and priority
      const impactAssessment = await this.assessImpact(gapAnalysis, recurringPattern);
      
      const result = {
        agentType: this.name,
        knowledgeGaps: gapAnalysis,
        recurringPattern: recurringPattern,
        impactAssessment: impactAssessment,
        confidence: this.calculateOverallConfidence(gapAnalysis, impactAssessment),
        reasoning: this.generateReasoning(question, gapAnalysis, impactAssessment),
        timestamp: new Date().toISOString(),
      };
      
      // Cache the result
      await agentCache.cacheKnowledgeGaps(result);
      
      logHelpers.agentAction(this.name, 'reason_complete', result.confidence, result);
      return result;
      
    } catch (error) {
      logHelpers.error(`${this.name} reasoning failed`, error, { perception });
      throw error;
    }
  }

  // Action method - create knowledge gap entries
  async act(reasoning, context = {}) {
    try {
      if (!reasoning.knowledgeGaps || reasoning.knowledgeGaps.length === 0) {
        return { action: 'no_gaps', executed: false };
      }
      
      // Create knowledge gap entries in database
      const createdGaps = [];
      for (const gap of reasoning.knowledgeGaps) {
        if (gap.priority === 'high' || gap.frequency > 2) {
          try {
            const result = await query(`
              INSERT INTO knowledge_gaps (title, description, frequency, priority, status)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (title) DO UPDATE SET
                frequency = knowledge_gaps.frequency + 1,
                updated_at = CURRENT_TIMESTAMP
              RETURNING id
            `, [gap.title, gap.description, gap.frequency, gap.priority, 'open']);
            
            if (result.rows.length > 0) {
              createdGaps.push({
                id: result.rows[0].id,
                title: gap.title,
                priority: gap.priority,
                frequency: gap.frequency,
              });
            }
          } catch (error) {
            logger.error('Failed to create knowledge gap', error);
          }
        }
      }
      
      const action = {
        type: 'knowledge_gaps_identified',
        gaps: createdGaps,
        totalGaps: reasoning.knowledgeGaps.length,
        highPriorityGaps: createdGaps.filter(gap => gap.priority === 'high').length,
        timestamp: new Date().toISOString(),
      };
      
      logHelpers.agentAction(this.name, 'act', reasoning.confidence, action);
      return action;
      
    } catch (error) {
      logHelpers.error(`${this.name} action failed`, error, { reasoning });
      throw error;
    }
  }

  // Analyze question for potential knowledge gaps
  analyzeKnowledgeGaps(question, metadata) {
    const gaps = [];
    
    // Check for missing documentation indicators
    const content = question.content.toLowerCase();
    const title = question.title.toLowerCase();
    
    // Common knowledge gap patterns
    const gapPatterns = [
      {
        pattern: /(how to|how do i|where can i find|where is the|is there documentation)/gi,
        type: 'missing_documentation',
        priority: 'medium',
      },
      {
        pattern: /(error|exception|failed|doesn't work|not working)/gi,
        type: 'troubleshooting',
        priority: 'high',
      },
      {
        pattern: /(best practice|recommended|should i|what's the right way)/gi,
        type: 'best_practices',
        priority: 'medium',
      },
      {
        pattern: /(new|recent|latest|updated|version)/gi,
        type: 'version_updates',
        priority: 'medium',
      },
      {
        pattern: /(integration|connect|api|webhook)/gi,
        type: 'integration_guide',
        priority: 'high',
      },
    ];
    
    // Analyze content for gap patterns
    for (const pattern of gapPatterns) {
      if (pattern.pattern.test(content) || pattern.pattern.test(title)) {
        const gap = this.createGapFromPattern(question, pattern, metadata);
        if (gap) {
          gaps.push(gap);
        }
      }
    }
    
    // Check for technology-specific gaps
    const technologyGaps = this.identifyTechnologyGaps(question, metadata);
    gaps.push(...technologyGaps);
    
    return gaps;
  }

  // Create knowledge gap from pattern match
  createGapFromPattern(question, pattern, metadata) {
    const content = question.content.toLowerCase();
    const title = question.title.toLowerCase();
    
    let gapTitle = '';
    let description = '';
    
    switch (pattern.type) {
      case 'missing_documentation':
        gapTitle = `Documentation needed for: ${question.title}`;
        description = `Users are asking how to accomplish tasks related to "${question.title}". This suggests missing or unclear documentation.`;
        break;
      case 'troubleshooting':
        gapTitle = `Troubleshooting guide needed for: ${question.title}`;
        description = `Users are encountering errors or issues with "${question.title}". A troubleshooting guide would help resolve common problems.`;
        break;
      case 'best_practices':
        gapTitle = `Best practices guide needed for: ${question.title}`;
        description = `Users are asking about best practices for "${question.title}". A comprehensive guide would improve adoption and success.`;
        break;
      case 'version_updates':
        gapTitle = `Update guide needed for: ${question.title}`;
        description = `Users need guidance on recent updates or changes related to "${question.title}".`;
        break;
      case 'integration_guide':
        gapTitle = `Integration guide needed for: ${question.title}`;
        description = `Users need help integrating or connecting systems related to "${question.title}".`;
        break;
    }
    
    if (gapTitle && description) {
      return {
        title: gapTitle,
        description: description,
        type: pattern.type,
        priority: pattern.priority,
        frequency: 1,
        technologies: metadata.technologyKeywords || [],
        questionId: question.id,
      };
    }
    
    return null;
  }

  // Identify technology-specific knowledge gaps
  identifyTechnologyGaps(question, metadata) {
    const gaps = [];
    const technologies = metadata.technologyKeywords || [];
    
    const technologyGapMap = {
      'watson': {
        title: 'Watson AI documentation gaps',
        description: 'Users need better documentation for Watson AI services and APIs.',
        priority: 'high',
      },
      'kubernetes': {
        title: 'Kubernetes deployment guides',
        description: 'Users need comprehensive guides for deploying applications on Kubernetes.',
        priority: 'high',
      },
      'docker': {
        title: 'Docker containerization guides',
        description: 'Users need help with Docker containerization and best practices.',
        priority: 'medium',
      },
      'openshift': {
        title: 'Red Hat OpenShift guides',
        description: 'Users need documentation for Red Hat OpenShift platform.',
        priority: 'high',
      },
      'microservices': {
        title: 'Microservices architecture guides',
        description: 'Users need guidance on microservices architecture and patterns.',
        priority: 'high',
      },
      'security': {
        title: 'Security best practices',
        description: 'Users need comprehensive security guidelines and best practices.',
        priority: 'high',
      },
    };
    
    for (const tech of technologies) {
      const gapInfo = technologyGapMap[tech.toLowerCase()];
      if (gapInfo) {
        gaps.push({
          title: gapInfo.title,
          description: gapInfo.description,
          type: 'technology_specific',
          priority: gapInfo.priority,
          frequency: 1,
          technologies: [tech],
          questionId: question.id,
        });
      }
    }
    
    return gaps;
  }

  // Check if this represents a recurring pattern
  async checkRecurringPattern(gaps) {
    const recurringPatterns = [];
    
    for (const gap of gaps) {
      try {
        // Check for similar existing gaps
        const result = await query(`
          SELECT id, title, frequency, priority
          FROM knowledge_gaps
          WHERE title ILIKE $1 OR description ILIKE $2
          ORDER BY frequency DESC
          LIMIT 1
        `, [`%${gap.title.split(':')[1]?.trim()}%`, `%${gap.title.split(':')[1]?.trim()}%`]);
        
        if (result.rows.length > 0) {
          const existingGap = result.rows[0];
          recurringPatterns.push({
            gapId: existingGap.id,
            title: existingGap.title,
            frequency: existingGap.frequency + 1,
            priority: existingGap.priority,
            isRecurring: true,
          });
          
          // Update the gap frequency
          gap.frequency = existingGap.frequency + 1;
        }
      } catch (error) {
        logger.error('Failed to check recurring pattern', error);
      }
    }
    
    return recurringPatterns;
  }

  // Assess impact of knowledge gaps
  async assessImpact(gaps, recurringPatterns) {
    const impact = {
      highPriorityGaps: 0,
      totalGaps: gaps.length,
      recurringGaps: recurringPatterns.length,
      estimatedImpact: 'low',
    };
    
    // Count high priority gaps
    impact.highPriorityGaps = gaps.filter(gap => gap.priority === 'high').length;
    
    // Calculate estimated impact
    if (impact.highPriorityGaps > 3 || impact.recurringGaps > 5) {
      impact.estimatedImpact = 'high';
    } else if (impact.highPriorityGaps > 1 || impact.recurringGaps > 2) {
      impact.estimatedImpact = 'medium';
    }
    
    return impact;
  }

  // Calculate overall confidence for knowledge gap detection
  calculateOverallConfidence(gaps, impactAssessment) {
    if (gaps.length === 0) return 0;
    
    // Base confidence on number and priority of gaps
    let confidence = Math.min(gaps.length * 0.2, 0.6);
    
    // Boost confidence for high priority gaps
    const highPriorityCount = gaps.filter(gap => gap.priority === 'high').length;
    confidence += Math.min(highPriorityCount * 0.1, 0.3);
    
    // Boost confidence for recurring patterns
    if (impactAssessment.recurringGaps > 0) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  // Generate human-readable reasoning
  generateReasoning(question, gaps, impactAssessment) {
    const reasoning = [];
    
    reasoning.push(`Analyzed question: "${question.title}"`);
    reasoning.push(`Identified ${gaps.length} potential knowledge gaps`);
    
    if (gaps.length > 0) {
      const highPriorityGaps = gaps.filter(gap => gap.priority === 'high');
      reasoning.push(`High priority gaps: ${highPriorityGaps.length}`);
      
      if (highPriorityGaps.length > 0) {
        reasoning.push(`Most critical: ${highPriorityGaps[0].title}`);
      }
    }
    
    reasoning.push(`Estimated impact: ${impactAssessment.estimatedImpact}`);
    
    return reasoning.join('. ');
  }

  // Learning from feedback
  async learn(feedback) {
    try {
      const { gapId, accepted, userFeedback } = feedback;
      
      // Update performance metrics
      this.performance.totalGaps++;
      if (accepted) {
        this.performance.identifiedGaps++;
      }
      
      // Update knowledge gap status if accepted
      if (accepted && gapId) {
        await query(`
          UPDATE knowledge_gaps
          SET status = 'addressed', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [gapId]);
      }
      
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
        totalGaps: this.performance.totalGaps,
        identifiedGaps: this.performance.identifiedGaps,
        identificationRate: this.performance.totalGaps > 0 
          ? this.performance.identifiedGaps / this.performance.totalGaps 
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

module.exports = KnowledgeGapAgent; 