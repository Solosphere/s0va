import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft, faTimes } from '@fortawesome/free-solid-svg-icons'; 
import { useProducts } from '../context/ProductsProvider';
import { ImageService } from '../utils/imageService.js';
import DynamicBackButton from './DynamicBackButton';
import SaveButton from './SaveButton';

const GalleryItemDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get('page');
  const { getProductById, loading, error } = useProducts();

  const navigate = useNavigate();
  
  const product = getProductById(parseInt(id, 10));

  useEffect(() => {
    window.scrollTo(0, 0);
  })

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNextImage = () => {
    const nextIndex = (currentImageIndex + 1) % product.image.length;
    setCurrentImageIndex(nextIndex);
  };

  const handlePrevImage = () => {
    const prevIndex = (currentImageIndex - 1 + product.image.length) % product.image.length;
    setCurrentImageIndex(prevIndex);
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleGoBack = () => {
    // Use the dynamic back navigation instead of hardcoded cache page
    navigate(-1);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const currentImageUrl = product.image[currentImageIndex];
  const isVideo = currentImageUrl.includes('.mp4');
  
  // Convert filename to full API URL
  const getFullImageUrl = (filename) => {
    if (filename.includes('.mp4')) {
      return `/api/media/video/${filename}`;
    } else {
      return `/api/media/image/${filename}`;
    }
  };
  
  const fullImageUrl = getFullImageUrl(currentImageUrl);

  return (
    <div className="gallery-details">
      <div className="gallery-nav">
        <DynamicBackButton className="back-button" />
      </div>
      <div className="details-container">
        <div className="details-section">
          <div className="details-title">
            <div className="details-header">
              <h3>{product.name}</h3>
              <SaveButton artwork={product} />
            </div>
            <p className="gallery-item-date">{product.date}</p>
            <p>Media: {product.media}</p>
            {product.dimensions && (
              <p className="gallery-dimensions">Dimensions: {product.dimensions}</p>
            )}
            {product.description && (
              <div className="gallery-bio">
                <p>Description: {product.description}</p>
              </div>
            )}
          </div>
          <div className='view'>
            <div className="image-section">
              {isVideo ? (
                <video
                  className="gallery-video"
                  autoPlay
                  width="500"
                  playsInline
                  controls
                  src={fullImageUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={fullImageUrl}
                  alt={product.name}
                  onClick={openModal}
                  style={{ cursor: 'pointer' }}
                />
              )}
              {product.image.length > 1 && (
                <div className="thumbnail-row">
                  {product.image.map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${index === currentImageIndex ? 'selected' : ''}`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      {image.includes('.mp4') ? (
                        <video playsInline controls={false}>
                          <source src={getFullImageUrl(image)} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img 
                          src={getFullImageUrl(image)} 
                          loading="lazy" 
                          alt={`${product.name} - Thumbnail ${index}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {product.image.length > 1 && (
              <div className="image-navigation">
                <FontAwesomeIcon icon={faChevronLeft} onClick={handlePrevImage} className="prev" />
                <FontAwesomeIcon icon={faChevronRight} onClick={handleNextImage} className="next"/>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Enlarged Image */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <FontAwesomeIcon icon={faTimes} onClick={closeModal} className="modal-close" />
            {isVideo ? (
              <video
                className="modal-video"
                autoPlay
                playsInline
                controls
                src={fullImageUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={fullImageUrl}
                alt={product.name}
                className="modal-image"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryItemDetails;