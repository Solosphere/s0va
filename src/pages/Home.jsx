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

// Featured rail is a multi-per-view auto-advancing carousel: mobile shows 1
// tile per view, tablet 2, desktop 3 (mirrors the --home-featured-per-view
// CSS var). A persistent interval advances activeIndex every AUTO_MS.
// Interaction (hover, touch, manual scroll) flips pausedRef so the interval
// skips a tick without being torn down and re-created.
const railRef = useRef(null);
// activeIndex is the *target* the auto-advance / swipe wants to land on.
// displayIndex tracks what's *actually* on screen right now — updated live
// from scrollLeft on every scroll event so the 01/05 counter animates in
// sync with the scroll, instead of jumping ahead of the still-animating
// tiles the moment activeIndex changes.
const [activeIndex, setActiveIndex] = useState(0);
const [displayIndex, setDisplayIndex] = useState(0);
const pausedRef = useRef(false);
const programmaticScrollRef = useRef(false);
const resumeTimerRef = useRef(null);
const AUTO_MS = 5000;
// Kept in sync with the --home-featured-gap CSS var. When each tile is
// (100% - gap*(n-1))/n and separated by a gap, the scrollLeft of tile N is
// N * (tileWidth + gap).
const FEATURED_GAP = 24;

// Match the tiles-per-view breakpoints in the CSS (748px, 1100px). Kept in
// sync via a matchMedia listener so a viewport resize updates the step math
// + the active-index cap on the fly.
const getPerView = () => {
  if (typeof window === 'undefined') return 1;
  if (window.matchMedia('(min-width: 1100px)').matches) return 3;
  if (window.matchMedia('(min-width: 748px)').matches) return 2;
  return 1;
};
const [perView, setPerView] = useState(getPerView);
useEffect(() => {
  const onResize = () => setPerView(getPerView());
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);
// With N tiles and P per view, the last valid start-index is (N - P). Any
// higher would clamp to the same scroll position — the tile would appear
// frozen for a tick before wrapping. maxIndex handles the ceiling.
const maxIndex = Math.max(0, featuredSlots.length - perView);
// activeTileIndex is just the leftmost tile currently in view — its own tile
// index, no proportional remap. The previous mapping compressed the visible
// scroll range (0..maxIndex) onto the full tile range (0..N-1), which made
// the counter increment by 2 at perView=3 (1 → 3 → 5) and skip a number at
// perView=2 (1 → 2 → 4 → 5). Using the raw scroll position keeps the counter
// stepping by 1 per snap point in every perView.
const activeTileIndex = displayIndex;

// Rightmost tile currently in view — used with displayIndex to display the
// counter as a range "NN-MM/05" whenever perView > 1 so the total stays the
// full tile count (05) and every visible tile is represented at each snap.
const rightmostVisible = Math.min(
  displayIndex + perView - 1,
  featuredSlots.length - 1,
);
// If perView jumps (e.g. rotation, resize), clamp the active index so it
// doesn't sit above the new maxIndex.
useEffect(() => {
  setActiveIndex((i) => Math.min(i, maxIndex));
}, [maxIndex]);

// Advance timer — installed once on mount, torn down on unmount. State is
// driven inside the tick so pausing doesn't wipe out the schedule. The
// modulo is (maxIndex + 1) so 3-per-view desktop wraps at index 2 → 0
// instead of stepping through 3, 4 (which would clamp to the same scroll
// position and look frozen).
useEffect(() => {
  const t = setInterval(() => {
    if (pausedRef.current) return;
    setActiveIndex((i) => (i + 1) % (maxIndex + 1));
  }, AUTO_MS);
  return () => clearInterval(t);
}, [maxIndex]);

// Sync scroll position to the active slot whenever it changes.
// programmaticScrollRef flags the resulting onScroll fires so they don't get
// mistaken for a user swipe (which would pause auto-advance).
// Wrap-around (last -> first) uses an instant jump because a smooth scroll
// across 4+ snap points fights `scroll-snap-type: x mandatory` — the snap
// engine keeps re-anchoring mid-animation, leaving the tile stuck.
// Step math: with P tiles per view, each tile is (clientWidth - gap*(P-1))/P
// wide, and each snap point is (tileWidth + gap) apart.
useEffect(() => {
  const rail = railRef.current;
  if (!rail) return;
  const tileWidth = (rail.clientWidth - FEATURED_GAP * (perView - 1)) / perView;
  const step = tileWidth + FEATURED_GAP;
  const target = activeIndex * step;
  const current = rail.scrollLeft;
  const distance = Math.abs(target - current);
  const isLongJump = distance > step * 1.5;
  programmaticScrollRef.current = true;
  rail.scrollTo({
    left: target,
    behavior: isLongJump ? 'auto' : 'smooth',
  });
  const settle = setTimeout(() => {
    programmaticScrollRef.current = false;
    // Force-sync the display index once the animation should have landed —
    // some browsers don't fire a final `scroll` event exactly at the snap
    // target on smooth scrolls, so the counter could otherwise stick 1
    // short of the active tile.
    setDisplayIndex(activeIndex);
  }, isLongJump ? 60 : 900);
  return () => clearTimeout(settle);
}, [activeIndex, perView]);

const pauseAuto = (resumeMs = 6000) => {
  pausedRef.current = true;
  clearTimeout(resumeTimerRef.current);
  resumeTimerRef.current = setTimeout(() => {
    pausedRef.current = false;
  }, resumeMs);
};

// Scroll handler serves two purposes:
// 1. Update displayIndex live (including during programmatic scrolls) so
//    the 01/05 counter tracks the actual rail position instead of jumping
//    ahead the moment activeIndex changes. This was the "counter is messed
//    up and doesn't align to the scroll" bug on desktop.
// 2. On user swipes (programmaticScrollRef is false), update activeIndex
//    to match where the swipe landed and pause auto-advance for a beat.
const handleRailScroll = () => {
  const rail = railRef.current;
  if (!rail || !rail.clientWidth) return;
  const tileWidth = (rail.clientWidth - FEATURED_GAP * (perView - 1)) / perView;
  const step = tileWidth + FEATURED_GAP;
  const live = Math.max(0, Math.min(Math.round(rail.scrollLeft / step), maxIndex));
  setDisplayIndex((prev) => (prev === live ? prev : live));
  if (programmaticScrollRef.current) return;
  if (live !== activeIndex) setActiveIndex(live);
  pauseAuto(6000);
};
const handleRailPointerEnter = () => pauseAuto(6000);
const handleRailPointerLeave = () => pauseAuto(1500);

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
          {/* Counter head: current visible tile number(s) sitting inline with
              the 5-segment HUD track. Number-first (NN or NN-MM), a small gap,
              then five chamfered bars, of which the ones matching the visible
              tiles glow cyan. Wrapped in one absolute-positioned flex row so
              the two atoms stay locked together on a single line in the
              top-left of the rail box. */}
          <div className="home-featured-rail-readout" aria-hidden="true">
            <span className="home-featured-rail-counter">
              <span className="home-featured-rail-counter-current">
                {String(displayIndex + 1).padStart(2, '0')}
                {perView > 1 && rightmostVisible > displayIndex && (
                  <>
                    <span className="home-featured-rail-counter-range">-</span>
                    {String(rightmostVisible + 1).padStart(2, '0')}
                  </>
                )}
              </span>
            </span>
            <span className="home-featured-rail-segments">
              {featuredSlots.map((_, i) => {
                const on = i >= displayIndex && i <= rightmostVisible;
                return (
                  <span
                    key={i}
                    className={`home-featured-rail-segment${on ? ' is-on' : ''}`}
                  />
                );
              })}
            </span>
          </div>
          <div
            className="home-featured-tiles"
            ref={railRef}
            onScroll={handleRailScroll}
            onMouseEnter={handleRailPointerEnter}
            onMouseLeave={handleRailPointerLeave}
            onTouchStart={handleRailPointerEnter}
            onTouchEnd={handleRailPointerLeave}
          >
            {featuredSlots.map((entry, i) => {
              const isActive = i >= displayIndex && i <= rightmostVisible;
              const indexLabel = String(entry.slot).padStart(2, '0');
              if (entry.kind === 'blacksite') {
                return (
                  <div
                    key="blacksite"
                    className={`home-featured-tile-wrap${isActive ? ' home-featured-tile-wrap--active' : ''}`}
                  >
                    <span className="home-featured-tile-index" aria-hidden="true">
                      {indexLabel}
                    </span>
                    <Link
                      to="/programs"
                      className={`home-featured-tile home-featured-tile--blacksite${isActive ? ' home-featured-tile--active' : ''}`}
                      aria-label="Restricted terminal — enter root@mettaire.os"
                    >
                      <span className="home-featured-tile-media">
                        <div className="blacksite-tile-inner" aria-hidden="true">
                          <div className="blacksite-tile-grid" />
                          <div className="blacksite-tile-scanline" />
                          <div className="blacksite-tile-head">
                            <span className="blacksite-tile-status">
                              <span className="blacksite-tile-status-dot" />
                              RESTRICTED
                            </span>
                          </div>
                          <div className="blacksite-tile-body">
                            <span className="blacksite-tile-label">BLACKSITE</span>
                            <span className="blacksite-tile-sub">/programs</span>
                          </div>
                          <div className="blacksite-tile-foot">
                            <span className="blacksite-tile-prompt">root@mettaire.os ~ %</span>
                            <span className="blacksite-tile-cursor" aria-hidden="true">▮</span>
                          </div>
                        </div>
                        <span className="home-featured-tile-title">/programs/blacksite</span>
                      </span>
                    </Link>
                  </div>
                );
              }
              const item = entry.data;
              return (
                <div
                  key={item.key}
                  className={`home-featured-tile-wrap${isActive ? ' home-featured-tile-wrap--active' : ''}`}
                >
                  <span className="home-featured-tile-index" aria-hidden="true">
                    {indexLabel}
                  </span>
                  <Link
                    to={item.to || '/gallery'}
                    className={`home-featured-tile${isActive ? ' home-featured-tile--active' : ''}`}
                    aria-label={item.title ? `Open ${item.title}` : 'Open featured work'}
                  >
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
                </div>
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

