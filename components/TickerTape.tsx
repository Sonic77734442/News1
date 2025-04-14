'use client';
import { useEffect } from 'react';

export default function TickerTape() {
  useEffect(() => {
    const container = document.getElementById('ticker-tape-widget');
    
    // 🧹 Удаляем старые виджеты перед добавлением нового
    if (container) {
      container.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'FOREXCOM:EURUSD', title: 'EUR/USD' },
        { proName: 'FOREXCOM:USDKZT', title: 'USD/KZT' },
        { proName: 'MOEX:GAZP', title: 'Газпром' },
        { proName: 'BINANCE:BTCUSDT', title: 'BTC/USDT' },
      ],
      showSymbolLogo: true,
      colorTheme: 'light',
      isTransparent: false,
      displayMode: 'adaptive',
      locale: 'ru',
    });

    container?.appendChild(script);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 py-2 px-4">
      <div id="ticker-tape-widget" className="overflow-hidden" />
    </div>
  );
}
