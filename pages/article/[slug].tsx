// pages/article/[slug].tsx

import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { sanity } from '@/lib/sanity';
import { getArticleBySlug, getAllSlugs } from '@/lib/queries';
import FullArticle from '@/components/FullArticle';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import InfiniteArticleScroll from '@/components/InfiniteArticleScroll';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  const query = getArticleBySlug(slug);

  const article = await sanity.fetch(query);

  if (!article) {
    return { notFound: true };
  }

  return {
    props: { article },
  };
};

export default function ArticlePage({ article }: { article: any }) {
  const metaDescription = Array.isArray(article.body)
    ? article.body
        .filter((block: any) => block._type === 'block' && Array.isArray(block.children))
        .map((block: any) =>
          block.children.map((child: any) => child.text).join('')
        )
        .join(' ')
        .slice(0, 150)
    : 'РћРїРёСЃР°РЅРёРµ РЅРµРґРѕСЃС‚СѓРїРЅРѕ';

  return (
    <div className="min-h-screen dark:text-white font-sans">
      <Head>
        <title>{article?.title || 'РќРѕРІРѕСЃС‚СЊ'} вЂ“ News1.kz</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={article?.title || ''} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={article?.mainImage?.asset?.url || ''} />
        <meta property="og:url" content={`https://www.news1.kz/article/${article?.slug?.current}`} />
        <meta property="og:type" content="article" />

        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article?.title,
            "image": [article?.mainImage?.asset?.url],
            "datePublished": article?.publishedAt,
            "dateModified": article?.updatedAt || article?.publishedAt,
            "author": {
              "@type": "Person",
              "name": article?.author?.name || "News1.kz"
            },
            "publisher": {
              "@type": "Organization",
              "name": "News1.kz",
              "logo": {
                "@type": "ImageObject",
                "url": "https://news1.kz/logo.png"
              }
            },
            "description": metaDescription,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://www.news1.kz/article/${article?.slug?.current}`
            }
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

