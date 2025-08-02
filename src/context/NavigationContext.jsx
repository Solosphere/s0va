import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [navigationHistory, setNavigationHistory] = useState([]);
  const location = useLocation();

  // Track navigation history
  useEffect(() => {
    setNavigationHistory(prev => {
      // Don't add duplicate consecutive entries
      if (prev.length === 0 || prev[prev.length - 1] !== location.pathname) {
        return [...prev, location.pathname];
      }
      return prev;
    });
  }, [location.pathname]);

  // Get the previous page
  const getPreviousPage = () => {
    if (navigationHistory.length < 2) {
      return '/'; // Default to home if no history
    }
    return navigationHistory[navigationHistory.length - 2];
  };

  // Get the current page
  const getCurrentPage = () => {
    return navigationHistory.length > 0 ? navigationHistory[navigationHistory.length - 1] : '/';
  };

  // Check if user came from a specific page
  const cameFrom = (pagePath) => {
    if (navigationHistory.length < 2) return false;
    return navigationHistory[navigationHistory.length - 2] === pagePath;
  };

  // Get page title for display
  const getPageTitle = (path) => {
    const pageTitles = {
      '/': 'Home',
      '/about': 'About',
      '/cache': 'Gallery',
      '/saved': 'Saved Artworks',
      '/terms': 'Terms and Conditions'
    };
    return pageTitles[path] || 'Page';
  };

  const value = {
    navigationHistory,
    getPreviousPage,
    getCurrentPage,
    cameFrom,
    getPageTitle
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}; 