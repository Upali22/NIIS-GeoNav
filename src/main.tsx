import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installCampusPersistence } from './services/campusPersistence';

// Keep admin CMS changes persistent across refresh/logout on the demo browser.
installCampusPersistence();

// Register PWA service worker
if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(<App />);
