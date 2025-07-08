/**
 * @file index.tsx
 * This is the main entry point for the UrbanSenseAI React application.
 * It handles two primary tasks:
 * 1. Registers the service worker to enable Progressive Web App (PWA) features like offline access.
 * 2. Renders the main <App /> component into the DOM.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// --- Service Worker Registration for PWA ---
// The service worker runs in the background, enabling features like caching for offline use.
if ('serviceWorker' in navigator) {
  // We wait for the 'load' event to ensure the page is fully loaded before registering the SW.
  // This prevents the SW registration from delaying the initial page render.
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        // A successful registration is logged to the console for debugging purposes.
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        // If registration fails, we log the error to help diagnose the issue.
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// --- React Application Mounting ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  // This is a critical check. If the 'root' div is missing in index.html, the app cannot render.
  throw new Error("Could not find root element to mount to");
}

// Create a React root and render the App component.
// React.StrictMode is used to highlight potential problems in an application during development.
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
