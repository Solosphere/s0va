import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import GalleryPage from './pages/Gallery';
import AboutPage from './pages/About';
import TermsAndConditions from './pages/TermsAndConditions';
import SiteHeadingAndNav from './components/SiteHeadingAndNav';
import Footer from './components/Footer';
import NotFoundPage from './pages/NotFound';
import Loading from './components/Loading';
import GalleryItemDetail from './components/GalleryItemDetails';
import SavedArtworks from './pages/SavedArtworks';
import { initializeKeyboardShortcuts } from './utils/keyboardShortcuts';
import { NavigationProvider } from './context/NavigationContext';

export default function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Simulate a delay for loading
    setLoading(true);
    const delay = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Cleanup the timeout to avoid potential memory leaks
    return () => clearTimeout(delay);
  }, [location.pathname]);

  useEffect(() => {
    // Initialize keyboard shortcuts
    const cleanup = initializeKeyboardShortcuts();
    
    // Load saved settings on app start
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      
      if (settings.isDarkMode !== undefined ? settings.isDarkMode : true) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
      
      if (settings.highContrast) {
        document.documentElement.setAttribute('data-contrast', 'high');
      }
      
      if (settings.reducedMotion) {
        document.documentElement.setAttribute('data-motion', 'reduced');
      }
      
      if (settings.largeText) {
        document.documentElement.setAttribute('data-text', 'large');
      }
    } else {
      // Set dark mode as default when no settings are saved
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    return cleanup;
  }, []);

  return (
    <NavigationProvider>
      <SiteHeadingAndNav />
      <main>
        {loading ? (
          <Loading />
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/cache" element={<GalleryPage />} />
            <Route path="/cache/:id" element={<GalleryItemDetail />} />
            <Route path="/saved" element={<SavedArtworks />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        )}
      </main>
      <Footer />
    </NavigationProvider>
  );
}
