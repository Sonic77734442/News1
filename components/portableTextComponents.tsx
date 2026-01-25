import Image from "next/image";
import { useState } from "react";
import { PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/lib/sanityImage";

const toYouTubeId = (url?: string) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
};

const LazyYouTube = ({ url, title }: { url?: string; title?: string }) => {
  const [loaded, setLoaded] = useState(false);
  const videoId = toYouTubeId(url);
  if (!videoId) return null;

  const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const embed = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <div className="relative w-full aspect-video my-6 rounded-lg overflow-hidden bg-black">
      {!loaded ? (
        <>
          <Image src={thumbnail} alt={title || "YouTube video"} fill className="object-cover" />
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="absolute inset-0 flex items-center justify-center text-white text-sm md:text-base bg-black/40 hover:bg-black/50 transition"
            aria-label="Play video"
          >
            ▶ Смотреть видео
          </button>
        </>
      ) : (
        <iframe
          src={embed}
          title={title || "YouTube video"}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
};

export const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4">{children}</p>,
    h1: ({ children }) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-semibold mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-semibold mb-4">{children}</h3>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="mb-1">{children}</li>,
    number: ({ children }) => <li className="mb-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: any) => {
      const imageUrl = urlFor(value).width(1120).format("webp").url();

      return (
        <div className="relative w-full h-[630px] my-6">
          <Image
            src={imageUrl}
            alt={value.alt || "Article image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1120px"
            className="object-cover rounded-lg"
            priority
            placeholder="blur"
            blurDataURL="/blur-placeholder.jpg"
          />
        </div>
      );
    },
    youtube: ({ value }: any) => (
      <LazyYouTube url={value?.url} title={value?.title} />
    ),
  },
};
