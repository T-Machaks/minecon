import { createContext, useContext, useEffect, useState } from 'react';

const SEEN_KEY = 'pwa-prompt-seen';

const PWAInstallContext = createContext(null);

export function PWAInstallProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [seen, setSeen] = useState(() => localStorage.getItem(SEEN_KEY) === '1');
  const [modalForced, setModalForced] = useState(false);

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
    setModalForced(false);
  };

  const openModal = () => setModalForced(true);

  const value = {
    showPopup: !isStandalone && (!seen || modalForced),
    showMenuLink: !isStandalone,
    isIOS,
    hasBrowserPrompt: !!deferredPrompt,
    promptInstall,
    markSeen,
    openModal,
  };

  return (
    <PWAInstallContext.Provider value={value}>
      {children}
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall() {
  return useContext(PWAInstallContext);
}