import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import { fetchCategoryPosts } from '@/lib/sanity';

const pageSize = 6;

type PostType = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  mainImage: { asset: { url: string } };
  description?: string;
  author?: { name: string };
  category?: { slug: { current: string } };
};

export default function CategoryPage() {
  const router = useRouter();
  const rawSlug = router.query.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const [posts, setPosts] = useState<PostType[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadPosts = async (reset = false) => {
    if (!slug || typeof slug !== 'string' || loading) return;

    setLoading(true);

    const currentPage = reset ? 0 : page;
    const start = currentPage * pageSize;
    const end = start + pageSize;

    const newPosts: PostType[] = await fetchCategoryPosts(slug, start, end);

    if (!newPosts || newPosts.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    const newUnique = newPosts.filter((post) => !posts.some((p) => p._id === post._id));

    setPosts((prev) => (reset ? newUnique : [...prev, ...newUnique]));
    setPage((prev) => (reset ? 1 : prev + 1));

    if (newPosts.length < pageSize) {
      setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (typeof slug === 'string') {
      setPosts([]);
      setPage(0);
      setHasMore(true);
      loadPosts(true);
    }
  }, [slug]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          loadPosts();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
      observer.disconnect();
    };
  }, [hasMore, loading]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white font-sans">
      <Head>
        <title>{`Категория: ${slug} – News1.kz`}</title>
        <meta name="description" content={`Свежие новости категории ${slug}`} />
        <meta property="og:title" content={`Категория: ${slug} – News1.kz`} />
        <meta property="og:description" content={`Читайте последние новости в категории ${slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://news1.kz/category/${slug}`} />
        <meta property="og:image" content="https://news1.kz/default-preview.png" />
        <meta property="og:site_name" content="News1.kz" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Категория: ${slug} – News1.kz`} />
        <meta name="twitter:description" content={`Свежие новости категории ${slug}`} />
        <meta name="twitter:image" content="https://news1.kz/default-preview.png" />

        <link rel="canonical" href={`https://news1.kz/category/${slug}`} />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `Категория: ${slug}`,
            url: `https://news1.kz/category/${slug}`,
            description: `Свежие новости категории ${slug}`,
            isPartOf: {
              '@type': 'WebSite',
              name: 'News1.kz',
              url: 'https://news1.kz',
            },
          })}
        </script>
      </Head>

      <Header />

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3 space-y-6">
          <h1 className="text-2xl font-bold mb-4 capitalize">Категория: {slug}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
          {hasMore ? (
            <div ref={loaderRef} className="text-center py-8 text-gray-400 dark:text-gray-500">
              Загрузка...
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              Больше новостей нет.
            </div>
          )}
        </div>

        <Sidebar />
      </div>

      <Footer />
    </div>
  );
}
