export default function handler(req, res) {
  console.log('Test API called');
  
  try {
    res.status(200).json({
      message: 'Test API is working',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({ error: 'Test API failed' });
  }
} 