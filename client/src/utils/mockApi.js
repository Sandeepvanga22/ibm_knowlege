import axios from 'axios';
import { mockApiResponses } from './mockData';
import { 
  initializeStorage, 
  getFromStorage, 
  addQuestion, 
  getQuestions, 
  getQuestionById,
  STORAGE_KEYS 
} from './mockStorage';

// Generate agent test results
const generateAgentTestResult = (agentId, questionData = null) => {
  // Use provided question data or fallback to test questions
  let questionToAnalyze = questionData;
  
  if (!questionToAnalyze) {
    const testQuestions = {
      smartRouting: [
        {
          title: "How to deploy Watson AI models?",
          content: "I need help deploying Watson AI models to Kubernetes clusters.",
          tags: ["watson", "kubernetes", "ai", "deployment"]
        },
        {
          title: "Docker container optimization",
          content: "What are the best practices for optimizing Docker container performance?",
          tags: ["docker", "performance", "optimization", "containers"]
        },
        {
          title: "Kubernetes security configuration",
          content: "How to configure security policies in Kubernetes clusters?",
          tags: ["kubernetes", "security", "policies", "configuration"]
        }
      ],
      duplicateDetection: [
        {
          title: "How to deploy Watson AI models?",
          content: "I need help deploying Watson AI models to Kubernetes clusters.",
          tags: ["watson", "kubernetes", "ai", "deployment"]
        },
        {
          title: "Watson AI deployment guide",
          content: "Looking for a step-by-step guide to deploy Watson AI models.",
          tags: ["watson", "deployment", "guide", "ai"]
        },
        {
          title: "Deploying AI models on Kubernetes",
          content: "Need assistance with deploying AI models on Kubernetes platform.",
          tags: ["ai", "kubernetes", "deployment", "models"]
        }
      ],
      knowledgeGap: [
        {
          title: "Missing Watson AI Documentation",
          content: "I cannot find proper documentation for training custom Watson AI models.",
          tags: ["watson", "ai", "documentation", "training", "missing"]
        },
        {
          title: "No guides for Docker security",
          content: "There are no comprehensive guides for Docker security best practices.",
          tags: ["docker", "security", "guides", "missing"]
        },
        {
          title: "Kubernetes troubleshooting docs",
          content: "Missing documentation for common Kubernetes troubleshooting scenarios.",
          tags: ["kubernetes", "troubleshooting", "documentation", "missing"]
        }
      ],
      expertiseDiscovery: [
        {
          title: "Docker Security Best Practices",
          content: "I need to implement security best practices for our Docker containers.",
          tags: ["docker", "security", "containers", "vulnerabilities"]
        },
        {
          title: "Kubernetes networking expert needed",
          content: "Need expert help with complex Kubernetes networking configurations.",
          tags: ["kubernetes", "networking", "expert", "configuration"]
        },
        {
          title: "Watson AI model training",
          content: "Looking for someone experienced in training custom Watson AI models.",
          tags: ["watson", "ai", "training", "models", "expert"]
        }
      ]
    };

    const agentQuestions = testQuestions[agentId] || [];
    const randomIndex = Math.floor(Math.random() * agentQuestions.length);
    questionToAnalyze = agentQuestions[randomIndex] || {};
  }

  // Analyze the actual question content for more intelligent responses
  const questionText = (questionToAnalyze.title + ' ' + questionToAnalyze.content).toLowerCase();
  // const tags = questionToAnalyze.tags || []; // Unused variable - commented out
  
  // Smart routing based on content analysis
  let routingTeam = "General Support";
  let expert = "General Expert";
  let confidence = "75%";
  
  if (questionText.includes('ai') || questionText.includes('watson') || questionText.includes('machine learning') || questionText.includes('generative')) {
    routingTeam = "AI & Machine Learning";
    expert = "Dr. Sarah Chen (AI Research Lead)";
    confidence = "92%";
  } else if (questionText.includes('kubernetes') || questionText.includes('docker') || questionText.includes('container')) {
    routingTeam = "Cloud Infrastructure";
    expert = "Mike Rodriguez (Container Specialist)";
    confidence = "88%";
  } else if (questionText.includes('security') || questionText.includes('cyber') || questionText.includes('encryption')) {
    routingTeam = "Security & Compliance";
    expert = "Lisa Thompson (Security Architect)";
    confidence = "90%";
  } else if (questionText.includes('database') || questionText.includes('sql') || questionText.includes('data')) {
    routingTeam = "Data Engineering";
    expert = "David Kim (Database Expert)";
    confidence = "85%";
  } else if (questionText.includes('devops') || questionText.includes('ci/cd') || questionText.includes('pipeline')) {
    routingTeam = "DevOps & Automation";
    expert = "Alex Johnson (DevOps Engineer)";
    confidence = "87%";
  }

  // Duplicate detection analysis
  let duplicateCount = Math.floor(Math.random() * 5);
  let similarityScore = Math.floor(Math.random() * 30) + 60; // 60-90%
  
  if (questionText.includes('common') || questionText.includes('basic') || questionText.includes('how to')) {
    duplicateCount = Math.floor(Math.random() * 8) + 3; // 3-10 duplicates
    similarityScore = Math.floor(Math.random() * 20) + 70; // 70-90%
  }

  // Knowledge gap analysis
  let gapType = "Documentation";
  let priority = "Medium";
  
  if (questionText.includes('new') || questionText.includes('latest') || questionText.includes('recent') || questionText.includes('generative')) {
    gapType = "Emerging Technology";
    priority = "High";
  } else if (questionText.includes('advanced') || questionText.includes('complex') || questionText.includes('optimization')) {
    gapType = "Advanced Topics";
    priority = "Medium";
  }

  const agentResults = {
    smartRouting: {
      analysis: `Analyzing question content and tags for optimal routing...`,
      routing: routingTeam,
      confidence: confidence,
      expert: expert,
      recommendation: `Route to ${routingTeam} team. ${expert} has relevant expertise in this area.`
    },
    duplicateDetection: {
      analysis: `Scanning database for similar questions using semantic analysis...`,
      duplicates: `${duplicateCount} similar questions found in database`,
      similarity: `${similarityScore}% similarity score`,
      recommendation: duplicateCount > 3 ? "High similarity detected. Check existing answers first." : "Low similarity. Safe to proceed with new question."
    },
    knowledgeGap: {
      analysis: `Analyzing question patterns and knowledge base coverage...`,
      gap: `Missing ${gapType.toLowerCase()} for this topic`,
      priority: priority,
      recommendation: `Create ${gapType.toLowerCase()} to address this knowledge gap. Priority: ${priority}.`
    },
    expertiseDiscovery: {
      analysis: `Analyzing user activity patterns and expertise mapping...`,
      expert: expert,
      expertise: "Advanced",
      confidence: confidence,
      recommendation: `Connect with ${expert} who has demonstrated expertise in this domain.`
    }
  };

  return {
    question: questionToAnalyze,
    analysis: agentResults[agentId] || {},
    processingTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
    confidence: Math.floor(Math.random() * 20) + 80 // 80-100%
  };
};

