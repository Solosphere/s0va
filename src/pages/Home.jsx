import React, { useEffect, useRef, useState } from 'react';
import { Link } from "react-router-dom";
import { useProducts } from '../context/ProductsProvider';
import Reveal from '../components/Reveal';
import HeroScene from '../components/HeroScene';
import { useGalleryScrollRestore } from '../utils/useScrollRestore';
import { withImageWidth, WIDTHS } from '../utils/imageService';

// Mobile tagline: single row that alternates between the two roles under the
// name. Each swap types the outgoing role out right-to-left, then types the
// incoming role in left-to-right — matches the desktop whoami's terminal
// feel and keeps the block from popping.
const ROTATING_ROLES = [
  { to: '/engineering', text: 'DevOps engineer @ Salesforce' },
  { to: '/gallery', text: 'Multimedia artist' },
];

const HOLD_MS = 2600;   // pause once a role is fully typed
const ERASE_MS = 32;    // per-char erase interval
const TYPE_MS = 55;     // per-char type interval

export default function HomePage() {
const { products } = useProducts();

// Mobile tagline: which role is being rendered right now, and how much of
// its text is currently visible. The animation walks through four phases:
//   typing → holding → erasing → next role (typing again).
// Splitting typed characters from the role index lets us keep the Link's
// href pointing at the correct destination even while the label is only
// partially typed.
const [roleIndex, setRoleIndex] = useState(0);
const [displayText, setDisplayText] = useState(ROTATING_ROLES[0].text);
const [phase, setPhase] = useState('holding'); // typing | holding | erasing
useEffect(() => {
  const targetText = ROTATING_ROLES[roleIndex].text;
  let timer;
  if (phase === 'typing') {
    if (displayText.length < targetText.length) {
      timer = setTimeout(() => {
        setDisplayText(targetText.slice(0, displayText.length + 1));
      }, TYPE_MS);
    } else {
      setPhase('holding');
    }
  } else if (phase === 'holding') {
    timer = setTimeout(() => setPhase('erasing'), HOLD_MS);
  } else if (phase === 'erasing') {
    if (displayText.length > 0) {
      timer = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, ERASE_MS);
    } else {
      setRoleIndex((n) => (n + 1) % ROTATING_ROLES.length);
      setPhase('typing');
    }
  }
  return () => clearTimeout(timer);
}, [phase, displayText, roleIndex]);
const activeRole = ROTATING_ROLES[roleIndex];


// Get featured images from products data
const featuredImages = ['HCT-17.webp','kirin.webp', 'secondwind.webp', 'SAP.webp', 'metvoyager.webp', 'angel.webp'];

// Function to find product by image filename
const findProductByImage = (imageFilename) => {
  // Special case: the HCT-17 teaser image isn't on product 103, but it links to
  // (and represents) it — return the real product so the card gets a title/meta.
  if (imageFilename === 'HCT-17.webp') {
    return products.find((p) => p.id === 103) || { id: 103 };
  }
  
  return products.find(product =>
    product.image &&
    product.image.some(img => img.includes(imageFilename))
  );
};

// Static featured tile data — each links to the piece's detail page.
const baseFeatured = featuredImages.map((image) => {
  const product = findProductByImage(image);
  return {
    key: image,
    image,
    to: product ? `/gallery/${product.id}` : null,
    title: product?.name,
  };
});

// Top on fresh entry; restore to the mini-gallery when returning from a piece.
useGalleryScrollRestore('homeScrollY');

// Get protected image URL from products data. Accepts either a bare filename
// or a pre-built /api/media/... path (the /api/products endpoint ships the
// latter form). Appends a width hint so the backend serves a downscaled
// variant — the coverflow renders at ~800px effective width even on desktop,
// so pulling full-res 3 MB assets was pure memory waste on iOS Safari.
const getProtectedImageUrl = (filename) => {
  const base = filename.startsWith('/api/media/') ? filename : `/api/media/image/${filename}`;
  return withImageWidth(base, WIDTHS.GALLERY_CARD);
};

// Featured rail: the fixed 5-slot order. Blacksite (terminal card) is slot 3,
// secondwind is slot 5, so the visual arc runs artwork → glitched gate →
// artwork with a payoff piece on the right.
const findFeatured = (filename) =>
  baseFeatured.find((item) => item.key === filename) || {
    key: filename,
    image: filename,
    to: null,
    title: null,
  };
