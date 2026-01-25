// components/Analytics.tsx
import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function Analytics() {
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState<'granted' | 'denied' | 'unknown'>('unknown');
  const enabled =
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false';

  useEffect(() => {
    if (!enabled) return;
    try {
      const stored = localStorage.getItem('analytics-consent');
      if (stored === 'granted' || stored === 'denied') {
        setConsent(stored);
      } else {
        setConsent('unknown');
      }
    } catch {
      setConsent('unknown');
    }

    const onStorage = () => {
      try {
        const stored = localStorage.getItem('analytics-consent');
        if (stored === 'granted' || stored === 'denied') {
          setConsent(stored);
        } else {
          setConsent('unknown');
        }
      } catch {}
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('analytics-consent', onStorage as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('analytics-consent', onStorage as EventListener);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || consent !== 'granted') return;
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => setReady(true), { timeout: 3000 });
    } else {
      setTimeout(() => setReady(true), 2000);
    }
  }, [enabled, consent]);

  if (!enabled || !ready || consent !== 'granted') return null;

  return (
    <>
      {/* Google Tag Manager */}
      <Script
        id="gtm-script"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id=GTM-WJH6SMCV'+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WJH6SMCV');
          `,
        }}
      />

      {/* Yandex Metrika */}
      <Script
        id="metrika"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) { return; }
              }
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],
              k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(101118405, "init", {
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:false
            });
          `,
        }}
      />

      {/* Facebook Pixel */}
      <Script
        id="1731508757443519"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s){
              if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '559436252743503');
            fbq('track', 'PageView');
          `,
        }}
      />
    </>
  );
}
