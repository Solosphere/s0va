import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotionPref } from '../utils/useReducedMotionPref';
import { withImageWidth, WIDTHS } from '../utils/imageService';

const FEATURED_FILES = [
  'HCT-17.webp',
  'kirin.webp',
  'secondwind.webp',
  'SAP.webp',
  'metvoyager.webp',
  'angel.webp',
];

const CYCLE_MS = 6000;

// Rotating orientation piece for the top of the gallery — one flagship at a
// time, click through to its detail. Pauses on hover so it doesn't advance
// while the visitor's reading the caption.
const GalleryHero = ({ products }) => {
  const reduced = useReducedMotionPref();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const findProductByImage = (filename) => {
    if (filename === 'HCT-17.webp') {
      return (products || []).find((p) => p.id === 103) || { id: 103 };
    }
    return (products || []).find(
      (p) => p.image && p.image.some((img) => img.includes(filename))
    );
  };

  const items = useMemo(
    () =>
      FEATURED_FILES.map((file) => {
        const product = findProductByImage(file);
        return {
          key: file,
          file,
          to: product ? `/gallery/${product.id}` : '/gallery',
          title: product?.name || '',
          media: product?.media || '',
          date: product?.date || '',
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products]
  );

  const n = items.length;
  const preloadRef = useRef(new Set());

  useEffect(() => {
    if (reduced || paused || n <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), CYCLE_MS);
    return () => clearInterval(t);
  }, [reduced, paused, n]);

  // Warm the next slot so the crossfade doesn't reveal a blank tile.
  useEffect(() => {
    const nextFile = items[(index + 1) % n]?.file;
    if (!nextFile || preloadRef.current.has(nextFile)) return;
    const img = new Image();
    img.src = withImageWidth(`/api/media/image/${nextFile}`, WIDTHS.HERO);
    preloadRef.current.add(nextFile);
  }, [index, items, n]);

  if (!n) return null;

  const active = items[index];

  return (
    <section
      className="gallery-hero"
      aria-label="Featured work"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link
        to={active.to}
        className="gallery-hero-frame"
        aria-label={active.title ? `Open ${active.title}` : 'Open featured work'}
      >
        {items.map((item, i) => (
          <img
            key={item.key}
            src={withImageWidth(`/api/media/image/${item.file}`, WIDTHS.HERO)}
            alt={item.title || ''}
            className={`gallery-hero-image ${i === index ? 'active' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            aria-hidden={i !== index}
          />
        ))}
        <div className="gallery-hero-caption">
          <span className="gallery-hero-title">{active.title || 'Featured'}</span>
          {(active.media || active.date) && (
            <span className="gallery-hero-meta">
              {active.media}
              {active.media && active.date ? ' · ' : ''}
              {active.date}
            </span>
          )}
        </div>
      </Link>
      {n > 1 && (
        <div className="gallery-hero-dots" role="tablist" aria-label="Featured works">
          {items.map((item, i) => (
            <button
              key={item.key}
              type="button"
              className={`gallery-hero-dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Show ${item.title || `piece ${i + 1}`}`}
              aria-selected={i === index}
              role="tab"
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default GalleryHero;
