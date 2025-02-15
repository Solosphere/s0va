import React, { useState, useEffect } from 'react';
import GalleryList from '../components/GalleryList'; // Import your ProductList component
import products from '../productsData'; // Adjust the path accordingly

const Gallery = () => {

  return (
    <div className="gallery">
      <GalleryList 
      products={products}
      />
    </div>
  );
};

export default Gallery;