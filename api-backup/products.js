export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple test response
    res.status(200).json({
      message: 'Products API is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in products API:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
} 