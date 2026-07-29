import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { withImageWidth, WIDTHS } from '../utils/imageService';

/**
 * Filmstrip coverflow — cards line up on a Z vanishing point (no rotation)
 * with a Wound-HUD skin: chamfered corners, cyan hairlines, mono DAT chips.
 *
 * @param {Array} items - [{ key, image, to, title?, meta?, kind? }]
 * @param {Function} getImageUrl - (filename) => url
 * @param {boolean} showCaption - render a caption block inside each card
 */
const Coverflow = ({ items = [], getImageUrl, showCaption = false, onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();
  const n = items.length;

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % n);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + n) % n);
  const goToSlide = (i) => setCurrentSlide(i);

  const [viewportW, setViewportW] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth : 375)
  );
  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || n <= 1) return;
    const interval = setInterval(() => nextSlide(), 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentSlide, n]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const touchX = useRef(null);
  const onTouchStart = (e) => {
    setIsAutoPlaying(false);
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current != null) {
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (dx > 40) prevSlide();
      else if (dx < -40) nextSlide();
    }
    touchX.current = null;
    setIsAutoPlaying(true);
  };

  // Filmstrip placement: horizontal spread + Z recession, no rotation.
  // Distance rides on --cf-dim (a black wash on ::after) so neighbors stay
  // solid instead of letting the page background bleed through.
  const cardStyle = (index) => {
    let offset = index - currentSlide;
    if (offset > n / 2) offset -= n;
    if (offset < -n / 2) offset += n;
    const abs = Math.abs(offset);
    const hidden = abs >= 3;

    const spread = Math.min(viewportW * 0.42, 300);
    const z = abs === 0 ? 0 : -160 * abs;
    const dim = abs === 0 ? 0 : abs === 1 ? 0.5 : abs === 2 ? 0.72 : 0.85;

    return {
      transform:
        `translateX(calc(-50% + ${offset * spread}px)) ` +
        `translateY(-50%) translateZ(${z}px)`,
      zIndex: 10 - abs,
      opacity: hidden ? 0 : 1,
      pointerEvents: hidden ? 'none' : 'auto',
      '--cf-dim': dim,
    };
  };

  if (!n) return null;

  return (
    <div
      className={`project-carousel coverflow${showCaption ? '' : ' coverflow-bare'}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="coverflow-stage">
        {items.map((item, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={item.key ?? index}
              className={`coverflow-card ${isActive ? 'active' : ''}`}
              style={cardStyle(index)}
              data-card-idx={String(index + 1).padStart(2, '0')}
              onClick={() => {
                if (!isActive) return goToSlide(index);
                if (item.to) {
                  onNavigate?.(item);
                  navigate(item.to);
                }
              }}
              role="button"
              aria-label={
                isActive
                  ? `Open ${item.title ?? 'item'}`
                  : `Go to ${item.title ?? `item ${index + 1}`}`
              }
            >
              {item.kind === 'log' ? (
                <div className="coverflow-log-face">
                  <span className="cf-log-prompt">root@mettaire.os</span>
                  <h3>{item.title}</h3>
                  {item.org && <span className="cf-log-org">{item.org}</span>}
                  {item.summary && <p>{item.summary}</p>}
                  {item.stack && (
                    <div className="cf-log-chips">
                      {item.stack.slice(0, 4).map((t) => (
                        <span key={t} className="cf-log-chip">{t}</span>
                      ))}
                    </div>
                  )}
                  <span className="cf-log-cta">read log →</span>
                </div>
              ) : (
                <img src={withImageWidth(getImageUrl(item.image), WIDTHS.GALLERY_CARD)} loading="lazy" alt={item.title ?? ''} />
              )}
              {item.kind !== 'log' && item.title && (
                <div className={`coverflow-card-text${item.compactTitle ? ' coverflow-card-text--compact' : ''}`}>
                  <h3>{item.title}</h3>
                  {item.meta && <p className="coverflow-card-meta">{item.meta}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="carousel-controls">
        <button className="carousel-nav carousel-prev" onClick={prevSlide} aria-label="Previous">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className="carousel-dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>
        <button className="carousel-nav carousel-next" onClick={nextSlide} aria-label="Next">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );
};

export default Coverflow;
