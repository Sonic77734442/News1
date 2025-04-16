import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import TickerTape from '@/components/TickerTape';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import { sanity, fetchCategoryPosts } from '@/lib/sanity';

const categories = [
  { title: 'Финансы', slug: 'finance' },
  { title: 'Спорт', slug: 'sport' },
  { title: 'IT', slug: 'it' },
  { title: 'Новости Казахстана', slug: 'kazakhstan' },
];

export default function Home({ featuredPost, categoryPosts, recentPosts }: any) {
  const [latestPosts, setLatestPosts] = useState(recentPosts);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/latest');
        const data = await res.json();
        setLatestPosts(data);
      } catch (err) {
        console.error('Ошибка при автообновлении новостей:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white font-sans">
      <Head>
        <title>News1.kz – Последние новости</title>
        <meta name="description" content="Читайте свежие новости Казахстана, Финансы, Спорт и IT" />
      </Head>

      <Header />
      <TickerTape />

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3 space-y-10">

          {/* 🔝 Hero-блок */}
          {featuredPost && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[320px]">
              {/* Левая карточка */}
              <div className="md:col-span-2 h-full bg-blue-950 text-white rounded-lg overflow-hidden relative flex flex-col">
                <Link href={`/article/${featuredPost.slug.current}`} className="flex-1">
                  <div className="relative w-full h-full min-h-[220px]">
                    <Image
                      src={featuredPost.mainImage.asset.url}
                      alt={featuredPost.title}
                      fill
                      priority
                      className="object-cover opacity-80 rounded-lg"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent text-white">
                      <span className="text-sm mb-2">Сегодня</span>
                      <h2 className="text-2xl font-bold leading-snug">{featuredPost.title}</h2>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Правая карточка */}
              {Array.isArray(latestPosts) && latestPosts[0] && (
                <div className="h-full">
                  <PostCard post={latestPosts[0]} forceHeight />
                </div>
              )}
            </section>
          )}

          {/* 💬 2–4 свежих поста */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.isArray(latestPosts) &&
              latestPosts.slice(1, 4).map((post: any) => (
                <PostCard key={post._id} post={post} />
              ))}
          </section>

          {/* 🔎 Поиск */}
          <form className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Поиск новостей..."
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 w-full sm:w-auto rounded-lg md:hover:bg-blue-700 transition"
            >
              Найти
            </button>
          </form>

          {/* 🗂️ Категории */}
          <section className="space-y-12">
            {categories.map((cat) => (
              <div key={cat.slug} className="space-y-4">
                <Link
                  href={`/category/${cat.slug}`}
                  className="text-lg font-bold uppercase text-blue-700 dark:text-blue-400 hover:underline border-b border-gray-300 dark:border-gray-600 inline-block pb-1"
                >
                  {cat.title}
                </Link>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {categoryPosts[cat.slug]?.map((post: any) => (
                    <PostCard key={post._id} post={post} categoryLabel={cat.title} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* 🧭 Sidebar без пропов */}
        <Sidebar />
      </div>

      <Footer />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const featuredQuery = `
    *[_type == "post" && featured == true] | order(publishedAt desc)[0] {
      _id, title, slug, publishedAt, description,
      mainImage { asset -> { url } }
    }
  `;
  const featuredPost = await sanity.fetch(featuredQuery).catch(() => null);

  const recentPostsQuery = `
    *[_type == "post"] | order(publishedAt desc)[0...6] {
      _id, title, slug, publishedAt, description,
      mainImage { asset -> { url } },
      category -> { title, slug }
    }
  `;
  const recentPosts = await sanity.fetch(recentPostsQuery).catch(() => []);

  const categoryPosts: Record<string, any[]> = {};
  for (const cat of categories) {
    categoryPosts[cat.slug] = await fetchCategoryPosts(cat.slug, 0, 3).catch(() => []);
  }

  return {
    props: {
      featuredPost,
      categoryPosts,
      recentPosts,
    },
    revalidate: 60,
  };
};