import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import ProjectCarousel from '../components/ProjectCarousel';
import AboutConsole from '../components/AboutConsole';
import Reveal from '../components/Reveal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faMedium, faLinkedin} from '@fortawesome/free-brands-svg-icons';
import { useProducts } from '../context/ProductsProvider';
import { getLastPath } from '../utils/navTracker';
import { withImageWidth, WIDTHS } from '../utils/imageService';

// Get protected image URL from products data. Accepts either a bare filename
// or a pre-built /api/media/... path (the /api/products endpoint ships the
// latter form). Appends a width hint so we serve downscaled variants — same
// design, an order-of-magnitude less memory on iOS Safari.
const getProtectedImageUrl = (filename, products, width = WIDTHS.GALLERY_CARD) => {
  const base = filename.startsWith('/api/media/') ? filename : `/api/media/image/${filename}`;
  return withImageWidth(base, width);
};

// Get protected video URL from products data.
const getProtectedVideoUrl = (filename, products) => {
  if (filename.startsWith('/api/media/')) return filename;
  return `/api/media/video/${filename}`;
};

const AboutPage = () => {
  const { products } = useProducts();
  // Map a piece's media filename to its detail-page id, so the in-progress
  // project cards link straight to that piece in the cache.
  const findProductId = (filename) =>
    (Array.isArray(products)
      ? products.find((p) => p.image && p.image.some((img) => img.includes(filename)))
      : null)?.id ?? null;
  const chromeId = findProductId('HCteaser.mp4');
  const tattooId = findProductId('tattoopray.webp');
  // Whether we arrived from a detail page (a /gallery/:id piece or a
  // /engineering/:id case study opened from the carousel) — captured at first
  // render, before the app-level route tracker overwrites the "came from" path.
  const cameFromDetailRef = useRef(/^\/(gallery|engineering)\//.test(getLastPath()));
  const tattooImages = ["tattoopray.webp", "tat-2.webp", "tat-3.webp", "customsnake.webp"]
  const [loading, setLoading] = useState(true);
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
    let raf;
    if (cameFromDetailRef.current) {
      // Returning from a piece: anchor to whichever section the piece was opened
      // from (the carousel, or the Projects-in-Progress cards) and keep it pinned
      // while the lazy media above loads — a saved pixel offset drifts onto the
      // wrong section as the page grows.
      const section = sessionStorage.getItem('aboutReturn') || 'carousel';
      sessionStorage.removeItem('aboutReturn');
      const selector = section === 'projects' ? '.trajectory-projects' : '.project-carousel';
      const start = performance.now();
      const pin = () => {
        const el = document.querySelector(selector);
        if (el) el.scrollIntoView({ block: 'center', behavior: 'auto' });
        if (performance.now() - start < 1200) raf = requestAnimationFrame(pin);
      };
      raf = requestAnimationFrame(pin);
    } else {
      window.scrollTo(0, 0);
    }

    // Simulate a delay for loading
    const delay = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Cleanup the timeout to avoid potential memory leaks
    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(delay);
    };
  }, []);


  return (
    <div className="about-container">
      
      <header className="about-header">
        <h1>ABOUT</h1>
        <AboutConsole />
      </header>

      <section className="about-row-1">
        <Reveal as="section" className="introduction">
          <img src={getProtectedImageUrl(getProfileImage(), products)} loading="lazy" alt="selfportrait"/>
          <section className="intro-text">
            <section className="rect-container">
              <section className="rect-1"></section>
              <section className="rect-2"></section>
            </section>
            <h2>THE WORK</h2>
            <p>
              I'm Daniel Nelson. DevOps engineer by profession, artist and builder by nature. METTAIRE is where those two collapse into one practice.
            </p>
            <p>
              At Salesforce I build and secure infrastructure in FedRAMP environments: automating CI/CD and patching pipelines, leading security incident response, keeping critical systems reliable at scale. That same intent shaped projects like Second Wind and CareerSpring's Interest Finder, software built to help people move through hard moments with clarity. Full case studies live in the <Link to="/engineering" className="log-inline-link">engineering log</Link>.
            </p>
            <p>
              The influences don't shift with the medium. Dostoevsky, Camus, Musashi. Individualism, transformation, the human condition. Cloud infrastructure or a multimedia painting, the craft is the same: merge technology with fine art, put the result out to be encountered on its own terms.
            </p>
          </section>
        </Reveal>
        <Reveal as="section" className="about-carousel-row">
          <ProjectCarousel products={products} getProtectedImageUrl={getProtectedImageUrl} />
        </Reveal>

        <Reveal as="section" className="trajectory">
          <section className="rect-container">
            <section className="rect-1"></section>
            <section className="rect-2"></section>
          </section>
          <h2>THE TRAJECTORY</h2>
          <p>
            On the engineering side, I'm looking for what's next. Roles where I can go deeper on platform security, resilience, and the tooling that keeps critical systems standing. Teams that treat reliability and incident response as craft rather than checkbox work. Problems where the stakes are real and the solutions ship.
          </p>
          <p>
            On the creative side, the work keeps compounding. <i>Heart in Chrome</i> is mid-production; new tattoo work, paintings, and browser games ship in between infrastructure shifts. Collaborators, curators, and clients: the door is open.
          </p>
          <div className="trajectory-projects upcoming-projects-column-2">
            <Reveal className="image-with-description" id="chrome-container">
              <Link to={chromeId ? `/gallery/${chromeId}` : '/gallery'} className="upcoming-project-link" onClick={() => sessionStorage.setItem('aboutReturn', 'projects')}>
                <video autoPlay muted width="auto" loop playsInline controls={false}>
                  <source src={getProtectedVideoUrl('HCteaser.mp4', products)} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className='chrome-text'>
                  <h3>Heart in Chrome</h3>
                  <p>A psychological neo-noir thriller unfolds in <i>Heart in Chrome</i>, a graphic novel currently in the throes of creation, exploring the nexus of art, technology, identity, and power.</p>
                </div>
              </Link>
            </Reveal>

            <Reveal className="image-with-description" id="blacksite">
              <Link to="/programs/blacksite" className="upcoming-project-link" onClick={() => sessionStorage.setItem('aboutReturn', 'projects')}>
                <div className="tattoo-text">
                  <h3>BLACKSITE</h3>
                  <p>A browser-game arcade behind a secure-access terminal. New games added over time. Currently DATA SPIKE and NULL_ESCAPE, built in React and canvas.</p>
                </div>
                <div className="tattoo-mini-gallery blacksite-mini-gallery">
                  <div className='image-column-1'>
                    <img src="/api/media/image/nullescape.webp" alt="NULL_ESCAPE game" />
                  </div>
                  <div className='image-column-2'>
                    <img src="/api/media/image/dataspike.webp" alt="DATA SPIKE game" />
                  </div>
                </div>
              </Link>
            </Reveal>

            <Reveal className="image-with-description" id="tats">
              <Link to={tattooId ? `/gallery/${tattooId}` : '/gallery'} className="upcoming-project-link" onClick={() => sessionStorage.setItem('aboutReturn', 'projects')}>
                <div className="tattoo-mini-gallery">
                  <div className='image-column-1'>
                    <img src={getProtectedImageUrl(tattooImages[0], products)} alt={"tat-0"} />
                  </div>
                  <div className='image-column-2'>
                    <img src={getProtectedImageUrl(tattooImages[3], products)} alt={"tat-3"} />
                  </div>
                </div>
                <div className="tattoo-text">
                  <h3>Tattooing</h3>
                  <p>Tattooing is the next surface. Same interests, different medium: identity, transformation, permanence rendered in skin instead of pixels or paint.</p>
                </div>
              </Link>
            </Reveal>
          </div>
        </Reveal>
      </section>

      <Reveal as="section" className="contact-container">
        <div className='contact-information-container'>
          <section className="rect-container">
              <section className="rect-1"></section>
              <section className="rect-2"></section>
          </section>
          <h2>Contact</h2>
          
          <div className="social-media-row">
            <div className="social-media-links">
                <a href="https://www.linkedin.com/in/dnelson777" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faLinkedin} size="2x" />
                </a>
                <a href="https://github.com/danielnelson37" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faGithub} size="2x" />
                </a>
                <a href="https://medium.com/@lukannelson" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faMedium} size="2x" />
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
      </Reveal>
    </div>
  );
};

export default AboutPage;
