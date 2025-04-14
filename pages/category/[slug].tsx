import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import { fetchCategoryPosts } from '@/lib/sanity';

const pageSize = 6;

// ✅ Полный тип статьи
type PostType = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  author?: { name: string };
  mainImage?: { asset: { url: string } };
  body: any;
  category?: { title: string };
};

export default function CategoryPage() {
  const router = useRouter();
  const rawSlug = router.query.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const [posts, setPosts] = useState<PostType[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);

  const loadPosts = async () => {
    if (!slug || typeof slug !== 'string' || loading) return;

    setLoading(true);

    const start = page * pageSize;
    const end = start + pageSize;

    const newPosts: PostType[] = await fetchCategoryPosts(slug, start, end);

    if (!newPosts || newPosts.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    const newUnique = newPosts.filter((post) =>
      !posts.some((p) => p._id === post._id)
    );

    setPosts((prev) => [...prev, ...newUnique]);
    setPage((prev) => prev + 1);

    if (newPosts.length < pageSize) {
      setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (typeof slug === 'string') {
      loadPosts();
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
        <title>{`Категория: ${slug} – NewsSite.kz`}</title>
        <meta name="description" content={`Свежие новости категории ${slug}`} />
        <meta property="og:title" content={`Категория: ${slug} – NewsSite.kz`} />
        <meta property="og:description" content={`Читайте последние новости в категории ${slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://newssite.kz/category/${slug}`} />
        <meta property="og:image" content="/cloud.jpg" />
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

        <Sidebar posts={[]} />
      </div>

      <Footer />
    </div>
  );
}
