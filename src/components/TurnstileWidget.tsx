import { useEffect } from 'react';

declare global {
  interface Window {
    onArchiveTurnstile?: (token: string) => void;
    onArchiveTurnstileExpired?: () => void;
  }
}

interface Props {
  siteKey: string;
  onToken: (token: string) => void;
}

export default function TurnstileWidget({ siteKey, onToken }: Props) {
  useEffect(() => {
    window.onArchiveTurnstile = onToken;
    window.onArchiveTurnstileExpired = () => onToken('');
    if (!document.querySelector('script[data-archive-turnstile]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.dataset.archiveTurnstile = 'true';
      document.head.appendChild(script);
    }
    return () => {
      delete window.onArchiveTurnstile;
      delete window.onArchiveTurnstileExpired;
    };
  }, [onToken]);

  if (!siteKey) {
    return <p className="turnstile-note mono">Verification is enabled after deployment configuration.</p>;
  }

  return <div
    className="cf-turnstile"
    data-sitekey={siteKey}
    data-theme="auto"
    data-callback="onArchiveTurnstile"
    data-expired-callback="onArchiveTurnstileExpired"
  />;
}
