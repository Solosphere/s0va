import products from '../server/data/products.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return the actual products array
    res.status(200).json(products);
  } catch (error) {
    console.error('Error in products API:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
} 