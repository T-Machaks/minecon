import { useState, useEffect } from 'react';

const SEEN_KEY = 'pwa-prompt-seen';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [seen, setSeen] = useState(() => localStorage.getItem(SEEN_KEY) === '1');

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
    return outcome === 'accepted';
  };

  const markSeen = () => {
    localStorage.setItem(SEEN_KEY, '1');
    setSeen(true);
  };

  // Show the popup if not already installed and not yet seen
  const showPopup = !isStandalone && !seen;

  // Show menu link as long as not running in standalone
  const showMenuLink = !isStandalone;

  const hasBrowserPrompt = !!deferredPrompt;

  return { showPopup, showMenuLink, isIOS, hasBrowserPrompt, promptInstall, markSeen };
}