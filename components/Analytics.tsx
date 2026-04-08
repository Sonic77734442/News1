// components/Analytics.tsx
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';

export default function Analytics() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState<'granted' | 'denied' | 'unknown'>('unknown');
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID || 'G-HRW58CMLB8';
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

  useEffect(() => {
    if (!enabled) return;
    try {
      (window as any).dataLayer = (window as any).dataLayer || [];
      const gtag = (...args: any[]) => {
        if (typeof (window as any).gtag === 'function') {
          (window as any).gtag(...args);
          return;
        }
        (window as any).dataLayer.push(args);
      };
      if (consent === 'granted') {
        gtag('consent', 'update', {
          ad_storage: 'granted',
          analytics_storage: 'granted',
        });
      } else if (consent === 'denied') {
        gtag('consent', 'update', {
          ad_storage: 'denied',
          analytics_storage: 'denied',
        });
      }
    } catch {}
  }, [enabled, consent]);

  useEffect(() => {
    if (!enabled || consent !== 'granted') return;
    const onRouteChangeComplete = (url: string) => {
      if (typeof (window as any).gtag !== 'function') return;
      (window as any).gtag('event', 'page_view', {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      });
    };
    router.events.on('routeChangeComplete', onRouteChangeComplete);
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete);
    };
  }, [enabled, consent, router.events]);

  if (!enabled) return null;

  return (
    <>
      <Script
        id="gtm-consent-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500
            });
          `,
        }}
      />

      {consent === 'granted' && (
        <>
          <Script id="ga4-lib" src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${ga4Id}', { send_page_view: true });
              `,
            }}
          />
        </>
      )}

      {/* Google Tag Manager */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
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
      {ready && consent === 'granted' && (
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
      )}

      {/* Facebook Pixel is managed via GTM */}
    </>
  );
}
