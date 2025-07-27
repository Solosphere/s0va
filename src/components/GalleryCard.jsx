import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Get protected video URL
const getProtectedVideoUrl = (filename) => {
  return `${API_BASE_URL}/media/video/${filename}`;
};

const GalleryCard = ({ product, currentPage, showViolentContent }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get('page');
  
  // Add safety checks for product data
  if (!product || !product.image || !Array.isArray(product.image) || product.image.length === 0) {
    return (
      <div className="gallery-card">
        <div className="error-card">
          <p>Product data unavailable</p>
        </div>
      </div>
    );
  }
  
  const hasVideo = product.image.some((item) => item.includes('.mp4'));
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
 
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === product.image.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change the duration here for the image transition
    return () => clearInterval(interval);
  }, [product.image.length]);

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const currentImageUrl = product.image[currentImageIndex];
  const isVideo = currentImageUrl.includes('.mp4');

  return (
    <div className="gallery-card">
      <Link to={`${product.id}?page=${currentPage}`} className="link-no-underline">
        {showViolentContent || !product.hasViolence ? (
          <>
            {isVideo ? (
              <video
                className="gallery-video"
                autoPlay
                width="auto"
                loop
                muted={!isHovered}
                onMouseOver={handleHover}
                onMouseLeave={handleMouseLeave}
                playsInline
                controls={false}
                src={currentImageUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img 
                src={currentImageUrl} 
                loading="lazy" 
                alt={product.name} 
                className="gallery-image"
              />
            )}
          </>
        ) : (
          <div className="restricted-content-container">
            <div>
              <video className="warning-image" autoPlay muted width="200px" loop playsInline controls={false}>
                <source src={getProtectedVideoUrl('toxic.mp4')} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p>Content Warning: This piece may contain sensitive or explicit material. Proceed with caution. To view, click the button with the crossed-out eye.</p>
          </div>
        )}
      </Link>
    </div>
  );
};

export default GalleryCard;