// Mock API interceptor for Netlify deployment
export const setupMockApi = () => {
  // Check if we're in mock mode
  const isMockMode = window.location.hostname.includes('netlify.app') || 
                    window.location.hostname === 'sandeepvanga22.github.io';

  if (!isMockMode) return;

  console.log('🔧 Setting up mock API interceptor');

  // Initialize storage with default data
  initializeStorage();

  // Configure axios base URL for mock mode
  axios.defaults.baseURL = '';

  // Add request interceptor to handle all requests
  axios.interceptors.request.use(
    (config) => {
      // Check if this is a request we want to mock
      if (isMockMode) {
        console.log(`🔧 Intercepting request: ${config.method?.toUpperCase()} ${config.url}`);
        
        // Create a mock response promise
        const mockResponse = new Promise((resolve) => {
          setTimeout(() => {
            let responseData = {};
            
                         if (config.method === 'get') {
               const url = config.url;
               
               // Handle different endpoints
               if (url.startsWith('/questions')) {
                 // Parse URL parameters for search and filtering
                 const urlParams = new URLSearchParams(url.split('?')[1] || '');
                 const search = urlParams.get('search');
                 const tag = urlParams.get('tag');
                 const limit = url.includes('limit=5') ? 5 : undefined;
                 
                 // Get questions with filters
                 const questions = getQuestions({ 
                   search, 
                   tag, 
                   limit 
                 });
                 responseData = { questions };
               } else if (url.startsWith('/questions/')) {
                 // Handle dynamic routes like /questions/:id
                 const questionId = url.split('/').pop();
                 const question = getQuestionById(questionId);
                 if (question) {
                   responseData = { question };
                 } else {
                   responseData = { question: null };
                 }
               } else if (url === '/tags') {
                 // Get tags from storage
                 const tags = getFromStorage(STORAGE_KEYS.TAGS) || [];
                 responseData = { tags };
               } else if (url === '/users') {
                 // Get users from storage
                 const users = getFromStorage(STORAGE_KEYS.USERS) || [];
                 responseData = { users };
               } else if (url === '/analytics/dashboard') {
                 // Get dashboard from storage
                 const dashboard = getFromStorage(STORAGE_KEYS.DASHBOARD) || {};
                 responseData = { dashboard };
               } else if (url === '/analytics/questions') {
                 // Get analytics from storage
                 const analytics = getFromStorage(STORAGE_KEYS.ANALYTICS) || {};
                 responseData = { analytics };
               } else if (url === '/analytics/users') {
                 // Get user analytics from storage
                 const analytics = getFromStorage(STORAGE_KEYS.ANALYTICS) || {};
                 responseData = { analytics: analytics.users };
               } else if (url === '/agents/performance') {
                 // Get agent performance from storage
                 const performance = getFromStorage(STORAGE_KEYS.AGENT_PERFORMANCE) || {};
                 responseData = { performance };
               } else if (url.startsWith('/agents/test/')) {
                 // Handle agent testing endpoints
                 const agentId = url.split('/').pop();
                 
                 // Get the latest posted question for analysis
                 const questions = getFromStorage(STORAGE_KEYS.QUESTIONS) || [];
                 const latestQuestion = questions[0]; // Most recent question
                 
                 const testData = {
                   agentId,
                   status: 'success',
                   timestamp: new Date().toISOString(),
                   result: generateAgentTestResult(agentId, latestQuestion)
                 };
                 responseData = testData;
               } else {
                 // Fallback to mock responses
                 const mockResponse = mockApiResponses[url];
                 responseData = mockResponse || {};
               }
                         } else if (config.method === 'post') {
               const url = config.url;
               const data = config.data;
               
               if (url === '/questions') {
                 // Create new question and add to storage
                 const newQuestion = addQuestion({
                   title: data.title,
                   content: data.content,
                   tags: data.tags || [],
                   first_name: 'Current',
                   last_name: 'User'
                 });
                 responseData = { question: newQuestion };
                 console.log('🔧 New question created and stored:', newQuestion);
               } else if (url.includes('/answers/questions/')) {
                 // Create new answer
                 const newAnswer = {
                   id: Date.now(),
                   content: data.content,
                   first_name: 'Current',
                   last_name: 'User',
                   created_at: new Date().toISOString()
                 };
                 responseData = { answer: newAnswer };
               } else if (url.startsWith('/agents/test/')) {
                 // Handle agent testing with custom question data
                 const agentId = url.split('/').pop();
                 
                 // Use the custom question data from the request body
                 const customQuestionData = data.question || {
                   title: 'Custom Test Question',
                   content: 'This is a test question for agent analysis',
                   tags: ['test']
                 };
                 
                 const testData = {
                   agentId,
                   status: 'success',
                   timestamp: new Date().toISOString(),
                   result: generateAgentTestResult(agentId, customQuestionData)
                 };
                 responseData = testData;
                 console.log('🔧 Agent test with custom question:', customQuestionData);
               } else {
                 responseData = { success: true };
               }
            }
            
            resolve({
              data: responseData,
              status: 200,
              statusText: 'OK',
              headers: {},
              config: config,
              request: {}
            });
          }, config.method === 'post' ? 500 : 300); // Different delays for GET vs POST
        });
        
        // Return the mock response instead of making the actual request
        return Promise.reject({
          isMockResponse: true,
          response: mockResponse
        });
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle mock responses
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Check if this is a mock response
      if (error.isMockResponse) {
        return error.response;
      }
      
      // For real errors, return a mock response if we're in mock mode
      if (isMockMode) {
        console.log(`🔧 Mock fallback for failed request: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
        
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: { error: 'Mock fallback response' },
              status: 200,
              statusText: 'OK',
              headers: {},
              config: error.config,
              request: {}
            });
          }, 200);
        });
      }
      
      return Promise.reject(error);
    }
  );
};

// Initialize mock API when the script loads
if (typeof window !== 'undefined') {
  setupMockApi();
}
