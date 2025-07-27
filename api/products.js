import products from '../server/data/products.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return all products with relative image URLs
    const productsWithUrls = products.map(product => ({
      ...product,
      image: product.image.map(img => {
        if (img.includes('.mp4')) {
          return `/api/media/video/${img}`;
        } else {
          return `/api/media/image/${img}`;
        }
      })
    }));
    
    res.status(200).json(productsWithUrls);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
} 