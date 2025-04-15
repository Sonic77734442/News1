// pages/article/[slug].tsx

import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { sanity } from '@/lib/sanity';
import { getArticleBySlug, getAllSlugs } from '@/lib/queries';
import FullArticle from '@/components/FullArticle';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import InfiniteArticleScroll from '@/components/InfiniteArticleScroll'; // ✅ ДОБАВИЛ

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs: { slug: string }[] = await sanity.fetch(getAllSlugs());

  const paths = slugs.map(({ slug }) => ({
    params: { slug },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const query = getArticleBySlug(slug);

  const article = await sanity.fetch(query);

  if (!article) {
    return { notFound: true };
  }

  return {
    props: { article },
    revalidate: 60,
  };
};

export default function ArticlePage({ article }: { article: any }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white font-sans">
      <Head>
        <title>{article?.title || 'Новость'} – NewsSite.kz</title>
        <meta name="description" content={article?.body?.slice?.(0, 150) || 'Описание недоступно'} />
      </Head>

      <Header />

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3 space-y-10">
          <FullArticle {...article} />
          {/* 🔄 Блок бесконечной прокрутки из той же категории */}
          <InfiniteArticleScroll
            categorySlug={article.category?.slug?.current}
            excludeSlug={article.slug?.current}
          />
        </div>

        <Sidebar />
      </div>

      <Footer />
    </div>
  );
}
