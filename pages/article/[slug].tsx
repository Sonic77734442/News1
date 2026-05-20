// pages/article/[slug].tsx

import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { sanity } from '@/lib/sanity';
import { articleBySlugQuery, getAllSlugs } from '@/lib/queries';
import FullArticle from '@/components/FullArticle';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import InfiniteArticleScroll from '@/components/InfiniteArticleScroll';

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs: { slug: string }[] = await sanity.fetch(getAllSlugs()).catch(() => []);

  return {
    paths: slugs.map(({ slug }) => ({ params: { slug } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const article = await sanity.fetch(articleBySlugQuery, { slug }).catch(() => null);

  if (!article) {
    return { notFound: true, revalidate: 60 };
  }

  return {
    props: { article },
    revalidate: 300,
  };
};

export default function ArticlePage({ article }: { article: any }) {
  const bodyDescription = Array.isArray(article.body)
    ? article.body
        .filter((block: any) => block._type === 'block' && Array.isArray(block.children))
        .map((block: any) => block.children.map((child: any) => child.text).join(''))
        .join(' ')
        .slice(0, 150)
    : 'Описание недоступно';
  const metaDescription = article?.shortDescription || article?.description || bodyDescription;

  const canonicalUrl = `https://news1.kz/article/${article?.slug?.current}`;
  const ogImage = article?.mainImage?.asset?.url || 'https://news1.kz/default-preview.png';
  const publishedTime = article?.publishedAt || article?._createdAt;
  const modifiedTime = article?.dateModified || article?._updatedAt || article?.publishedAt || article?._createdAt;
  const authorName = article?.author?.name || 'News1.kz';
  const categoryTitle = article?.category?.title;

  return (
    <div className="min-h-screen dark:text-white font-sans">
      <Head>
        <title>{article?.title || 'Новость'} — News1.kz</title>
        <meta name="description" content={metaDescription} />

        <meta property="og:title" content={article?.title || ''} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="News1.kz" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {publishedTime && <meta property="article:published_time" content={publishedTime} />}
        {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        {categoryTitle && <meta property="article:section" content={categoryTitle} />}
        {authorName && <meta property="article:author" content={authorName} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article?.title || ''} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />

        <link rel="canonical" href={canonicalUrl} />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article?.title,
            image: [ogImage],
            datePublished: publishedTime,
            dateModified: modifiedTime,
            author: {
              '@type': 'Person',
              name: authorName,
            },
            publisher: {
              '@type': 'Organization',
              name: 'News1.kz',
              logo: {
                '@type': 'ImageObject',
                url: 'https://news1.kz/logo.png',
              },
            },
            description: metaDescription,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': canonicalUrl,
            },
          })}
        </script>
      </Head>

      <Header />

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3 space-y-10">
          <FullArticle {...article} />

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
