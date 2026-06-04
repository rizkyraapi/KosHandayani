type SnapCallback = {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
};

declare global {
  interface Window {
    snap?: {
      pay: (token: string, callbacks?: SnapCallback) => void;
    };
  }
}

let snapScriptPromise: Promise<void> | null = null;

export function loadMidtransSnap() {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.snap) {
    return Promise.resolve();
  }

  if (!snapScriptPromise) {
    snapScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-midtrans-snap="true"]');

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Gagal memuat Midtrans Snap.')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.async = true;
      script.dataset.midtransSnap = 'true';

      const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
      if (clientKey) {
        script.dataset.clientKey = clientKey;
      }

      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap.'));
      document.body.appendChild(script);
    });
  }

  return snapScriptPromise;
}

export async function payWithMidtransSnap(token: string, callbacks: SnapCallback) {
  await loadMidtransSnap();

  if (!window.snap) {
    throw new Error('Midtrans Snap belum tersedia.');
  }

  window.snap.pay(token, callbacks);
}
