import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'; // Change to free-solid-svg-icons for arrow up
import { faInstagram, faGithub, faMedium, faLinkedin} from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
      // Show or hide the back-to-top button based on scroll position
      const handleScroll = () => {
        setShowButton(window.scrollY > 300);
      };
  
      window.addEventListener('scroll', handleScroll);
  
      // Remove the event listener when the component unmounts
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);
  
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth', // Add smooth scrolling behavior
      });
    };

    return (
        <footer className="footer">
            <div className="footer-row">
                <div className="logo-information">
                    <h2><NavLink to='/'>MT8</NavLink></h2>
                </div>

                <div className="navigation-links">
                    <ul>
                        <li><NavLink to='/about'>About</NavLink></li>
                        <li><NavLink to='/cache'>Cache</NavLink></li>
                        <li><NavLink to='/terms' onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Terms & Conditions</NavLink></li>
                        
                    {/* Add more links as needed */}
                    </ul>
                </div>

                <div className="back-to-top-button" onClick={scrollToTop}>
                    <h4>Back to Top</h4>
                    
                </div>
            </div>

            <div className="footer-row">
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

            <div className="footer-row">
                <div className="copyright-information">
                    <p>&copy; {currentYear} MT8</p>
                </div>
            </div>

        </footer>
    );
};

export default Footer; 