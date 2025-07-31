import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSun, faMoon, faEye, faEyeSlash, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setIsDarkMode(settings.isDarkMode || false);
      setHighContrast(settings.highContrast || false);
      setReducedMotion(settings.reducedMotion || false);
      setLargeText(settings.largeText || false);
      setSoundEnabled(settings.soundEnabled !== false);
    }
  }, []);

  // Listen for external settings changes (from keyboard shortcuts)
  useEffect(() => {
    const handleSettingsChanged = (event) => {
      const settings = event.detail;
      setIsDarkMode(settings.isDarkMode || false);
      setHighContrast(settings.highContrast || false);
      setReducedMotion(settings.reducedMotion || false);
      setLargeText(settings.largeText || false);
      setSoundEnabled(settings.soundEnabled !== false);
    };

    const handleToggleSettings = () => {
      setIsOpen(!isOpen);
    };

    window.addEventListener('settingsChanged', handleSettingsChanged);
    window.addEventListener('toggleSettings', handleToggleSettings);

    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChanged);
      window.removeEventListener('toggleSettings', handleToggleSettings);
    };
  }, [isOpen]);

  // Apply settings to document
  useEffect(() => {
    const settings = {
      isDarkMode,
      highContrast,
      reducedMotion,
      largeText,
      soundEnabled
    };
    
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Apply dark mode
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Apply high contrast
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
    
    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.setAttribute('data-motion', 'reduced');
    } else {
      document.documentElement.removeAttribute('data-motion');
    }
    
    // Apply large text
    if (largeText) {
      document.documentElement.setAttribute('data-text', 'large');
    } else {
      document.documentElement.removeAttribute('data-text');
    }
  }, [isDarkMode, highContrast, reducedMotion, largeText, soundEnabled]);

  const toggleSettings = () => {
    setIsOpen(!isOpen);
  };

  const closeSettings = () => {
    setIsOpen(false);
  };

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.settings-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* Settings Toggle Button */}
      <button 
        className="settings-toggle"
        onClick={toggleSettings}
        aria-label="Open settings"
      >
        <FontAwesomeIcon icon={faCog} size="lg" />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="settings-overlay">
          <div className="settings-container">
            <div className="settings-header">
              <h2>Settings</h2>
              <button 
                className="settings-close"
                onClick={closeSettings}
                aria-label="Close settings"
              >
                ×
              </button>
            </div>

            <div className="settings-content">
              {/* Theme Toggle */}
              <div className="setting-group">
                <h3>Theme</h3>
                <div className="setting-item">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={isDarkMode}
                      onChange={(e) => setIsDarkMode(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="setting-label">
                    <FontAwesomeIcon icon={isDarkMode ? faMoon : faSun} />
                    <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                </div>
              </div>

              {/* Accessibility Features */}
              <div className="setting-group">
                <h3>Accessibility</h3>
                
                {/* High Contrast */}
                <div className="setting-item">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={highContrast}
                      onChange={(e) => setHighContrast(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="setting-label">
                    <FontAwesomeIcon icon={highContrast ? faEye : faEyeSlash} />
                    <span>High Contrast</span>
                  </div>
                </div>

                {/* Reduced Motion */}
                <div className="setting-item">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={reducedMotion}
                      onChange={(e) => setReducedMotion(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="setting-label">
                    <span>Reduced Motion</span>
                  </div>
                </div>

                {/* Large Text */}
                <div className="setting-item">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={largeText}
                      onChange={(e) => setLargeText(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="setting-label">
                    <span>Large Text</span>
                  </div>
                </div>

                {/* Sound Toggle */}
                <div className="setting-item">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="setting-label">
                    <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} />
                    <span>Sound Effects</span>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="setting-group">
                <h3>Keyboard Shortcuts</h3>
                <div className="shortcuts-list">
                  <div className="shortcut-item">
                    <kbd>D</kbd>
                    <span>Toggle Dark Mode</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>H</kbd>
                    <span>Toggle High Contrast</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>M</kbd>
                    <span>Toggle Reduced Motion</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>L</kbd>
                    <span>Toggle Large Text</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>?</kbd>
                    <span>Show/Hide Settings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 