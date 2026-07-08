import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useProducts } from '../context/ProductsProvider';
import Reveal from './Reveal';
import Loading from './Loading';
import { getLastPath } from '../utils/navTracker';

// Where the back button should return to, based on the route the user came from
const PAGE_LABELS = { '/': 'home', '/gallery': 'gallery', '/about': 'about', '/engineering': 'engineering' };

// Convert a media filename to its full API URL. The /api/products endpoint
// already returns paths in the /api/media/... form, so accept either form.
const getFullImageUrl = (filename) => {
  if (filename.startsWith('/api/media/')) return filename;
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
  // Direction of the last carousel move — drives the slide-in animation on
  // the hero media so it feels like a real slider, not an image swap.
  const [transitionDir, setTransitionDir] = useState(null);
  // Capture, at mount, the route the user came from so "back" returns there.
  const originRef = useRef(getLastPath());
  // Track the thumbnail list so we can scroll the active thumb into view when
  // the user pages via the hero chevrons.
  const railListRef = useRef(null);

  // Reset image position and scroll to top whenever we open a different piece
  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentImageIndex(0);
    setIsModalOpen(false);
  }, [id]);

  // Keep the active thumbnail visible in the rail as the user navigates.
  // Scroll only the rail itself — scrollIntoView would drag the page too.
  useEffect(() => {
    const list = railListRef.current;
    if (!list) return;
    const active = list.querySelector('.strip-rail-thumb.active');
    if (!active) return;
    const listRect = list.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const isHorizontal = list.scrollWidth > list.clientWidth;
    if (isHorizontal) {
      const target =
        list.scrollLeft + (activeRect.left - listRect.left) - (listRect.width - activeRect.width) / 2;
      list.scrollTo({ left: target, behavior: 'smooth' });
    } else {
      const target =
        list.scrollTop + (activeRect.top - listRect.top) - (listRect.height - activeRect.height) / 2;
      list.scrollTo({ top: target, behavior: 'smooth' });
    }
  }, [currentImageIndex]);

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
    setTransitionDir('next');
    setCurrentImageIndex((prev) => (prev + 1) % product.image.length);
  };

  const handlePrevImage = () => {
    setTransitionDir('prev');
    setCurrentImageIndex((prev) => (prev - 1 + product.image.length) % product.image.length);
  };

  const handleThumbnailClick = (index) => {
    setTransitionDir(index > currentImageIndex ? 'next' : 'prev');
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
      <div className="details-strip">
        <button
          className="dynamic-back-button back-button strip-back-button"
          onClick={() => navigate(backTo)}
          title={backLabel}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>
            Back<span className="back-button-suffix">{` to ${backWhere}`}</span>
          </span>
        </button>
        <aside className="strip-rail-column">
          <div className="strip-rail" aria-label="Angle selector">
            {product.image.length > 1 && (
              <div className="strip-rail-counter">
                <span className="strip-rail-counter-current">{String(currentImageIndex + 1).padStart(2, '0')}</span>
                <span className="strip-rail-counter-sep">/</span>
                <span className="strip-rail-counter-total">{String(product.image.length).padStart(2, '0')}</span>
              </div>
            )}
            <ul className="strip-rail-list" ref={railListRef}>
              {product.image.map((image, index) => {
                const active = index === currentImageIndex;
                const thumbIsVideo = image.includes('.mp4');
                return (
                  <li key={index}>
                    <button
                      type="button"
                      className={`strip-rail-thumb ${active ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(index)}
                      aria-current={active ? 'true' : undefined}
                      aria-label={`View angle ${index + 1}`}
                    >
                      <span className="strip-rail-thumb-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="strip-rail-thumb-media">
                        {thumbIsVideo ? (
                          <video playsInline muted src={getFullImageUrl(image)} />
                        ) : (
                          <img src={getFullImageUrl(image)} loading="lazy" alt="" />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <div className="strip-main">
          <header className="strip-meta">
            <h3 className="strip-meta-title">
              <span className="strip-meta-title-name">{product.name}</span>
              {product.date && (
                <span className="strip-meta-title-year">
                  <span className="strip-meta-title-year-bracket" aria-hidden="true">[</span>
                  {product.date}
                  <span className="strip-meta-title-year-bracket" aria-hidden="true">]</span>
                </span>
              )}
            </h3>
          </header>

          <div className="strip-hero">
            {isVideo ? (
              <video
                key={currentImageIndex}
                className={`strip-hero-media strip-hero-media--${transitionDir || 'none'}`}
                autoPlay
                playsInline
                controls
                src={fullImageUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                key={currentImageIndex}
                className={`strip-hero-media strip-hero-media--${transitionDir || 'none'}`}
                src={fullImageUrl}
                alt={product.name}
                onClick={openModal}
              />
            )}
            {product.image.length > 1 && (
              <div className="strip-hero-nav" aria-hidden="true">
                <button
                  type="button"
                  className="strip-hero-nav-btn prev"
                  onClick={handlePrevImage}
                  aria-label="Previous angle"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  type="button"
                  className="strip-hero-nav-btn next"
                  onClick={handleNextImage}
                  aria-label="Next angle"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </div>

          <div className="strip-meta-rows">
            {product.collection && (
              <span className="strip-meta-tag">{product.collection} series</span>
            )}
            {product.media && <span className="strip-meta-tag">{product.media}</span>}
            {product.dimensions && (
              <span className="strip-meta-tag">{product.dimensions}</span>
            )}
          </div>

          {product.description && (
            <p className="strip-meta-desc">{product.description}</p>
          )}
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
            <button type="button" onClick={closeModal} className="modal-close" aria-label="Close">
              <FontAwesomeIcon icon={faTimes} />
            </button>
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
