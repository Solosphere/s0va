import React from 'react';
import { Link } from "react-router-dom";
import { useProducts } from '../context/ProductsProvider';
import Reveal from '../components/Reveal';
import HeroScene from '../components/HeroScene';
import { useGalleryScrollRestore } from '../utils/useScrollRestore';
import { withImageWidth, WIDTHS } from '../utils/imageService';

export default function HomePage() {
const { products } = useProducts();


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
          <div
            className="whoami-block"
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
          {baseFeatured.slice(0, 3).map((item) => (
            <Link
              key={item.key}
              to={item.to || '/gallery'}
              className="home-featured-tile"
              aria-label={item.title ? `Open ${item.title}` : 'Open featured work'}
            >
              <img
                src={getProtectedImageUrl(item.image)}
                alt={item.title || ''}
                loading="lazy"
              />
              {item.title && (
                <span className="home-featured-tile-title">{item.title}</span>
              )}
            </Link>
          ))}
        </div>
        <Link to="/gallery" className="home-featured-viewall">
          view all {products?.length ? `${products.length} ` : ''}works &rarr;
        </Link>
      </Reveal>
    </div>
  </div>
)
  
}

