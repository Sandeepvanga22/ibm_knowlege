// Vercel serverless function for login
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

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { ibmId, password } = req.body;

    // Mock authentication - accept any IBM ID with any password
    const mockUsers = {
      'EMP001': { id: 1, ibmId: 'EMP001', name: 'John Doe', email: 'john.doe@ibm.com', role: 'employee' },
      'EMP002': { id: 2, ibmId: 'EMP002', name: 'Jane Smith', email: 'jane.smith@ibm.com', role: 'employee' },
      'EMP003': { id: 3, ibmId: 'EMP003', name: 'Bob Johnson', email: 'bob.johnson@ibm.com', role: 'employee' }
    };

    if (mockUsers[ibmId]) {
      const user = mockUsers[ibmId];
      const token = `mock-jwt-token-${ibmId}-${Date.now()}`;

      return res.status(200).json({
        success: true,
        token,
        user
      });
    } else {
      // Create a new user for any IBM ID
      const newUser = {
        id: Date.now(),
        ibmId,
        name: `${ibmId} User`,
        email: `${ibmId.toLowerCase()}@ibm.com`,
        role: 'employee'
      };
      const token = `mock-jwt-token-${ibmId}-${Date.now()}`;

      return res.status(200).json({
        success: true,
        token,
        user: newUser
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
