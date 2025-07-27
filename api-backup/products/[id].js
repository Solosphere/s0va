import products from '../../server/data/products.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const productId = parseInt(req.query.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Add relative image URLs
    const productWithUrls = {
      ...product,
      image: product.image.map(img => {
        if (img.includes('.mp4')) {
          return `/api/media/video/${img}`;
        } else {
          return `/api/media/image/${img}`;
        }
      })
    };
    
    res.status(200).json(productWithUrls);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
} 