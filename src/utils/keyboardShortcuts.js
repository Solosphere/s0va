// Keyboard shortcuts for accessibility features
export const initializeKeyboardShortcuts = () => {
  const handleKeyPress = (event) => {
    // Only handle shortcuts when not typing in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key.toLowerCase();
    
    switch (key) {
      case 'd':
        toggleDarkMode();
        break;
      case 'h':
        toggleHighContrast();
        break;
      case 'm':
        toggleReducedMotion();
        break;
      case 'l':
        toggleLargeText();
        break;
      case '?':
        toggleSettings();
        break;
      default:
        break;
    }
  };

  document.addEventListener('keydown', handleKeyPress);
  
  return () => {
    document.removeEventListener('keydown', handleKeyPress);
  };
};

const toggleDarkMode = () => {
  const currentSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
  const newDarkMode = !currentSettings.isDarkMode;
  
  const settings = {
    ...currentSettings,
    isDarkMode: newDarkMode
  };
  
  localStorage.setItem('userSettings', JSON.stringify(settings));
  
  if (newDarkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  
  // Trigger a custom event to update the Settings component
  window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
};

const toggleHighContrast = () => {
  const currentSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
  const newHighContrast = !currentSettings.highContrast;
  
  const settings = {
    ...currentSettings,
    highContrast: newHighContrast
  };
  
  localStorage.setItem('userSettings', JSON.stringify(settings));
  
  if (newHighContrast) {
    document.documentElement.setAttribute('data-contrast', 'high');
  } else {
    document.documentElement.removeAttribute('data-contrast');
  }
  
  window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
};

const toggleReducedMotion = () => {
  const currentSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
  const newReducedMotion = !currentSettings.reducedMotion;
  
  const settings = {
    ...currentSettings,
    reducedMotion: newReducedMotion
  };
  
  localStorage.setItem('userSettings', JSON.stringify(settings));
  
  if (newReducedMotion) {
    document.documentElement.setAttribute('data-motion', 'reduced');
  } else {
    document.documentElement.removeAttribute('data-motion');
  }
  
  window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
};

const toggleLargeText = () => {
  const currentSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
  const newLargeText = !currentSettings.largeText;
  
  const settings = {
    ...currentSettings,
    largeText: newLargeText
  };
  
  localStorage.setItem('userSettings', JSON.stringify(settings));
  
  if (newLargeText) {
    document.documentElement.setAttribute('data-text', 'large');
  } else {
    document.documentElement.removeAttribute('data-text');
  }
  
  window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
};

const toggleSettings = () => {
  // Dispatch event to toggle settings modal
  window.dispatchEvent(new CustomEvent('toggleSettings'));
}; 