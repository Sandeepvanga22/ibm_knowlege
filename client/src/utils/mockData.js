// Mock data for IBM Knowledge Ecosystem
export const mockData = {
  // Dashboard data
  dashboard: {
    counts: {
      total_users: 1250,
      total_questions: 3420,
      total_answers: 8760,
      total_tags: 156
    },
    recent_questions: [
      {
        id: 1,
        title: "How to deploy Watson AI models to Kubernetes?",
        content: "I need help deploying Watson AI models to our Kubernetes cluster. What are the best practices?",
        first_name: "John",
        last_name: "Doe",
        created_at: "2024-01-15T10:30:00Z",
        tags: ["watson", "kubernetes", "ai", "deployment"]
      },
      {
        id: 2,
        title: "Docker container optimization techniques",
        content: "Looking for ways to optimize our Docker containers for better performance and smaller image sizes.",
        first_name: "Jane",
        last_name: "Smith",
        created_at: "2024-01-14T14:20:00Z",
        tags: ["docker", "optimization", "performance"]
      },
      {
        id: 3,
        title: "Kubernetes security best practices",
        content: "What are the recommended security practices for Kubernetes clusters in production environments?",
        first_name: "Mike",
        last_name: "Johnson",
        created_at: "2024-01-13T09:15:00Z",
        tags: ["kubernetes", "security", "production"]
      }
    ]
  },

  // Questions data
  questions: [
    {
      id: 1,
      title: "How to deploy Watson AI models to Kubernetes?",
      content: "I need help deploying Watson AI models to our Kubernetes cluster. What are the best practices for containerizing AI models and ensuring they scale properly?",
      first_name: "John",
      last_name: "Doe",
      created_at: "2024-01-15T10:30:00Z",
      view_count: 45,
      vote_count: 12,
      tags: ["watson", "kubernetes", "ai", "deployment"]
    },
    {
      id: 2,
      title: "Docker container optimization techniques",
      content: "Looking for ways to optimize our Docker containers for better performance and smaller image sizes. Any tips on multi-stage builds and layer optimization?",
      first_name: "Jane",
      last_name: "Smith",
      created_at: "2024-01-14T14:20:00Z",
      view_count: 38,
      vote_count: 8,
      tags: ["docker", "optimization", "performance"]
    },
    {
      id: 3,
      title: "Kubernetes security best practices",
      content: "What are the recommended security practices for Kubernetes clusters in production environments? Looking for RBAC, network policies, and secrets management guidance.",
      first_name: "Mike",
      last_name: "Johnson",
      created_at: "2024-01-13T09:15:00Z",
      view_count: 52,
      vote_count: 15,
      tags: ["kubernetes", "security", "production"]
    },
    {
      id: 4,
      title: "IBM Cloud Pak for Data integration",
      content: "Need help integrating IBM Cloud Pak for Data with our existing data pipeline. What are the key considerations for data governance and compliance?",
      first_name: "Sarah",
      last_name: "Wilson",
      created_at: "2024-01-12T16:45:00Z",
      view_count: 29,
      vote_count: 6,
      tags: ["cloud-pak", "data", "integration", "governance"]
    },
    {
      id: 5,
      title: "Red Hat OpenShift deployment strategies",
      content: "What are the different deployment strategies available in Red Hat OpenShift? Looking for blue-green, canary, and rolling update examples.",
      first_name: "David",
      last_name: "Brown",
      created_at: "2024-01-11T11:30:00Z",
      view_count: 41,
      vote_count: 10,
      tags: ["openshift", "deployment", "strategies"]
    }
  ],

  // Users data
  users: [
    {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      ibm_id: "EMP001",
      department: "Cloud Development",
      team: "Watson AI",
      email: "john.doe@ibm.com"
    },
    {
      id: 2,
      first_name: "Jane",
      last_name: "Smith",
      ibm_id: "EMP002",
      department: "Infrastructure",
      team: "Red Hat",
      email: "jane.smith@ibm.com"
    },
    {
      id: 3,
      first_name: "Mike",
      last_name: "Johnson",
      ibm_id: "EMP003",
      department: "Security",
      team: "Cyber Security",
      email: "mike.johnson@ibm.com"
    },
    {
      id: 4,
      first_name: "Sarah",
      last_name: "Wilson",
      ibm_id: "EMP004",
      department: "Data Science",
      team: "Analytics",
      email: "sarah.wilson@ibm.com"
    },
    {
      id: 5,
      first_name: "David",
      last_name: "Brown",
      ibm_id: "EMP005",
      department: "Platform Engineering",
      team: "OpenShift",
      email: "david.brown@ibm.com"
    }
  ],

  // Tags data
  tags: [
    { id: 1, name: "watson" },
    { id: 2, name: "kubernetes" },
    { id: 3, name: "docker" },
    { id: 4, name: "ai" },
    { id: 5, name: "security" },
    { id: 6, name: "deployment" },
    { id: 7, name: "optimization" },
    { id: 8, name: "performance" },
    { id: 9, name: "production" },
    { id: 10, name: "cloud-pak" },
    { id: 11, name: "data" },
    { id: 12, name: "integration" },
    { id: 13, name: "governance" },
    { id: 14, name: "openshift" },
    { id: 15, name: "strategies" }
  ],

  // Analytics data
  analytics: {
    questions: {
      total_questions: 3420,
      questions_by_day: [
        { date: "2024-01-15", count: 15 },
        { date: "2024-01-14", count: 12 },
        { date: "2024-01-13", count: 18 },
        { date: "2024-01-12", count: 10 },
        { date: "2024-01-11", count: 14 }
      ]
    },
    users: {
      user_activity: [
        {
          first_name: "John",
          last_name: "Doe",
          department: "Cloud Development",
          questions_asked: 25,
          answers_given: 42
        },
        {
          first_name: "Jane",
          last_name: "Smith",
          department: "Infrastructure",
          questions_asked: 18,
          answers_given: 35
        },
        {
          first_name: "Mike",
          last_name: "Johnson",
          department: "Security",
          questions_asked: 12,
          answers_given: 28
        }
      ]
    }
  },

  // Agent performance data
  agentPerformance: {
    total_agents: 4,
    performance: [
      {
        agent_name: "Smart Routing Agent",
        total_suggestions: 1250,
        avg_confidence: 87.5,
        success_rate: 92.3
      },
      {
        agent_name: "Duplicate Detection Agent",
        total_suggestions: 890,
        avg_confidence: 91.2,
        success_rate: 88.7
      },
      {
        agent_name: "Knowledge Gap Agent",
        total_suggestions: 456,
        avg_confidence: 84.1,
        success_rate: 85.9
      },
      {
        agent_name: "Expertise Discovery Agent",
        total_suggestions: 678,
        avg_confidence: 89.3,
        success_rate: 90.1
      }
    ]
  }
};

// Mock API responses
export const mockApiResponses = {
  '/analytics/dashboard': {
    dashboard: mockData.dashboard
  },
  '/questions': {
    questions: mockData.questions
  },
  '/questions?limit=5': {
    questions: mockData.questions.slice(0, 5)
  },
  '/users': {
    users: mockData.users
  },
  '/tags': {
    tags: mockData.tags
  },
  '/analytics/questions': {
    analytics: mockData.analytics.questions
  },
  '/analytics/users': {
    analytics: mockData.analytics.users
  },
  '/agents/performance': {
    performance: mockData.agentPerformance
  }
};
