'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sanity } from '@/lib/sanity';

type Banner = {
  _id: string;
  type: 'image' | 'html' | 'adsense';
  title: string;
  link?: string;
  html?: string;
  frequency?: number;
  image?: {
    asset: {
      url: string;
    };
  };
};

export default function SidebarAd() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerHeights, setBannerHeights] = useState<Record<string, number>>({});

  const wrapHtmlWithoutScroll = (html: string, bannerId: string) => `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden !important;
            scrollbar-width: none;
            -ms-overflow-style: none;
            background: transparent;
            width: 100%;
          }
          body::-webkit-scrollbar {
            display: none;
          }
        </style>
      </head>
      <body>
        ${html}
        <script>
          (function () {
            var id = ${JSON.stringify(bannerId)};
            var sent = 0;
            function sendHeight() {
              var doc = document.documentElement;
              var body = document.body;
              var height = Math.max(
                doc ? doc.scrollHeight : 0,
                body ? body.scrollHeight : 0,
                doc ? doc.offsetHeight : 0,
                body ? body.offsetHeight : 0,
                120
              );
              if (Math.abs(height - sent) > 1) {
                sent = height;
                parent.postMessage({ type: 'news1-banner-height', id: id, height: height }, '*');
              }
            }
            window.addEventListener('load', sendHeight);
            window.addEventListener('resize', sendHeight);
            var observer = new MutationObserver(function () {
              requestAnimationFrame(sendHeight);
            });
            observer.observe(document.body, { childList: true, subtree: true, attributes: true });
            setTimeout(sendHeight, 0);
            setTimeout(sendHeight, 200);
            setTimeout(sendHeight, 1000);
          })();
        </script>
      </body>
    </html>
  `;

  useEffect(() => {
    const fetchAds = async () => {
      const query = `*[_type == "adBanner" && enabled == true && position == "sidebar"]{
        _id,
        type,
        title,
        link,
        html,
        frequency,
        image {
          asset -> {
            url
          }
        }
      }`;
      const data = await sanity.fetch(query);

      // РџСЂРёРјРµРЅСЏРµРј Р»РѕРіРёРєСѓ РїРѕ frequency: С„РёР»СЊС‚СЂСѓРµРј СЃР»СѓС‡Р°Р№РЅРѕ
      const filtered = data.filter((banner: Banner) => {
        if (banner.frequency === undefined) return true;
        return Math.random() * 100 <= banner.frequency;
      });

      setBanners(filtered);
    };

    fetchAds();
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const payload = event.data as { type?: string; id?: string; height?: number };
      if (!payload || payload.type !== 'news1-banner-height' || !payload.id || !payload.height) {
        return;
      }

      setBannerHeights((prev) => {
        const nextHeight = Math.max(120, Math.round(payload.height as number));
        if (prev[payload.id as string] === nextHeight) {
          return prev;
        }
        return { ...prev, [payload.id as string]: nextHeight };
      });
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (!banners.length) return null;

  return (
    <div className="space-y-4">
      {banners.map((banner) => (
        <div key={banner._id}>
          {banner.type === 'image' && banner.image?.asset?.url && banner.link && (
            <Link href={banner.link} target="_blank" rel="noopener noreferrer">
              <div className="rounded-xl overflow-hidden shadow">
                <Image
                  src={banner.image.asset.url}
                  alt={banner.title}
                  width={300}
                  height={200}
                  className="w-full object-cover"
                />
              </div>
            </Link>
          )}

          {banner.type === 'html' && banner.html && (
            <iframe
              title={banner.title || 'Ad banner'}
              sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              srcDoc={wrapHtmlWithoutScroll(banner.html, banner._id)}
              scrolling="no"
              className="w-full border-0 overflow-hidden block"
              style={{ height: `${bannerHeights[banner._id] ?? 120}px` }}
              loading="lazy"
            />
          )}

          {banner.type === 'adsense' && (
            <div className="text-xs text-gray-400 italic text-center py-2">
              Р РµРєР»Р°РјРЅС‹Р№ Р±Р»РѕРє AdSense (РІ СЂР°Р·СЂР°Р±РѕС‚РєРµ)
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
