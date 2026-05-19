import React, { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import { fetchCategoryPosts, sanity } from '@/lib/sanity';

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

type CategoryPageProps = {
  slug: string;
  initialPosts: PostType[];
  initialHasMore: boolean;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const categorySlugs: { slug: string }[] = await sanity
    .fetch(`*[_type == "category" && defined(slug.current)]{ "slug": slug.current }`)
    .catch(() => []);

  return {
    paths: categorySlugs.map(({ slug }) => ({ params: { slug } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<CategoryPageProps> = async ({ params }) => {
  const slug = params?.slug as string;

  if (!slug) {
    return { notFound: true, revalidate: 60 };
  }

  const initialPosts: PostType[] = await fetchCategoryPosts(slug, 0, pageSize).catch(() => []);

  return {
    props: {
      slug,
      initialPosts,
      initialHasMore: initialPosts.length === pageSize,
    },
    revalidate: 60,
  };
};

export default function CategoryPage({ slug, initialPosts, initialHasMore }: CategoryPageProps) {
  const [posts, setPosts] = useState<PostType[]>(initialPosts);
  const [page, setPage] = useState(initialPosts.length ? 1 : 0);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef(initialPosts.length ? 1 : 0);
  const postsRef = useRef<PostType[]>(initialPosts);

  useEffect(() => {
    const nextPage = initialPosts.length ? 1 : 0;
    setPosts(initialPosts);
    setPage(nextPage);
    setHasMore(initialHasMore);
    pageRef.current = nextPage;
    postsRef.current = initialPosts;
  }, [slug, initialHasMore, initialPosts]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  const loadPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    const start = pageRef.current * pageSize;
    const end = start + pageSize;

    const newPosts: PostType[] = await fetchCategoryPosts(slug, start, end);

    if (!newPosts || newPosts.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    const existingIds = new Set(postsRef.current.map((post) => post._id));
    const uniquePosts = newPosts.filter((post) => !existingIds.has(post._id));

    if (uniquePosts.length > 0) {
      setPosts((prev) => [...prev, ...uniquePosts]);
      setPage((prev) => prev + 1);
    }

    if (newPosts.length < pageSize) {
      setHasMore(false);
    }

    setLoading(false);
  }, [hasMore, loading, slug]);

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
  }, [hasMore, loadPosts, loading]);

  return (
    <div className="min-h-screen dark:text-white font-sans">
      <Head>
        <title>{`Категория: ${slug} — News1.kz`}</title>
        <meta name="description" content={`Свежие новости категории ${slug}`} />
        <meta property="og:title" content={`Категория: ${slug} — News1.kz`} />
        <meta property="og:description" content={`Читайте последние новости в категории ${slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://news1.kz/category/${slug}`} />
        <meta property="og:image" content="https://news1.kz/default-preview.png" />
        <meta property="og:site_name" content="News1.kz" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Категория: ${slug} — News1.kz`} />
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
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">Больше новостей нет.</div>
          )}
        </div>

        <Sidebar />
      </div>

      <Footer />
    </div>
  );
}
