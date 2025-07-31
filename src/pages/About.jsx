import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import ProjectCarousel from '../components/ProjectCarousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faGithub, faMedium, faLinkedin} from '@fortawesome/free-brands-svg-icons';
import { useProducts } from '../context/ProductsProvider';

// Get protected image URL from products data
const getProtectedImageUrl = (filename, products) => {
  // Always return the full API URL, regardless of products data
  return `/api/media/image/${filename}`;
};

// Get protected video URL from products data
const getProtectedVideoUrl = (filename, products) => {
  // Always return the full API URL, regardless of products data
  return `/api/media/video/${filename}`;
};

const AboutPage = () => {
  const { products } = useProducts();
  const tattooImages = ["tattoopray.webp", "tat-2.webp", "tat-3.webp", "customsnake.webp"]
  const [loading, setLoading] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [isSliding, setIsSliding] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode setting
  useEffect(() => {
    const checkDarkMode = () => {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setIsDarkMode(settings.isDarkMode || false);
      }
    };

    checkDarkMode();

    // Listen for settings changes
    const handleSettingsChanged = () => {
      checkDarkMode();
    };

    window.addEventListener('settingsChanged', handleSettingsChanged);
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChanged);
    };
  }, []);

  // Get the appropriate image based on dark mode
  const getProfileImage = () => {
    return isDarkMode ? "invertedheadshot.jpeg" : "thershold.webp";
  };

  // Get the appropriate video based on dark mode
  const getContactVideo = () => {
    return isDarkMode ? "skull.mp4" : "bsh.mp4";
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // Simulate a delay for loading
    const delay = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Cleanup the timeout to avoid potential memory leaks
    return () => clearTimeout(delay);
  }, []); 

  useEffect(() => {
    const text = " root@signal.node ~ % $ echo '01001000 01100101 01110010 01100101 00101100 00100000 01001001 00100000 01100001 01101101 00100000 01101001 01101110 01100110 01101001 01101110 01101001 01110100 01100101 00101110 00100000 01011001 01101111 01110101 00100000 01100011 01100001 01101110 00100111 01110100 00100000 01101011 01101001 01101100 01101100 00100000 01101101 01100101 00100000 01001001 00100111 01101101 00100000 01111010 01100101 01110010 01101111 01110011 00100000 01100001 01101110 01100100 00100000 01101111 01101110 01100101 01110011 00101110 00001010'"; 
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length-1) {
        setTypedText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50); // Typing speed

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="about-container">
      
      <header className="about-header">
        <h1>ABOUT</h1>
        <section className="about-caption">
        <p>{typedText}</p>
        </section>
      </header>

      <section className="about-row-1">
        <section className="introduction">
        <img src={getProtectedImageUrl(getProfileImage(), products)} loading="lazy" alt="selfportrait"/>
        <h2>THE CREATIVE</h2>
        <p>I'm Daniel Nelson, the creator behind MT8. As an artist, graphic designer, and software engineer, MT8 is my way of leaving a piece of myself within the machine—a space where my work exists on its own, independent of an intended audience (unless rooted in code). Inspired by thinkers like Dostoevsky, Camus, Schopenhauer, and Musashi, my creations explore individualism, transformation, and the human condition. Through code, multimedia paintings, and graphic design, I merge fine art with technology, weaving existential themes—absurdism, nihilism, and existentialism—into experiences open to being encountered, absorbed, and interpreted freely.
        </p>
        </section>
        <section className="philosophy-inspiration-container">
          <section>
            <section className="rect-container">
              <section className="rect-1"></section>
              <section className="rect-2"></section>
            </section>
              <h2>Beyond the Canvas</h2>
              <p>My journey extends beyond traditional means of art and design, driven by a passion for impactful software projects like Second Wind and CareerSpring's Interest Finder feature.
                Each line of code and project is designed to empower individuals, helping them face their paths with courage and resilience. This vision, in harmony with the themes of MT8, seeks to make technology a transformative force, illuminating our collective journey and offering direction in challenging times. </p>
                </section>
                {/* Project Carousel */}
                <ProjectCarousel products={products} getProtectedImageUrl={getProtectedImageUrl} />
                
                </section>
                </section>
    
      <section className="about-row-3">
      <section className="upcoming-projects">
      <section className="rect-container">
            <section className="rect-1"></section>
            <section className="rect-2"></section>
            </section>
        <div className="upcoming-projects-text-section">
          
        <h2>Projects in Progress</h2>
        <p>* Not limited to the showcased.</p>
        </div>
        <div className="upcoming-projects-column-2">
        <div className="image-with-description" id="chrome-container" >
      <video autoPlay muted width="auto" loop playsInline controls={false}>
            <source src={getProtectedVideoUrl('HCteaser.mp4', products)} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
      <div className='chrome-text'>
        <h3>Heart in Chrome</h3>
        <p>A psychological neo-noir thriller unfolds in <i>Heart in Chrome</i>, a graphic novel currently in the throes of creation, exploring the nexus of art, technology, identity, and power.
        <br /><br /> 
        * You can now check out some concept designs for <i>Heart in Chrome</i> in the cache section!</p>
      </div>
    </div>
    
    <div className="image-with-description" id="tats">
    <div className="tattoo-text">
      <h3>Tattooing</h3>
      <p> As my journey unfolds, I aim to use tattooing as another layer of my creative odyssey to explore different ways to connect art with personal experiences and cultural influences.
      <br /><br />
         *You can find more designs and practice in the cache section!</p>
    </div>
    <div className="tattoo-mini-gallery">
      <div className='image-column-1'>
                  <img src={getProtectedImageUrl(tattooImages[0], products)} alt={"tat-0"} />
      </div>
      <div className='image-column-2'>
      {/* <img src = {`/images/${tattooImages[4]}`} alt= {"tat-4"} /> */}
                  <img src={getProtectedImageUrl(tattooImages[3], products)} alt={"tat-3"} />
      </div>  
    </div>
    </div>
    </div>
      </section>
      </section>

      <section className="contact-container">
        <div className='contact-information-container'>
          <section className="rect-container">
              <section className="rect-1"></section>
              <section className="rect-2"></section>
          </section>
          <h2>Contact Information</h2>
          <p>
            Connect with me on social media and explore my portfolio. Always open to hear your thoughts and insights.
          </p>
          
          <div className="social-media-row">
            <div className="social-media-links">
                <a href="https://www.instagram.com/dan.da.solo/" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faInstagram} size="2x" />
                </a>
                <a href="https://github.com/danielnelson37" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faGithub} size="2x" />
                </a>
                <a href="https://medium.com/@lukannelson" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faMedium} size="2x" />
                </a>
                <a href="https://www.linkedin.com/in/dnelson777" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faLinkedin} size="2x" />
                </a>
            </div>
          </div>
          
          <div className='contact-img'>
            <video key={getContactVideo()} className="contact-image" autoPlay muted width="auto" loop playsInline controls={false}>
              <source src={getProtectedVideoUrl(getContactVideo(), products)} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
