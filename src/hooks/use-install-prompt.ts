'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const VISIT_COUNT_KEY = 'loantrack-visit-count';
const MIN_VISITS = 2;

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    // Track visit count
    const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) ?? '0', 10) + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(count));

    if (count < MIN_VISITS) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanShow(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setCanShow(false);
    setDeferredPrompt(null);
  }, []);

  return { canShow, promptInstall, dismiss };
}
