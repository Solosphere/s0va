import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons'; 
import { useProducts } from '../context/ProductsProvider';

export default function HomePage() {
const { products } = useProducts();
const [currentImageIndex, setCurrentImageIndex ] = useState(0);
const location = useLocation();

// Get the intro video URL from products data
const introVideo = products && products.length > 0 ? products.find(p => p.image && p.image.some(img => img.includes('intro.mp4'))) : null;
const introVideoUrl = introVideo ? introVideo.image.find(img => img.includes('intro.mp4')) : '/api/media/video/intro.mp4';

// Get featured images from products data
const featuredImages = ['HCT-17.webp','kirin.webp', 'secondwind.webp', 'SAP.webp', 'metvoyager.webp', 'angel.webp'];

const handleNextImage = () => {
  setCurrentImageIndex((prevIndex)=> (prevIndex + 1) % featuredImages.length);
}

const handlePrevImage = () => {
  setCurrentImageIndex((prevIndex) =>(prevIndex - 1 + featuredImages.length) % featuredImages.length);
}

useEffect (() => {
    window.scrollTo(0, 0);
 }, [location.pathname]);

 // Set up interval to automatically change the image every 5 seconds
 useEffect(() => {
  const interval = setInterval(() => {
    handleNextImage();
  }, 5000); // Change every 5 seconds

  // Clean up the interval when the component unmounts
  return () => clearInterval(interval);
}, []);

// Get protected image URL from products data
const getProtectedImageUrl = (filename) => {
  if (!products || products.length === 0) {
    return `/api/media/image/${filename}`;
  }
  
  const product = products.find(p => p.image && p.image.some(img => img.includes(filename)));
  if (product) {
    return product.image.find(img => img.includes(filename));
  }
  return `/api/media/image/${filename}`;
};

return (
  <div className="home-page">
  <div className='home-row'>
  <div className='home-container'>
  <div className="video-container">
    <video className="landingpage-image" autoPlay muted width="100%" height="100%" loop playsInline controls={false}>
      <source src={introVideoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
  <div className="content">
    <h1 className="landingpage-title">SOLUS CORE</h1>
    <Link to='/archive?page=1' className="no-underline">
      <h2 className="tagline">The Cache</h2>
    </Link>
  </div>
  </div>
</div>
  <div className="featured-art-content">
    <div className="featured-art-container">
    <div className="featured-work-title">
    <h2 className="rotate-text">Featured Works</h2>
    </div>
    <div className="mini-gallery">
      <div className="mini-gallery-img">
      <img src={getProtectedImageUrl(featuredImages[currentImageIndex])} alt={`Artwork ${currentImageIndex + 1}`} />
      </div>
      <div className="featured-art-icon-row">
      <FontAwesomeIcon icon={faChevronLeft} onClick={handlePrevImage} className="prev" />
      <FontAwesomeIcon icon={faChevronRight} onClick={handleNextImage} className="next"/>
      </div>
    </div>
    </div>
    <div className="detailed-bio">
    <section className="rect-home-container">
            <section className="rect-1"></section>
            <section className="rect-2"></section>
            </section>
    <h2>THE VISION</h2>
    <p>Welcome to SOLUS CORE. I'm Daniel Nelson, and I've developed this space to store my personal works, ranging from software to paintings. Each piece delves into existential themes—absurdism, nihilism, and existentialism—inviting you to explore the intricate interplay of existential inquiry.   
 </p>
    <div className="home-button-row">
      <Link to="/about" className="home-about-link"><button className="home-about-button">Learn More</button></Link> 
      <Link to='/archive?page=1' className="explore-gallery-link"><button className="explore-gallery-button">Explore Archive</button></Link>
    </div>
    </div>
  </div>
</div>
  )
  
}

