'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function TickerTape() {
  const { theme } = useTheme();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('ticker-enabled');
      if (saved === 'true') setEnabled(true);
    } catch {
      setEnabled(false);
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('ticker-enabled', enabled ? 'true' : 'false');
    } catch {}
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      const container = document.getElementById('ticker-tape-widget');
      if (container) container.innerHTML = '';
      return;
    }

    const loadWidget = () => {
      const container = document.getElementById('ticker-tape-widget');
      if (container) container.innerHTML = '';

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
      script.async = true;

      const colorTheme = theme === 'dark' ? 'dark' : 'light';

      script.innerHTML = JSON.stringify({
        symbols: [
          { proName: 'FOREXCOM:EURUSD', title: 'EUR/USD' },
          { proName: 'FOREXCOM:USDKZT', title: 'USD/KZT' },
          { proName: 'MOEX:GAZP', title: 'Газпром' },
          { proName: 'BINANCE:BTCUSDT', title: 'BTC/USDT' },
        ],
        showSymbolLogo: true,
        colorTheme,
        isTransparent: false,
        displayMode: 'adaptive',
        locale: 'ru',
      });

      container?.appendChild(script);
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadWidget, { timeout: 2000 });
    } else {
      setTimeout(loadWidget, 1200);
    }

    const onPageHide = () => {
      const container = document.getElementById('ticker-tape-widget');
      if (container) container.innerHTML = '';
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, [theme, enabled]);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 py-2 px-4">
      {!enabled && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-gray-600 dark:text-gray-300">
            Котировки загружаются по запросу
          </span>
          <button
            type="button"
            onClick={() => setEnabled(true)}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Показать котировки
          </button>
        </div>
      )}
      <div id="ticker-tape-widget" className="overflow-hidden" />
    </div>
  );
}
