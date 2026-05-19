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
  const loaderRef = useRef(null);

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

    const newUnique = newPosts.filter((post) =>
      !posts.some((p) => p._id === post._id)
    );

    setPosts((prev) => reset ? newUnique : [...prev, ...newUnique]);
    setPage((prev) => reset ? 1 : prev + 1);

    if (newPosts.length < pageSize) {
      setHasMore(false);
    }

    setLoading(false);
  };

  // Р—Р°РіСЂСѓР¶Р°РµРј РїСЂРё РїРµСЂРІРѕРј РјРѕРЅС‚РёСЂРѕРІР°РЅРёРё РёР»Рё РёР·РјРµРЅРµРЅРёРё slug
  useEffect(() => {
    if (typeof slug === 'string') {
      setPosts([]);
      setPage(0);
      setHasMore(true);
      loadPosts(true); // СЃР±СЂР°СЃС‹РІР°РµРј СЃС‚СЂР°РЅРёС†Сѓ Рё РїРѕРґРіСЂСѓР¶Р°РµРј Р·Р°РЅРѕРІРѕ
    }
  }, [slug]);

  // Infinite scroll
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
    <div className="min-h-screen dark:text-white font-sans">
      <Head>
        <title>{`РљР°С‚РµРіРѕСЂРёСЏ: ${slug} вЂ“ NewsSite.kz`}</title>
        <meta name="description" content={`РЎРІРµР¶РёРµ РЅРѕРІРѕСЃС‚Рё РєР°С‚РµРіРѕСЂРёРё ${slug}`} />
        <meta property="og:title" content={`РљР°С‚РµРіРѕСЂРёСЏ: ${slug} вЂ“ NewsSite.kz`} />
        <meta property="og:description" content={`Р§РёС‚Р°Р№С‚Рµ РїРѕСЃР»РµРґРЅРёРµ РЅРѕРІРѕСЃС‚Рё РІ РєР°С‚РµРіРѕСЂРёРё ${slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://newssite.kz/category/${slug}`} />
        <meta property="og:image" content="/cloud.jpg" />
      </Head>

      <Header />

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3 space-y-6">
          <h1 className="text-2xl font-bold mb-4 capitalize">РљР°С‚РµРіРѕСЂРёСЏ: {slug}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
          {hasMore ? (
            <div ref={loaderRef} className="text-center py-8 text-gray-400 dark:text-gray-500">
              Р—Р°РіСЂСѓР·РєР°...
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              Р‘РѕР»СЊС€Рµ РЅРѕРІРѕСЃС‚РµР№ РЅРµС‚.
            </div>
          )}
        </div>

        <Sidebar />
      </div>

      <Footer />
    </div>
  );
}

