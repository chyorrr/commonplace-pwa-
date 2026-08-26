// PWA, Android & iOS Detection & Install Prompt Utilities

let deferredPrompt: any = null;
const installListeners = new Set<(canInstall: boolean) => void>();

// Initialize beforeinstallprompt listener immediately
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: any) => {
    // Prevent default mini-infobar so custom UI can handle it cleanly
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] beforeinstallprompt event captured');
    notifyInstallListeners(true);
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Application successfully installed');
    deferredPrompt = null;
    notifyInstallListeners(false);
    markInstallPromptDismissed();
  });
}

function notifyInstallListeners(canInstall: boolean) {
  installListeners.forEach((fn) => {
    try {
      fn(canInstall);
    } catch (e) {}
  });
}

export function subscribeInstallPrompt(callback: (canInstall: boolean) => void): () => void {
  installListeners.add(callback);
  callback(Boolean(deferredPrompt));
  return () => {
    installListeners.delete(callback);
  };
}

export function hasNativeInstallPrompt(): boolean {
  return Boolean(deferredPrompt);
}

export async function triggerNativeInstallPrompt(): Promise<{ outcome: 'accepted' | 'dismissed' | 'unavailable' }> {
  if (!deferredPrompt) {
    return { outcome: 'unavailable' };
  }

  try {
    // Show the native browser install prompt
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log('[PWA] User choice outcome:', choiceResult?.outcome);
    if (choiceResult?.outcome === 'accepted') {
      deferredPrompt = null;
      notifyInstallListeners(false);
    }
    return { outcome: choiceResult?.outcome || 'dismissed' };
  } catch (err) {
    console.warn('[PWA] Error triggering native install prompt:', err);
    return { outcome: 'unavailable' };
  }
}

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

  // Minimal-UI or Window Controls Overlay or Fullscreen
  if (
    window.matchMedia &&
    (window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches)
  ) {
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

export function isAndroid(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /Android/i.test(ua);
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
        // Don't show auto-prompt for 2 days if dismissed
        if (timeDiff < 2 * 24 * 60 * 60 * 1000) {
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
