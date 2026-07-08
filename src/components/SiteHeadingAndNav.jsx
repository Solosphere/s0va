import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useRef } from 'react';
import Settings from './Settings';

const NAV_ITEMS = [
  { to: '/about', label: 'About' },
  { to: '/engineering', label: 'Engineering' },
  { to: '/gallery', label: 'Gallery' },
];

export default function SiteHeadingAndNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  // Close when clicking outside (no-op for the full-screen mobile menu, but keeps
  // the desktop behavior; harmless otherwise).
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen &&
          menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Esc to close + lock background scroll while the full-screen menu is open.
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <header className="nav-header">
      <nav>
        <NavLink to='/' id="logo" onClick={closeMenu}>METTAIRE </NavLink>
        <div className="right">
          <div className="mobile-controls">
            <Settings />
            <button
              className="dropdown-btn"
              onClick={toggleMenu}
              ref={buttonRef}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} size="lg" />
            </button>
          </div>
          <ul className={`main-menu ${isMenuOpen ? 'show' : ''}`} ref={menuRef}>
            {NAV_ITEMS.map((item, i) => (
              <li key={item.to}>
                <NavLink to={item.to} onClick={closeMenu}>
                  <span className="menu-idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="desktop-settings"><Settings /></li>
            <li className="menu-terminal-footer" aria-hidden="true">root@wound.os ~ %</li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
