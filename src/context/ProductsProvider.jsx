import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductsContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use relative path for both development and production (proxy handles dev routing)
  const API_BASE_URL = '/api';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_BASE_URL]);

  const getProductById = (id) => {
    return products.find(product => product.id === id);
  };

  const getProductsByCollection = (collection) => {
    if (!collection) return products;
    return products.filter(product => product.collection === collection);
  };

  const getCollections = () => {
    const collections = [...new Set(products.map(product => product.collection).filter(Boolean))];
    return collections;
  };

  const value = {
    products,
    loading,
    error,
    getProductById,
    getProductsByCollection,
    getCollections,
    refetch: () => {
      setLoading(true);
      fetch(`${API_BASE_URL}/products`)
        .then(response => response.json())
        .then(data => {
          setProducts(data);
          setError(null);
        })
        .catch(err => {
          console.error('Error refetching products:', err);
          setError('Failed to refresh products.');
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};