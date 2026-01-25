import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import { fetchCategoryPosts } from '@/lib/sanity';
import { sanity } from '@/lib/sanity';

const pageSize = 6;

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
  const categorySlugs: { slug: string }[] = await sanity.fetch(`
    *[_type == "category"]{ "slug": slug.current }
  `);

  const paths: { params: { slug: string; page: string } }[] = [];

  for (const { slug } of categorySlugs) {
    for (let i = 1; i <= 3; i++) {
      paths.push({ params: { slug, page: i.toString() } });
    }
  }

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string | undefined;
  const page = parseInt(params?.page as string) || 1;

  if (!slug) {
    return {
      notFound: true,
    };
  }

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const posts: PostType[] = await fetchCategoryPosts(slug, start, end);

  return {
    props: {
      posts,
      slug,
      page,
      hasMore: posts.length === pageSize,
    },
    revalidate: 60,
  };
};

export default function CategoryPagePaginated({
  posts,
  slug,
  page,
  hasMore,
}: {
  posts: PostType[];
  slug: string;
  page: number;
  hasMore: boolean;
}) {
  const basePath = `/category/${slug}`;
  const title = `Категория: ${slug} – страница ${page}`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white font-sans">
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content={`Свежие новости категории ${slug}, страница ${page}`}
        />
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content={`Свежие новости категории ${slug}, страница ${page}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://news1.kz${basePath}/page/${page}`} />
        <meta property="og:image" content="https://news1.kz/default-preview.png" />
        <meta property="og:site_name" content="News1.kz" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta
          name="twitter:description"
          content={`Свежие новости категории ${slug}, страница ${page}`}
        />
        <meta name="twitter:image" content="https://news1.kz/default-preview.png" />

        <link rel="canonical" href={`https://news1.kz${basePath}/page/${page}`} />
        {page > 1 && <link rel="prev" href={`https://news1.kz${basePath}/page/${page - 1}`} />}
        {hasMore && <link rel="next" href={`https://news1.kz${basePath}/page/${page + 1}`} />}
      </Head>

      <Header />

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3 space-y-6">
          <h1 className="text-2xl font-bold mb-4 capitalize">
            Категория: {slug} – страница {page}
          </h1>
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
