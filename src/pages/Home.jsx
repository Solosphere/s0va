import React from 'react';
import { Link } from "react-router-dom";
import { useProducts } from '../context/ProductsProvider';
import Reveal from '../components/Reveal';
import Coverflow from '../components/Coverflow';
import HeroScene from '../components/HeroScene';
import { useGalleryScrollRestore } from '../utils/useScrollRestore';
import { toLogCard } from '../data/caseStudies';

export default function HomePage() {
const { products } = useProducts();

// Get featured images from products data
const featuredImages = ['HCT-17.webp','kirin.webp', 'secondwind.webp', 'SAP.webp', 'metvoyager.webp', 'angel.webp'];

// Function to find product by image filename
const findProductByImage = (imageFilename) => {
  // Special case for HCT-17.webp - link to cache/103
  if (imageFilename === 'HCT-17.webp') {
    return { id: 103 };
  }
  
  return products.find(product =>
    product.image &&
    product.image.some(img => img.includes(imageFilename))
  );
};

// Featured items for the 3D coverflow, each linking to its detail page
const baseFeatured = featuredImages.map((image) => {
  const product = findProductByImage(image);
  return { key: image, image, to: product ? `/gallery/${product.id}` : null };
});

// Slot an engineering case study (terminal card) in among the visual works.
const featuredLogCard = toLogCard('nat-refresh-pipeline');
const featuredItems = featuredLogCard
  ? [baseFeatured[0], featuredLogCard, ...baseFeatured.slice(1)]
  : baseFeatured;

// Top on fresh entry; restore to the mini-gallery when returning from a piece.
useGalleryScrollRestore('homeScrollY');

// Get protected image URL from products data
const getProtectedImageUrl = (filename) => {
  // Always return the full API URL, regardless of products data
  return `/api/media/image/${filename}`;
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
          <h2 className="tagline tagline-command">
            <span className="tagline-cmd">&gt; grep -E &quot;</span><Link to="/engineering" className="tagline-target">engineering</Link><span className="tagline-pipe">|</span><Link to="/gallery?page=1" className="tagline-target">gallery</Link><span className="tagline-cmd">&quot;</span><span className="terminal-cursor" aria-hidden="true">▮</span>
          </h2>
        </div>
      </div>
    </div>
    <div className="featured-art-content">
      <Reveal className="featured-art-container">
        <div className="featured-work-title">
          <section className="rect-home-container">
            <section className="rect-1"></section>
            <section className="rect-2"></section>
          </section>
          <h2 className="rotate-text">Featured Works</h2>
        </div>
        <Coverflow items={featuredItems} getImageUrl={getProtectedImageUrl} />
      </Reveal>
      <Reveal className="detailed-bio">
        <section className="rect-home-container">
          <section className="rect-1"></section>
          <section className="rect-2"></section>
        </section>
        <h2>THE VISION</h2>
        <p>Welcome to METTAIRE. I'm Daniel Nelson — a DevOps engineer at Salesforce and a visual artist. I build and secure cloud infrastructure at scale, as well as paint, design, and write code that's entirely my own. This space holds both sides—where engineering discipline meets fine art, and every piece circles the same existential themes: absurdism, nihilism, and the search for meaning and impact.
        </p>
        <div className="home-button-row">
          <Link to="/about" className="home-about-link"><button className="home-about-button">Learn More</button></Link>
          <Link to='/gallery?page=1' className="explore-gallery-link"><button className="explore-gallery-button">Explore Gallery</button></Link>
          <Link to='/engineering' className="engineering-log-link"><button className="home-about-button engineering-log-button">Engineering Log</button></Link>
        </div>
      </Reveal>
    </div>
  </div>
)
  
}

