# IBM Knowledge Ecosystem

## Agent-Powered Knowledge Platform with Intelligent AI Agents

A comprehensive Q&A platform built for IBM enterprise teams, featuring intelligent routing agents, duplicate detection, and proactive knowledge management. The platform includes enhanced search functionality, custom question testing, and a complete mock API system for demonstration purposes.

## 🚀 Live Demo

- **🌐 Live Application**: https://ibmprojec.netlify.app
- **🧪 Agents Page**: https://ibmprojec.netlify.app/agents
- **📚 GitHub Repository**: https://github.com/Sandeepvanga22/ibm_knowlege

## 🎯 Features

### Core Platform
- **Smart Q&A System**: Post questions, provide answers, and vote on solutions
- **Enhanced Search**: Debounced search with real-time filtering (no loading screens)
- **Technology Tagging**: Watson, Cloud Pak, Red Hat, and IBM-specific categories
- **User Authentication**: IBM ID validation (EMP001-EMP005 for demo)
- **Mobile Responsive**: Works perfectly on all devices

### Intelligent AI Agents
- **🎯 Smart Routing Agent**: Routes questions to appropriate teams based on content
- **🔍 Duplicate Detection Agent**: Identifies similar questions using semantic analysis
- **📚 Knowledge Gap Agent**: Identifies missing documentation areas
- **👥 Expertise Discovery Agent**: Finds relevant experts for any topic
- **🧪 Custom Testing**: Test agents with any question you want

### Enhanced User Experience
- **Smooth Search**: No loading screens while typing
- **Real-time Filtering**: Instant results as you type
- **Intelligent Analysis**: Content-aware agent responses
- **Professional UI**: Clean, modern interface
- **Mock API System**: Full functionality without backend

## 🏗️ Architecture

### Frontend
- **React 18** with modern hooks
- **React Router** for navigation
- **React Query** for state management
- **Axios** for API communication
- **Mock API System** for demonstration

### Backend (Mock)
- **Mock API Interceptor**: Simulates backend functionality
- **Local Storage**: Persists data across sessions
- **Intelligent Routing**: Content-aware agent analysis
- **Real-time Processing**: Immediate response simulation

### Agent Framework
- **Content Analysis**: Intelligent question parsing
- **Team Routing**: Automatic expert assignment
- **Confidence Scoring**: Realistic confidence levels
- **Expert Matching**: Domain-specific expert recommendations

## 📋 Prerequisites

- **Node.js 16+** (for local development)
- **npm or yarn** package manager
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Git** (for cloning the repository)

## 🛠️ How to Run

### Option 1: Use Live Demo (Recommended)
The application is already deployed and ready to use:

1. **Visit**: https://ibmprojec.netlify.app
2. **Login**: Use any of these IBM IDs:
   - `EMP001` - John Doe (Cloud Development, Watson AI)
   - `EMP002` - Jane Smith (Infrastructure, Red Hat)
   - `EMP003` - Mike Johnson (Security, Cyber Security)
   - `EMP004` - Sarah Wilson (Data Science, Analytics)
   - `EMP005` - David Brown (Platform Engineering, OpenShift)
3. **Explore**: Navigate through all features
4. **Test Agents**: Go to Agents page and test with any question

### Option 2: Local Development

#### Step 1: Clone the Repository
```bash
git clone https://github.com/Sandeepvanga22/ibm_knowlege.git
cd ibm_knowlege
```

#### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
```

#### Step 3: Environment Setup
```bash
# Copy environment example
cp env.example .env

# Edit .env file (optional for local development)
# The app works with default mock settings
```

#### Step 4: Start Development Server
```bash
# From the client directory
npm start
```

The application will open at: http://localhost:3000

#### Step 5: Build for Production
```bash
# Build the application
npm run build

# The build folder will be created in client/build/
```

### Option 3: Deploy to Netlify

#### Automatic Deployment (Recommended)
1. **Fork** the repository on GitHub
2. **Connect** to Netlify
3. **Deploy** automatically from GitHub

#### Manual Deployment
```bash
# Build the application
cd client
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

