// Mock storage system using localStorage for persistence
const STORAGE_KEYS = {
  QUESTIONS: 'ibm_knowledge_questions',
  USERS: 'ibm_knowledge_users',
  TAGS: 'ibm_knowledge_tags',
  DASHBOARD: 'ibm_knowledge_dashboard',
  ANALYTICS: 'ibm_knowledge_analytics',
  AGENT_PERFORMANCE: 'ibm_knowledge_agent_performance'
};

// Initialize storage with default data if empty
export const initializeStorage = () => {
  const isMockMode = window.location.hostname.includes('netlify.app') || 
                    window.location.hostname === 'sandeepvanga22.github.io';

  if (!isMockMode) return;

  // Import mock data
  import('./mockData.js').then(({ mockData }) => {
    // Initialize questions if not exists
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(mockData.questions));
    }

    // Initialize users if not exists
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockData.users));
    }

    // Initialize tags if not exists
    if (!localStorage.getItem(STORAGE_KEYS.TAGS)) {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(mockData.tags));
    }

    // Initialize dashboard if not exists
    if (!localStorage.getItem(STORAGE_KEYS.DASHBOARD)) {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD, JSON.stringify(mockData.dashboard));
    }

    // Initialize analytics if not exists
    if (!localStorage.getItem(STORAGE_KEYS.ANALYTICS)) {
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(mockData.analytics));
    }

    // Initialize agent performance if not exists
    if (!localStorage.getItem(STORAGE_KEYS.AGENT_PERFORMANCE)) {
      localStorage.setItem(STORAGE_KEYS.AGENT_PERFORMANCE, JSON.stringify(mockData.agentPerformance));
    }

    console.log('🔧 Mock storage initialized with default data');
  });
};

// Get data from storage
export const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading from storage key ${key}:`, error);
    return null;
  }
};

// Save data to storage
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to storage key ${key}:`, error);
    return false;
  }
};

// Add new question to storage
export const addQuestion = (question) => {
  const questions = getFromStorage(STORAGE_KEYS.QUESTIONS) || [];
  const newQuestion = {
    ...question,
    id: Date.now(),
    created_at: new Date().toISOString(),
    view_count: 0,
    vote_count: 0
  };
  
  // Add to beginning of array (newest first)
  questions.unshift(newQuestion);
  
  // Update storage
  saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
  
  // Update dashboard counts
  updateDashboardCounts();
  
  console.log('🔧 New question added to storage:', newQuestion);
  return newQuestion;
};

// Update dashboard counts
export const updateDashboardCounts = () => {
  const questions = getFromStorage(STORAGE_KEYS.QUESTIONS) || [];
  const users = getFromStorage(STORAGE_KEYS.USERS) || [];
  const dashboard = getFromStorage(STORAGE_KEYS.DASHBOARD) || {};
  
  // Update counts
  dashboard.counts = {
    ...dashboard.counts,
    total_questions: questions.length,
    total_users: users.length,
    total_answers: Math.floor(questions.length * 2.5), // Mock answer count
    total_tags: 15 // Fixed tag count
  };
  
  // Update recent questions
  dashboard.recent_questions = questions.slice(0, 3);
  
  saveToStorage(STORAGE_KEYS.DASHBOARD, dashboard);
};

// Get questions with optional filtering
export const getQuestions = (filters = {}) => {
  let questions = getFromStorage(STORAGE_KEYS.QUESTIONS) || [];
  
  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    questions = questions.filter(q => 
      q.title.toLowerCase().includes(searchTerm) ||
      q.content.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply tag filter
  if (filters.tag) {
    questions = questions.filter(q => 
      q.tags && q.tags.includes(filters.tag)
    );
  }
  
  // Apply limit
  if (filters.limit) {
    questions = questions.slice(0, filters.limit);
  }
  
  return questions;
};

// Get question by ID
export const getQuestionById = (id) => {
  const questions = getFromStorage(STORAGE_KEYS.QUESTIONS) || [];
  return questions.find(q => q.id === parseInt(id));
};

// Export storage keys for use in other modules
export { STORAGE_KEYS };
