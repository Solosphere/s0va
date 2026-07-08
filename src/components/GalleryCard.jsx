import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { useReducedMotionPref } from '../utils/useReducedMotionPref';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Get protected video URL
const getProtectedVideoUrl = (filename) => {
  if (filename.startsWith('/api/media/')) return filename;
  return `${API_BASE_URL}/media/video/${filename}`;
};

// The /api/products endpoint already returns image paths as full API URLs
// (e.g. "/api/media/video/HCT-22.mp4"), so accept either form.
const getFullImageUrl = (filename) => {
  if (filename.startsWith('/api/media/')) return filename;
  return filename.includes('.mp4') ? `/api/media/video/${filename}` : `/api/media/image/${filename}`;
};

const GalleryCard = ({ product, currentPage, showViolentContent }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const reduced = useReducedMotionPref();

  // Swipe-to-cycle: track the touch start so we can tell a horizontal swipe
  // (change image) from a tap (open the piece). didSwipe blocks the Link's
  // click after a swipe so the card doesn't navigate mid-gesture.
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const didSwipe = useRef(false);
  const linkRef = useRef(null);
  const videoRef = useRef(null);

  // When a swipe lands on a video, point the element at it and play. Changing
  // React's src alone doesn't restart a <video>, and forcing a remount with a
  // key breaks autoplay (the cover freezes) — so reload it imperatively.
  useEffect(() => {
    const v = videoRef.current;
    const media = product?.image?.[currentIndex] ?? product?.image?.[0];
    if (!v || !media || !media.includes('.mp4')) return;
    v.load();
    const played = v.play();
    if (played && played.catch) played.catch(() => {});
  }, [product, currentIndex]);

  // Laptop/trackpad horizontal swipes arrive as wheel events (deltaX), not
  // touch. React binds wheel passively, so attach a native non-passive listener
  // to cycle the image and stop the gesture from triggering browser back/fwd.
  const imageCount = product.image?.length ?? 0;
  useEffect(() => {
    const el = linkRef.current;
    if (!el || imageCount <= 1) return;
    let lock = false;
    let resetTimer;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical → scroll
      e.preventDefault();
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { lock = false; }, 150); // one step per gesture
      if (lock || Math.abs(e.deltaX) < 20) return;
      lock = true;
      const dir = e.deltaX > 0 ? 1 : -1;
      setCurrentIndex((i) => (i + dir + imageCount) % imageCount);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => { el.removeEventListener('wheel', onWheel); clearTimeout(resetTimer); };
  }, [imageCount]);

  // Safety check for product data
  if (!product || !product.image || !Array.isArray(product.image) || product.image.length === 0) {
    return (
      <div className="gallery-card">
        <div className="error-card">
          <p>Product data unavailable</p>
        </div>
      </div>
    );
  }

  const handleHover = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const hasMultiple = product.image.length > 1;
  const isVisible = showViolentContent || !product.hasViolence;

  // Show the swiped-to media (defaults to the first). All versions are also
  // viewable on the detail page; the badge signals when a piece has more.
  const currentMedia = product.image[currentIndex] ?? product.image[0];
  const isVideo = currentMedia.includes('.mp4');
  const fullImageUrl = getFullImageUrl(currentMedia);

  // Cycle the on-card image with a horizontal swipe; vertical drags scroll.
  const cycle = (dir) =>
    setCurrentIndex((i) => (i + dir + product.image.length) % product.image.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    didSwipe.current = false;
  };

  const handleTouchEnd = (e) => {
    if (!hasMultiple) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      didSwipe.current = true;
      cycle(dx < 0 ? 1 : -1);
    }
  };

  // Swallow the click the browser fires after a swipe so we don't navigate.
  const handleClickCapture = (e) => {
    if (didSwipe.current) {
      e.preventDefault();
      didSwipe.current = false;
    }
  };

  return (
    <motion.div
      className="gallery-card"
      initial={reduced ? false : { opacity: 0, y: 36 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={reduced ? { duration: 0 } : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="gallery-card-content">
        <Link
          ref={linkRef}
          to={`/gallery/${product.id}${currentPage ? `?page=${currentPage}` : ''}`}
          className="link-no-underline"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClickCapture={handleClickCapture}
          style={hasMultiple ? { touchAction: 'pan-y' } : undefined}
        >
          {isVisible ? (
            <>
              {isVideo ? (
                <video
                  ref={videoRef}
                  className="gallery-video"
                  autoPlay
                  width="auto"
                  loop
                  muted={!isHovered}
                  onMouseOver={handleHover}
                  onMouseLeave={handleMouseLeave}
                  playsInline
                  controls={false}
                  src={fullImageUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={fullImageUrl}
                  loading="lazy"
                  alt={product.name}
                  className="gallery-image"
                />
              )}
              {hasMultiple && (
                <span className="card-media-count" aria-label={`${product.image.length} items — swipe to browse, view all on the piece's page`}>
                  <FontAwesomeIcon icon={faLayerGroup} />
                  {product.image.length}
                </span>
              )}
              {hasMultiple && (
                <div className="card-swipe-dots" aria-hidden="true">
                  {product.image.map((_, i) => (
                    <span
                      key={i}
                      className={`card-swipe-dot ${i === currentIndex ? 'active' : ''}`}
                    />
                  ))}
                </div>
              )}
              <div className="card-overlay">
                <span className="card-overlay-title">{product.name}</span>
                <span className="card-overlay-meta">
                  {product.media}{product.date ? ` · ${product.date}` : ''}
                </span>
              </div>
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
    </motion.div>
  );
};

export default GalleryCard;
