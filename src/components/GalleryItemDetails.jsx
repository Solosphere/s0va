import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useProducts } from '../context/ProductsProvider';
import SaveButton from './SaveButton';
import Reveal from './Reveal';
import Loading from './Loading';
import { getLastPath } from '../utils/navTracker';

// Where the back button should return to, based on the route the user came from
const PAGE_LABELS = { '/': 'home', '/gallery': 'gallery', '/saved': 'saved', '/about': 'about', '/engineering': 'engineering' };

// Convert a media filename to its full API URL
const getFullImageUrl = (filename) => {
  if (filename.includes('.mp4')) {
    return `/api/media/video/${filename}`;
  }
  return `/api/media/image/${filename}`;
};

const GalleryItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get('page');
  const { products, getProductById, getProductsByCollection, loading, error } = useProducts();

  // Hooks must run on every render — declare them before any early return.
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Capture, at mount, the route the user came from so "back" returns there.
  const originRef = useRef(getLastPath());

  // Reset image position and scroll to top whenever we open a different piece
  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentImageIndex(0);
    setIsModalOpen(false);
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const product = getProductById(parseInt(id, 10));

  if (!product) {
    return <p>Product not found.</p>;
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.image.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.image.length) % product.image.length);
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Navigate between pieces, preserving the gallery page we came from
  const goToProduct = (pid) => {
    navigate(`/gallery/${pid}${page ? `?page=${page}` : ''}`);
  };

  // Dynamic back target: return to wherever the user entered from. Coming from
  // a related piece (another detail) or anywhere unknown falls back to the cache.
  const origin = originRef.current;
  const galleryUrl = `/gallery${page ? `?page=${page}` : ''}`;
  const originLabel = PAGE_LABELS[origin];
  const backTo = origin === '/gallery' ? galleryUrl : originLabel ? origin : galleryUrl;
  const backWhere = originLabel || 'gallery';
  const backLabel = `Back to ${backWhere}`;

  const currentImageUrl = product.image[currentImageIndex];
  const isVideo = currentImageUrl.includes('.mp4');
  const fullImageUrl = getFullImageUrl(currentImageUrl);

  // Previous / next piece across the full collection of works
  const orderedProducts = Array.isArray(products) ? products : [];
  const currentIndex = orderedProducts.findIndex((p) => p.id === product.id);
  const hasSiblings = currentIndex !== -1 && orderedProducts.length > 1;
  const prevProduct = hasSiblings
    ? orderedProducts[(currentIndex - 1 + orderedProducts.length) % orderedProducts.length]
    : null;
  const nextProduct = hasSiblings
    ? orderedProducts[(currentIndex + 1) % orderedProducts.length]
    : null;

  // Other works in the same series/collection
  const relatedWorks = product.collection
    ? getProductsByCollection(product.collection).filter((p) => p.id !== product.id).slice(0, 4)
    : [];

  return (
    <div className="gallery-details">
      <div className="gallery-nav">
        <button
          className="dynamic-back-button back-button"
          onClick={() => navigate(backTo)}
          title={backLabel}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>
            Back<span className="back-button-suffix">{` to ${backWhere}`}</span>
          </span>
        </button>
      </div>
      <div className="details-container">
        <div className="details-section">
          <div className="details-title">
            <div className="details-header">
              <h3>{product.name}</h3>
              <SaveButton artwork={product} />
            </div>
            {product.collection && (
              <p className="gallery-item-collection">{product.collection} series</p>
            )}
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

      {relatedWorks.length > 0 && (
        <Reveal as="section" className="related-works">
            <h4 className="related-heading">More from the {product.collection} series</h4>
            <div className="related-grid">
              {relatedWorks.map((work) => {
                // Prefer a still image for the thumbnail; fall back to a video
                // element only when the piece has no image (video-only).
                const thumb = work.image.find((m) => !m.includes('.mp4')) || work.image[0];
                const thumbIsVideo = thumb.includes('.mp4');
                return (
                  <Link
                    key={work.id}
                    to={`/gallery/${work.id}${page ? `?page=${page}` : ''}`}
                    className="related-card"
                  >
                    {thumbIsVideo ? (
                      <video src={getFullImageUrl(thumb)} muted loop autoPlay playsInline />
                    ) : (
                      <img src={getFullImageUrl(thumb)} loading="lazy" alt={work.name} />
                    )}
                    <span className="related-card-title">{work.name}</span>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        )}

        {hasSiblings && (
          <Reveal as="nav" className="artwork-pager">
            <button className="artwork-pager-btn prev" onClick={() => goToProduct(prevProduct.id)}>
              <FontAwesomeIcon icon={faChevronLeft} />
              <span className="artwork-pager-meta">
                <span className="artwork-pager-label">Previous</span>
                <span className="artwork-pager-name">{prevProduct.name}</span>
              </span>
            </button>
            <button className="artwork-pager-btn next" onClick={() => goToProduct(nextProduct.id)}>
              <span className="artwork-pager-meta">
                <span className="artwork-pager-label">Next</span>
                <span className="artwork-pager-name">{nextProduct.name}</span>
              </span>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </Reveal>
        )}

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
