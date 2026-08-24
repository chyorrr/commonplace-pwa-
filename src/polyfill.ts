// Polyfill for process and global in React Native Web / Vite environments
if (typeof window !== 'undefined') {
  (window as any).global = window;
  if (!(window as any).process) {
    (window as any).process = {
      env: { NODE_ENV: 'development' },
      nextTick: (fn: Function, ...args: any[]) => setTimeout(() => fn(...args), 0),
      platform: 'browser',
    };
  }
}

export {};
