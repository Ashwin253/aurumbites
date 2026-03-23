"use client";

import { useEffect, useState } from "react";

function isIosDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export default function AddToHomeScreenButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    setIsIos(isIosDevice());
    setIsStandalone(isStandaloneMode());

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setShowHelp(false);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isStandalone) {
    return null;
  }

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice.catch(() => null);
      setInstallPrompt(null);
      return;
    }

    setShowHelp((current) => !current);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className="fixed bottom-4 left-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 bg-white text-xl font-semibold text-neutral-950 shadow-[0_18px_45px_rgba(23,23,23,0.18)] transition hover:scale-[1.03] sm:hidden"
        aria-label="Add to home screen"
      >
        +
      </button>

      {showHelp ? (
        <div className="fixed bottom-20 left-4 z-40 max-w-[16rem] rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700 shadow-[0_18px_45px_rgba(23,23,23,0.18)] sm:hidden">
          <p className="font-semibold text-neutral-950">Add to Homescreen</p>
          <p className="mt-2 leading-6">
            {isIos
              ? 'Tap Share in Safari, then choose "Add to Home Screen".'
              : "If the install prompt does not open, use your browser menu and choose Install app or Add to Home screen."}
          </p>
        </div>
      ) : null}
    </>
  );
}
