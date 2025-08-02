import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons'; 
import { useState, useEffect, useRef } from 'react';
import Settings from './Settings';

export default function SiteHeadingAndNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && 
          menuRef.current && 
          !menuRef.current.contains(event.target) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="nav-header">
      <nav>
        <NavLink to='/' id="logo" onClick={closeMenu}>S<span className="special-char">⍉</span>VA </NavLink> 
        <div className="right">
          <button className="dropdown-btn" onClick={toggleMenu} ref={buttonRef}>
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
          <ul className={`main-menu ${isMenuOpen ? 'show' : ''}`} ref={menuRef}>
            <li><NavLink to='/' onClick={closeMenu}>Home</NavLink></li>
            <li><NavLink to='/about' onClick={closeMenu}>About</NavLink></li>
            <li><NavLink to='/cache' onClick={closeMenu}>Cache</NavLink></li>
            <li><NavLink to='/saved' onClick={closeMenu}>Saved</NavLink></li>
            <li><Settings /></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