const featuredSlots = [
  { kind: 'artwork', slot: 1, data: findFeatured('HCT-17.webp') },
  { kind: 'artwork', slot: 2, data: findFeatured('kirin.webp') },
  { kind: 'blacksite', slot: 3 },
  { kind: 'artwork', slot: 4, data: findFeatured('SAP.webp') },
  { kind: 'artwork', slot: 5, data: findFeatured('secondwind.webp') },
];

// Which tile is currently under the rail's viewport focus. Drives the
// "01 / 05" counter chip and the cyan active-tile border. Uses tile centers
// vs. the rail's center, plus an explicit end-of-scroll clamp — otherwise
// the last tile can never win because the rail's scroll position clamps
// before its left edge reaches the container's left edge.
const railRef = useRef(null);
const [activeIndex, setActiveIndex] = useState(0);
const handleRailScroll = () => {
  const rail = railRef.current;
  if (!rail) return;
  const tiles = rail.querySelectorAll('.home-featured-tile');
  if (!tiles.length) return;
  const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
  const atStart = rail.scrollLeft <= 2;
  let next;
  if (atEnd) {
    next = tiles.length - 1;
  } else if (atStart) {
    next = 0;
  } else {
    const railRect = rail.getBoundingClientRect();
    const railCenter = railRect.left + railRect.width / 2;
    let best = Infinity;
    next = 0;
    tiles.forEach((tile, i) => {
      const r = tile.getBoundingClientRect();
      const d = Math.abs((r.left + r.width / 2) - railCenter);
      if (d < best) { best = d; next = i; }
    });
  }
  if (next !== activeIndex) setActiveIndex(next);
};