## 🧪 How to Test

### Testing the Agents
1. **Go to**: https://ibmprojec.netlify.app/agents
2. **Scroll down** to "Test Agents with Any Question"
3. **Enter a question** like:
   - "How to implement generative AI in our cloud platform?"
   - "What are the best practices for Kubernetes security?"
   - "How to set up CI/CD pipelines for microservices?"
4. **Click "Test All Agents"**
5. **Watch** as all four agents analyze your question

### Testing Search Functionality
1. **Go to**: https://ibmprojec.netlify.app/questions
2. **Type** in the search box
3. **Notice**: No loading screens, instant filtering
4. **Try**: Different search terms and tags

### Testing Authentication
1. **Go to**: https://ibmprojec.netlify.app/login
2. **Use**: Any IBM ID (EMP001-EMP005)
3. **Password**: Any password (for demo)
4. **Verify**: Login works and shows user info

## 📁 Project Structure

```
IBM_project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   ├── public/            # Public assets
│   └── package.json       # Frontend dependencies
├── server/                # Node.js backend (for reference)
├── api/                   # API functions
├── netlify.toml          # Netlify configuration
├── package.json          # Root dependencies
└── README.md             # This file
```

## 🎯 Key Features Explained

### Enhanced Search
- **Debounced Input**: 300ms delay prevents excessive API calls
- **Client-side Filtering**: Instant results while typing
- **Smart Loading**: Only shows loading for initial page load
- **Real-time Results**: Updates as you type

### Intelligent Agents
- **Content Analysis**: Analyzes question text for keywords
- **Team Routing**: Routes to appropriate teams (AI, Security, Cloud, etc.)
- **Expert Matching**: Finds relevant domain experts
- **Confidence Scoring**: Provides realistic confidence levels

### Mock API System
- **Full Functionality**: Simulates complete backend
- **Data Persistence**: Uses localStorage for data
- **Real-time Processing**: Simulates API delays
- **Error Handling**: Graceful error management

## 🔧 Configuration

### Environment Variables (Optional)
```env
# For local development (optional)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_MOCK_MODE=true
```

### Netlify Configuration
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🚀 Deployment Options

### 1. Netlify (Current)
- **URL**: https://ibmprojec.netlify.app
- **Auto-deploy**: From GitHub
- **Custom domain**: Available
- **SSL**: Automatic

### 2. Vercel
```bash
npm install -g vercel
vercel
```

### 3. GitHub Pages
```bash
npm run build
# Deploy build folder to GitHub Pages
```

### 4. Docker
```bash
docker build -t ibm-knowledge .
docker run -p 3000:3000 ibm-knowledge
```

## 📊 Performance

- **Bundle Size**: 92.59 kB (gzipped)
- **Load Time**: < 2 seconds
- **Search Response**: < 100ms
- **Agent Analysis**: < 500ms
- **Mobile Performance**: Optimized

## 🧪 Testing

### Manual Testing
- **All features work** without backend
- **Responsive design** on all devices
- **Cross-browser compatibility** verified
- **Accessibility** standards met

### Automated Testing
```bash
# Run tests (if configured)
npm test

# Run build check
npm run build
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📞 Support

- **GitHub Issues**: https://github.com/Sandeepvanga22/ibm_knowlege/issues
- **Live Demo**: https://ibmprojec.netlify.app
- **Documentation**: See project files for detailed guides

## 📄 License

This project is open source and available under the MIT License.

---

## 🎉 Quick Start Summary

1. **Visit**: https://ibmprojec.netlify.app
2. **Login**: Use EMP001-EMP005
3. **Explore**: All features are working
4. **Test Agents**: Go to /agents and try any question
5. **Enjoy**: The enhanced IBM Knowledge Ecosystem!

**Built with ❤️ using React, Node.js, and intelligent AI agents** 