import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSun, faMoon, faEye, faEyeSlash, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import Loading from './Loading';

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  // Flash the METTAIRE loading screen while a toggled change applies
  const [applying, setApplying] = useState(false);
  const applyTimer = useRef(null);

  const triggerLoad = () => {
    setApplying(true);
    clearTimeout(applyTimer.current);
    applyTimer.current = setTimeout(() => setApplying(false), 1000);
  };

  // Set a toggle's value and show the loading screen while it takes effect
  const updateSetting = (setter) => (e) => {
    setter(e.target.checked);
    triggerLoad();
  };

  useEffect(() => () => clearTimeout(applyTimer.current), []);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setIsDarkMode(settings.isDarkMode !== undefined ? settings.isDarkMode : true);
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
      setIsDarkMode(settings.isDarkMode !== undefined ? settings.isDarkMode : true);
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

    // Dispatch settings changed event to notify other components
    window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
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

  // Esc to close + lock background scroll while the full-screen panel is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
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

      {/* Settings Modal — always rendered so it can wipe open and closed */}
      <div className={`settings-overlay ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
          <button
            className="settings-close"
            onClick={closeSettings}
            aria-label="Close settings"
          >
            ×
          </button>
          <div className="settings-container">
            <div className="settings-header">
              <h2>Settings</h2>
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
                      onChange={updateSetting(setIsDarkMode)}
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
                      onChange={updateSetting(setHighContrast)}
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
                      onChange={updateSetting(setReducedMotion)}
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
                      onChange={updateSetting(setLargeText)}
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
                      onChange={updateSetting(setSoundEnabled)}
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

      {/* METTAIRE loading screen while a toggled change applies */}
      {applying && (
        <div className="settings-loading-overlay">
          <Loading />
        </div>
      )}
    </>
  );
}