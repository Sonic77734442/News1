import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import { fetchAllPosts } from '@/lib/sanity';

const pageSize = 12;
const prebuildPages = 5;

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

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Array.from({ length: prebuildPages }, (_, i) => ({
    params: { page: `${i + 1}` },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const page = parseInt(params?.page as string) || 1;
  const start = (page - 1) * pageSize;
  const end = start + pageSize + 1;

  const posts: PostType[] = await fetchAllPosts(start, end);
  const hasMore = posts.length > pageSize;

  if (!posts.length && page !== 1) {
    return { notFound: true };
  }

  return {
    props: {
      posts: posts.slice(0, pageSize),
      page,
      hasMore,
    },
    revalidate: 60,
  };
};

export default function AllNewsPagePaginated({
  posts,
  page,
  hasMore,
}: {
  posts: PostType[];
  page: number;
  hasMore: boolean;
}) {
  const basePath = '/all';
  const title = `Все новости — страница ${page}`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white font-sans">
      <Head>
        <title>{title}</title>
        <meta name="description" content={`Все новости News1.kz — страница ${page}.`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={`Все новости News1.kz — страница ${page}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://news1.kz/all/page/${page}`} />
        <meta property="og:image" content="https://news1.kz/default-preview.png" />
        <meta property="og:site_name" content="News1.kz" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={`Все новости News1.kz — страница ${page}.`} />
        <meta name="twitter:image" content="https://news1.kz/default-preview.png" />

        <link rel="canonical" href={`https://news1.kz/all/page/${page}`} />
        {page > 1 && <link rel="prev" href={`https://news1.kz${basePath}/page/${page - 1}`} />}
        {hasMore && <link rel="next" href={`https://news1.kz${basePath}/page/${page + 1}`} />}

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: title,
            url: `https://news1.kz/all/page/${page}`,
            description: `Все новости News1.kz — страница ${page}.`,
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
          <h1 className="text-2xl font-bold mb-4">Все новости — страница {page}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          <div className="flex justify-between mt-8 text-sm">
            {page > 1 && (
              <a href={`${basePath}/page/${page - 1}`} className="text-blue-500 hover:underline">
                ← Назад
              </a>
            )}
            {hasMore && (
              <a href={`${basePath}/page/${page + 1}`} className="text-blue-500 hover:underline ml-auto">
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
