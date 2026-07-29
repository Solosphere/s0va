import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faMedium, faLinkedin} from '@fortawesome/free-brands-svg-icons';
import { faAnglesUp } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    // Two independent signals collapsed into one render:
    //  - `hasScrolled`: past 80% of viewport height → button is worth showing.
    //  - `footerVisible`: footer is on-screen → button docks into the row.
    // Combined behavior: hidden near the top, floating in the middle of the
    // page, docked (in-flow) once the footer has scrolled into view.
    const [hasScrolled, setHasScrolled] = useState(false);
    const [footerVisible, setFooterVisible] = useState(false);
    const footerRef = useRef(null);
    const dockRef = useRef(null);

    useEffect(() => {
      const handleScroll = () => {
        setHasScrolled(window.scrollY > window.innerHeight * 0.8);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Track whether the docked slot is in the viewport — that's the trigger
    // for the button to drop out of fixed positioning and back into flow.
    // Watching the slot itself (a small element inside the footer) is more
    // accurate than watching the whole footer, which may extend past the fold.
    useEffect(() => {
      const el = dockRef.current;
      if (!el || typeof IntersectionObserver === 'undefined') return undefined;
      const observer = new IntersectionObserver(
        ([entry]) => setFooterVisible(entry.isIntersecting),
        { rootMargin: '0px 0px -20px 0px' }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };

    // Docked once the footer slot is on-screen; otherwise floating (only if
    // the visitor has actually scrolled far enough for the button to matter).
    const docked = footerVisible;
    const visible = docked || hasScrolled;

    return (
        <footer className="footer" ref={footerRef}>
            <div className="footer-row">
                <div className="logo-information">
                    <h2><NavLink to='/'>METTAIRE</NavLink></h2>
                </div>

                <div className="navigation-links">
                    <ul>
                        <li><NavLink to='/about'>About</NavLink></li>
                        <li><NavLink to='/engineering'>Engineering</NavLink></li>
                        <li><NavLink to='/gallery'>Gallery</NavLink></li>
                        <li><NavLink to='/terms' onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Terms &amp; Conditions</NavLink></li>
                    {/* Add more links as needed */}
                    </ul>
                </div>

                {/* Dock slot — reserves the button's spot in the row even
                    while it's floating so the layout doesn't jump when it
                    docks. Also serves as the IntersectionObserver target that
                    decides docked vs floating: when the slot enters the
                    viewport, the button drops out of `position: fixed` and
                    back into flow. Button lives inside the slot at all times
                    so there's exactly one instance in the DOM. */}
                <span className="back-to-top-dock" ref={dockRef}>
                  <button
                    type="button"
                    className={
                      `back-to-top-button ` +
                      `${docked ? 'is-docked' : 'is-floating'} ` +
                      `${visible ? 'fade-in' : 'fade-out'}`
                    }
                    onClick={scrollToTop}
                    aria-label="Back to top"
                    title="Back to top"
                  >
                    <span className="btt-glyph" aria-hidden="true">
                      <span className="btt-bracket btt-bracket--tl" />
                      <span className="btt-bracket btt-bracket--tr" />
                      <FontAwesomeIcon icon={faAnglesUp} />
                      <span className="btt-bracket btt-bracket--bl" />
                      <span className="btt-bracket btt-bracket--br" />
                    </span>
                  </button>
                </span>
            </div>

            <div className="footer-row">
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

            <div className="footer-row">
                <div className="copyright-information">
                    <p>
                        &copy; {currentYear} METTAIRE{' '}
                        <NavLink to="/programs" className="blacksite-trigger" aria-label="Restricted access" title="root@mettaire.os">▮</NavLink>
                    </p>
                </div>
            </div>

        </footer>
    );
};

export default Footer; 