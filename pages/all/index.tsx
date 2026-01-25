import { GetStaticProps } from 'next';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import { fetchAllPosts } from '@/lib/sanity';

const pageSize = 12;

type PostType = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  mainImage?: { asset?: { url: string } };
  description?: string;
  author?: { name: string };
  category?: { slug: { current: string }; title?: string };
};

export const getStaticProps: GetStaticProps = async () => {
  const posts: PostType[] = await fetchAllPosts(0, pageSize + 1);
  const hasMore = posts.length > pageSize;

  return {
    props: {
      posts: posts.slice(0, pageSize),
      page: 1,
      hasMore,
    },
    revalidate: 60,
  };
};

export default function AllNewsPage({
  posts,
  page,
  hasMore,
}: {
  posts: PostType[];
  page: number;
  hasMore: boolean;
}) {
  const basePath = '/all';
  const title = 'Все новости — страница 1';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white font-sans">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Все новости News1.kz — свежие публикации и обновления." />
        <meta property="og:title" content={title} />
        <meta property="og:description" content="Все новости News1.kz — свежие публикации и обновления." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://news1.kz/all" />
        <meta property="og:image" content="https://news1.kz/default-preview.png" />
        <meta property="og:site_name" content="News1.kz" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content="Все новости News1.kz — свежие публикации и обновления." />
        <meta name="twitter:image" content="https://news1.kz/default-preview.png" />

        <link rel="canonical" href="https://news1.kz/all" />
        {hasMore && <link rel="next" href="https://news1.kz/all/page/2" />}

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: title,
            url: 'https://news1.kz/all',
            description: 'Все новости News1.kz — свежие публикации и обновления.',
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
          <h1 className="text-2xl font-bold mb-4">Все новости</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          <div className="flex justify-between mt-8 text-sm">
            <span />
            {hasMore && (
              <a href={`${basePath}/page/2`} className="text-blue-500 hover:underline ml-auto">
                Далее →
              </a>
            )}
          </div>
        </div>

        <Sidebar />
      </div>

      <Footer />
    </div>
  );
}
