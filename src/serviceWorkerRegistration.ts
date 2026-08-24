// Service Worker Registration for iOS & Web PWAs

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] ServiceWorker registered with scope:', registration.scope);

          // Check for service worker updates periodically
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New content is available; please refresh.');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('[PWA] ServiceWorker registration failed:', error);
        });
    });
  }
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      return await navigator.serviceWorker.ready;
    } catch (e) {
      return null;
    }
  }
  return null;
}
