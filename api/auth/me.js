// Vercel serverless function for user profile
export default function handler(req, res) {
  // Enable CORS for GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', 'https://sandeepvanga22.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Extract IBM ID from token (mock implementation)
    const ibmIdMatch = token.match(/mock-jwt-token-([^-]+)/);
    const ibmId = ibmIdMatch ? ibmIdMatch[1] : 'EMP001';

    // Mock user data
    const mockUsers = {
      'EMP001': { id: 1, ibmId: 'EMP001', name: 'John Doe', email: 'john.doe@ibm.com', role: 'employee' },
      'EMP002': { id: 2, ibmId: 'EMP002', name: 'Jane Smith', email: 'jane.smith@ibm.com', role: 'employee' },
      'EMP003': { id: 3, ibmId: 'EMP003', name: 'Bob Johnson', email: 'bob.johnson@ibm.com', role: 'employee' }
    };

    const user = mockUsers[ibmId] || {
      id: Date.now(),
      ibmId,
      name: `${ibmId} User`,
      email: `${ibmId.toLowerCase()}@ibm.com`,
      role: 'employee'
    };

    return res.status(200).json(user);
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}
