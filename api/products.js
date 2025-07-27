export default function handler(req, res) {
  console.log('Products API called:', req.method, req.url);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For now, return a simple test response to see if the API is working
    res.status(200).json({
      message: 'Products API is working',
      timestamp: new Date().toISOString(),
      test: true
    });
  } catch (error) {
    console.error('Error in products API:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
} 