return (
  <div className="home-page">
    <div className='home-row'>
      <div className='home-container'>
        <div className="video-container">
          <HeroScene />
        </div>
        <div className="content">
          <h1 className="landingpage-title">METTAIRE</h1>
          {/* Desktop / tablet+: original single-line whoami. Hidden on
              mobile via CSS. */}
          <div
            className="whoami-block whoami--desktop"
            role="doc-subtitle"
            aria-label="Daniel Nelson — DevOps engineer at Salesforce and multimedia artist"
          >
            <p className="whoami-output">
              <span className="whoami-typed">
                <span className="whoami-name">Daniel Nelson</span>
                <span className="whoami-sep" aria-hidden="true">&nbsp;&middot;&nbsp;</span>
                <Link to="/engineering" className="whoami-role whoami-role--engineer">DevOps engineer @ Salesforce</Link>
                <span className="whoami-sep" aria-hidden="true">&nbsp;&middot;&nbsp;</span>
                <Link to="/gallery" className="whoami-role whoami-role--artist">Multimedia artist</Link>
              </span>
              <span className="terminal-cursor whoami-cursor" aria-hidden="true">▮</span>
            </p>
          </div>
          {/* Mobile: name on top, rotating role below. Shown on mobile via CSS. */}
          <div
            className="whoami-block whoami--rotating"
            role="doc-subtitle"
            aria-label="Daniel Nelson — DevOps engineer at Salesforce and multimedia artist"
          >
            <p className="whoami-output">
              <span className="whoami-name">Daniel Nelson</span>
              <span className="whoami-rot-line">
                <span className="whoami-rot-prompt" aria-hidden="true">&gt;&nbsp;</span>
                <Link
                  to={activeRole.to}
                  className="whoami-role whoami-rot-role"
                  aria-label={activeRole.text}
                >
                  {displayText}
                  <span
                    className="whoami-rot-caret"
                    data-phase={phase}
                    aria-hidden="true"
                  >▮</span>
                </Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div className="featured-art-content">
      <Reveal className="detailed-bio">
        <section className="rect-home-container">
          <section className="rect-1"></section>
          <section className="rect-2"></section>
        </section>
        <h2>THE VISION</h2>
        <p>
          Two disciplines, one preoccupation: what a person is when the systems around them break. The site is split into engineering case studies and a gallery of visual works. All of it circles the same question.
        </p>
        <div className="home-button-row">
          <Link to="/about" className="home-about-link"><button className="home-about-button home-cta"><span className="btn-prompt">CD</span>/ABOUT</button></Link>
          <Link to='/engineering' className="engineering-log-link"><button className="home-about-button engineering-log-button home-cta"><span className="btn-prompt">CD</span>/ENGINEERING</button></Link>
          <Link to='/gallery' className="explore-gallery-link"><button className="explore-gallery-button home-cta"><span className="btn-prompt">CD</span>/GALLERY</button></Link>
        </div>
      </Reveal>

      <Reveal as="section" className="home-featured-strip" aria-label="Featured works">
        {/* Outer box: mirrors the gallery-detail rail chrome — a thin bordered
            container with the "01 / 05" active-position counter pinned to the
            top-left. A vertical "FEATURED" spine sits on the outer-left edge
            (rotated bottom-to-top) in place of the old horizontal header +
            rect divider. Same layout ships on mobile / tablet / desktop; the
            rail inside is horizontally swipeable so tiles can render bigger
            than "5 across a phone" would allow. */}
        <div className="home-featured-rail-box">
          <h2 className="home-featured-rail-spine">FEATURED</h2>
          <span className="home-featured-rail-chip" aria-hidden="true">FEATURED</span>
          <div className="home-featured-rail-counter" aria-hidden="true">
            <span className="home-featured-rail-counter-current">
              {String(activeIndex + 1).padStart(2, '0')}
            </span>
            <span className="home-featured-rail-counter-sep">/</span>
            <span className="home-featured-rail-counter-total">
              {String(featuredSlots.length).padStart(2, '0')}
            </span>
          </div>
          <div
            className="home-featured-tiles"
            ref={railRef}
            onScroll={handleRailScroll}
          >
            {featuredSlots.map((entry, i) => {
              const isActive = i === activeIndex;
              const indexLabel = String(entry.slot).padStart(2, '0');
              if (entry.kind === 'blacksite') {
                return (
                  <Link
                    key="blacksite"
                    to="/programs"
                    className={`home-featured-tile home-featured-tile--blacksite${isActive ? ' home-featured-tile--active' : ''}`}
                    aria-label="Restricted terminal — enter root@mettaire.os"
                  >
                    <span className="home-featured-tile-index" aria-hidden="true">
                      {indexLabel}
                    </span>
                    <span className="home-featured-tile-media">
                      <div className="blacksite-tile-inner" aria-hidden="true">
                        <div className="blacksite-tile-scanline" />
                        <div className="blacksite-tile-lines">
                          <div className="blacksite-tile-line">
                            <span className="blacksite-tile-prompt">root@mettaire.os:~#</span>{' '}
                            <span className="blacksite-tile-cmd">access /blacksite</span>
                          </div>
                          <div className="blacksite-tile-line blacksite-tile-line--warn">
                            [!] AUTH REQUIRED
                          </div>
                          <div
                            className="blacksite-tile-line blacksite-tile-line--denied"
                            data-text="ACCESS DENIED"
                          >
                            ACCESS DENIED
                          </div>
                          <div className="blacksite-tile-line blacksite-tile-line--dim">
                            &gt; retry with credentials_
                          </div>
                        </div>
                      </div>
                      <span className="home-featured-tile-title">/programs/blacksite</span>
                    </span>
                  </Link>
                );
              }
              const item = entry.data;
              return (
                <Link
                  key={item.key}
                  to={item.to || '/gallery'}
                  className={`home-featured-tile${isActive ? ' home-featured-tile--active' : ''}`}
                  aria-label={item.title ? `Open ${item.title}` : 'Open featured work'}
                >
                  <span className="home-featured-tile-index" aria-hidden="true">
                    {indexLabel}
                  </span>
                  <span className="home-featured-tile-media">
                    <img
                      src={getProtectedImageUrl(item.image)}
                      alt={item.title || ''}
                      loading="lazy"
                    />
                    {item.title && (
                      <span className="home-featured-tile-title">{item.title}</span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Bottom-right "next action" — sits inside the box, diagonally
              opposite the top-left 01/05 counter and clear of the left-edge
              FEATURED spine, so the panel reads as: 5 shown of the full set,
              here's the listing for all of them. */}
          <Link to="/gallery" className="home-featured-viewall">
            <button className="home-about-button home-cta">
              <span className="btn-prompt">LS</span>{products?.length ? `${products.length} ` : ''}works &rarr;
            </button>
          </Link>
        </div>
      </Reveal>
    </div>
  </div>
)
  
}

