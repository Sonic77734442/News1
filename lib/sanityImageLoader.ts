// lib/sanityImageLoader.ts
type SanityLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

export default function sanityImageLoader({ src, width, quality }: SanityLoaderProps) {
  const url = new URL(src);
  url.searchParams.set('auto', 'format'); // ⚡ webp!
  url.searchParams.set('fit', 'max');
  url.searchParams.set('w', width.toString());
  if (quality) url.searchParams.set('q', quality.toString());
  return url.toString();
}
