'use client';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function TickerTape() {
  const { theme } = useTheme();

  useEffect(() => {
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
  }, [theme]);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 py-2 px-4">
      <div id="ticker-tape-widget" className="overflow-hidden" />
    </div>
  );
}
