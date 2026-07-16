import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import GalleryPage from './pages/Gallery';
import AboutPage from './pages/About';
import TermsAndConditions from './pages/TermsAndConditions';
import BlackSite from './pages/BlackSite';
import ProgramsAccess from './pages/ProgramsAccess';
import EngineeringLog from './pages/EngineeringLog';
import EngineeringLogDetail from './pages/EngineeringLogDetail';
import WoundHUD from './pages/WoundHUD';
import SiteHeadingAndNav from './components/SiteHeadingAndNav';
import Footer from './components/Footer';
import NotFoundPage from './pages/NotFound';
import Loading from './components/Loading';
import GalleryItemDetail from './components/GalleryItemDetails';
import { initializeKeyboardShortcuts } from './utils/keyboardShortcuts';
import { NavigationProvider } from './context/NavigationContext';
import { nextFrame, waitForVisibleMedia } from './utils/mediaReady';
import { recordPath } from './utils/navTracker';

// Hold the loading overlay until the new route is genuinely ready: first wait
// out any in-content loader the page shows while it fetches data (it renders
// the branded loader, detected via .loading-wordmark), then wait for the
// visible media. Bounded by maxTimeout so it can never hang.
function waitForPageReady(maxTimeout) {
  return new Promise((resolve) => {
    const root = document.querySelector('main');
    if (!root) return resolve();
    const deadline = Date.now() + maxTimeout;

    const poll = () => {
      const pageStillFetching = root.querySelector('.loading-wordmark');
      if (pageStillFetching && Date.now() < deadline) {
        window.setTimeout(poll, 150);
      } else {
        waitForVisibleMedia(root, deadline - Date.now()).then(resolve);
      }
    };
    poll();
  });
}

// Permanent client-side redirect for the old section URLs (/cache → /gallery,
// /log → /engineering), preserving any sub-path and query so bookmarks and
// inbound links keep working after the rename.
function LegacyRedirect({ from, to }) {
  const location = useLocation();
  const dest = location.pathname.replace(from, to) + location.search;
  return <Navigate to={dest} replace />;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Show the loading screen on every route change and hold it until the new
  // page's visible media has finished loading (bounded by a min + max time).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const start = Date.now();
    const MIN_MS = 500; // avoid a jarring flash on fast loads
    const MAX_MS = 8000; // hard cap so we never hang forever

    (async () => {
      // Let the new route paint before we inspect its media
      await nextFrame();
      await nextFrame();
      await waitForPageReady(MAX_MS - (Date.now() - start));
      if (cancelled) return;
      const wait = Math.max(0, MIN_MS - (Date.now() - start));
      window.setTimeout(() => {
        if (!cancelled) setLoading(false);
      }, wait);
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  // Record the route AFTER page effects run (App is an ancestor), so a page
  // mounting can read where the user came from via getLastPath().
  useEffect(() => {
    recordPath(location.pathname);
  }, [location.pathname]);

  // iOS Safari restores closed tabs from bfcache, which freezes React state
  // exactly as it was — including a mid-navigation `loading: true`. That
  // leaves the black loading overlay pinned over the page. Clear it as soon
  // as the tab becomes visible or is restored, and force a fresh re-check
  // so the media-ready path can run once more if anything's still pending.
  useEffect(() => {
    const clearOverlay = () => setLoading(false);

    const onPageShow = (event) => {
      if (event.persisted) clearOverlay();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') clearOverlay();
    };

    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

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
        {/* Always mounted so the new route's media starts loading while the
            loading overlay is up — then the overlay lifts onto real content. */}
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/gallery/:id" element={<GalleryItemDetail />} />
          <Route path="/engineering" element={<EngineeringLog />} />
          <Route path="/engineering/:id" element={<EngineeringLogDetail />} />
          {/* Redirects from the old section URLs */}
          <Route path="/cache/*" element={<LegacyRedirect from="/cache" to="/gallery" />} />
          <Route path="/log/*" element={<LegacyRedirect from="/log" to="/engineering" />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/programs" element={<ProgramsAccess />} />
          <Route path="/programs/blacksite" element={<BlackSite />} />
          <Route path="/wound" element={<WoundHUD />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <AnimatePresence>
        {loading && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <Loading />
          </motion.div>
        )}
      </AnimatePresence>
    </NavigationProvider>
  );
}
