import React, { useEffect, useState } from 'react';
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
  { to: '/gallery', text: 'multimedia artist' },
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
                <Link to="/gallery" className="whoami-role whoami-role--artist">multimedia artist</Link>
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
        <div className="home-featured-strip-header">
          <section className="rect-home-container">
            <section className="rect-1"></section>
            <section className="rect-2"></section>
          </section>
          <h2>FEATURED</h2>
        </div>
        <div className="home-featured-tiles">
          {/* Slot 1 + 2: the first two artwork tiles (HCT-17, kirin). */}
          {baseFeatured.slice(0, 2).map((item, i) => (
            <Link
              key={item.key}
              to={item.to || '/gallery'}
              className={`home-featured-tile${i === 0 ? ' home-featured-tile--active' : ''}`}
              aria-label={item.title ? `Open ${item.title}` : 'Open featured work'}
            >
              <span className="home-featured-tile-index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="home-featured-tile-media">
                <img
                  src={getProtectedImageUrl(item.image)}
                  alt={item.title || ''}
                  loading="lazy"
                />
              </span>
              {item.title && (
                <span className="home-featured-tile-title">{item.title}</span>
              )}
            </Link>
          ))}
          {/* Slot 3: glitched terminal card that replaces the third artwork
              across all viewports and links into the restricted /programs
              gate. Purely decorative text — aria-label is what SRs announce. */}
          <Link
            to="/programs"
            className="home-featured-tile home-featured-tile--blacksite"
            aria-label="Restricted terminal — enter root@mettaire.os"
          >
            <span className="home-featured-tile-index" aria-hidden="true">03</span>
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
            </span>
            <span className="home-featured-tile-title">/programs/blacksite</span>
          </Link>
        </div>
        <Link to="/gallery" className="home-featured-viewall">
          view all {products?.length ? `${products.length} ` : ''}works &rarr;
        </Link>
      </Reveal>
    </div>
  </div>
)
  
}

