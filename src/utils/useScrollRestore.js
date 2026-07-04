import { useEffect } from 'react';
import { getLastPath } from './navTracker';

/**
 * Scroll behavior for gallery-style pages: when the user returns from a detail
 * page (a /gallery/:id piece or a /engineering/:id case study), restore where they left
 * off; on any other entry (nav link, direct load), start at the top. The
 * position is saved on leave.
 *
 * @param {string} storageKey - sessionStorage key (unique per page)
 */
export function useGalleryScrollRestore(storageKey) {
  useEffect(() => {
    const cameFromDetail = /^\/(gallery|engineering)\//.test(getLastPath());
    const saved = parseInt(sessionStorage.getItem(storageKey) || '0', 10);

    if (cameFromDetail && saved > 0) {
      // Lazy masonry images grow the page as we approach the target, so nudge
      // toward the saved position until it sticks (or we give up after ~1s).
      let tries = 0;
      const restore = () => {
        window.scrollTo(0, saved);
        tries += 1;
        if (Math.abs(window.scrollY - saved) > 2 && tries < 60) {
          requestAnimationFrame(restore);
        }
      };
      requestAnimationFrame(restore);
    } else {
      window.scrollTo(0, 0);
    }

    return () => {
      sessionStorage.setItem(storageKey, String(window.scrollY));
    };
  }, [storageKey]);
}
