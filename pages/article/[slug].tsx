import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { groq } from 'next-sanity';
import { client } from '@/lib/sanity.client';
import PortableText from '@/components/PortableText';
import { urlFor } from '@/lib/urlFor';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import { Post } from '@/typings';
import ShareButtons from '@/components/ShareButtons';

interface Props {
  post: Post;
}

export default function ArticlePage({ post }: Props) {
  const router = useRouter();
  if (router.isFallback) return <div>Загрузка...</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.description} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:image" content={urlFor(post.mainImage).url()} />
        <meta property="og:url" content={`https://www.news1.kz/article/${post.slug.current}`} />
        <meta property="og:type" content="article" />
      </Head>

      <article>
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-500 text-sm mb-6">{post.publishedAt}</p>
        <Image
          src={urlFor(post.mainImage).url()}
          alt={post.title}
          width={1200}
          height={600}
          className="rounded-md mb-6"
        />
        <PortableText value={post.body} />

        <ShareButtons
          url={`https://www.news1.kz/article/${post.slug.current}`}
          title={post.title}
        />
      </article>

      <Sidebar />
    </div>
  );
}

const query = groq`
  *[_type == "article" && slug.current == $slug][0] {
    ...,
    author->,
    categories[]->
  }
`;

export const getStaticPaths: GetStaticPaths = async () => {
  const query = groq`*[_type == "article"]{ slug }`;
  const posts = await client.fetch(query);
  const paths = posts.map((post: Post) => ({
    params: { slug: post.slug.current },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug;
  const post = await client.fetch(query, { slug });

  if (!post) return { notFound: true };

  return {
    props: { post },
    revalidate: 60,
  };
};
