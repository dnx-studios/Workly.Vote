import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { setBaseUrl } from '@workspace/api-client-react';

// When VITE_API_URL is set at build time (e.g. GitHub Pages static build),
// point the API client to that external server.
// Falls back to relative URLs (same-origin) when running on Replit with a
// co-located API server.
if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL as string);
}

// Restore full path after GitHub Pages SPA 404 redirect.
// The 404.html encodes the original path into the query string; this script
// decodes it back before React mounts so wouter sees the correct route.
(function restoreGhPagesPath() {
  const search = window.location.search;
  if (search.startsWith('?/')) {
    const decoded = search.slice(1).split('&')[0];
    const query = search.slice(1).split('&').slice(1).join('&');
    window.history.replaceState(
      null,
      '',
      decoded + (query ? '?' + query : '') + window.location.hash
    );
  }
})();

createRoot(document.getElementById('root')!).render(<App />);
