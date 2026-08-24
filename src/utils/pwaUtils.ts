// PWA & iOS Detection Utilities

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  // iOS Safari Standalone Check
  const nav = window.navigator as any;
  if (nav && nav.standalone === true) {
    return true;
  }

  // Standard PWA Standalone Display Mode Check
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Minimal-UI or Window Controls Overlay
  if (window.matchMedia && (window.matchMedia('(display-mode: minimal-ui)').matches || window.matchMedia('(display-mode: window-controls-overlay)').matches)) {
    return true;
  }

  return false;
}

export function isIOS(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isAppleDevice = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  return isAppleDevice || isIPadOS;
}

export function isSafari(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
}

export function shouldShowInstallPrompt(): boolean {
  if (isStandalone()) {
    return false; // Already installed as PWA
  }

  // Check if user dismissed recently
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const dismissedAt = window.localStorage.getItem('commonplace_install_dismissed_at');
      if (dismissedAt) {
        const timeDiff = Date.now() - parseInt(dismissedAt, 10);
        // Don't show again for 3 days if dismissed
        if (timeDiff < 3 * 24 * 60 * 60 * 1000) {
          return false;
        }
      }
    }
  } catch (e) {}

  return true;
}

export function markInstallPromptDismissed(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('commonplace_install_dismissed_at', Date.now().toString());
    }
  } catch (e) {}
}
