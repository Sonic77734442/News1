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
              srcDoc={banner.html}
              className="w-full min-h-[120px] border-0"
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
