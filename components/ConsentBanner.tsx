'use client';

import { useEffect, useState } from 'react';

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('analytics-consent');
      if (stored !== 'granted' && stored !== 'denied') {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const setConsent = (value: 'granted' | 'denied') => {
    try {
      localStorage.setItem('analytics-consent', value);
      window.dispatchEvent(new Event('analytics-consent'));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-6 z-50">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3">
        <div className="text-sm text-gray-700 dark:text-gray-200">
          Мы используем аналитические cookies (Yandex/Google) для улучшения сайта.
        </div>
        <div className="flex gap-2 md:ml-auto">
          <button
            type="button"
            onClick={() => setConsent('denied')}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Отклонить
          </button>
          <button
            type="button"
            onClick={() => setConsent('granted')}
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}
