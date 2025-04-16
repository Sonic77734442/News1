import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Facebook, Twitter, Send, ThumbsUp } from 'lucide-react';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from 'sanity';
import { portableTextComponents } from "@/components/portableTextComponents";
import sanityImageLoader from '@/lib/sanityImageLoader'; // 👈 импортируем кастомный loader

type FullArticleProps = {
  title: string;
  publishedAt: string;
  author?: { name: string };
  category?: { title?: string };
  mainImage?: { asset?: { url: string } };
  body: PortableTextBlock[];
};

export default function FullArticle({
  title,
  publishedAt,
  author,
  category,
  mainImage,
  body,
}: FullArticleProps) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, name: 'Айдана', text: 'Отличная статья, спасибо!' },
    { id: 2, name: 'Иван', text: 'Интересный материал, жду продолжения.' },
  ]);
  const [newComment, setNewComment] = useState('');

  const slug = title.toLowerCase().replace(/\s+/g, '-');

  useEffect(() => {
    const likedKey = `liked-${title}`;
    if (localStorage.getItem(likedKey)) {
      setLiked(true);
    }
  }, [title]);

  const handleLike = () => {
    if (!liked) {
      setLikes((prev) => prev + 1);
      setLiked(true);
      localStorage.setItem(`liked-${title}`, 'true');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { id: Date.now(), name: 'Гость', text: newComment }]);
      setNewComment('');
    }
  };

  const plainTextPreview = body
    ?.filter((block) => block._type === 'block' && Array.isArray((block as any).children))
    ?.map((block) =>
      ((block as any).children as Array<any>)
        .map((child) => child.text)
        .join('')
    )
    ?.join(' ')
    ?.slice(0, 150);

  return (
    <>
      <Head>
        <title>{title} – NewsSite.kz</title>
        <meta name="description" content={plainTextPreview} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={plainTextPreview} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={mainImage?.asset?.url} />
        <meta property="og:url" content={`https://newssite.kz/article/${slug}`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={plainTextPreview} />
        <meta name="twitter:image" content={mainImage?.asset?.url} />

        <link rel="canonical" href={`https://newssite.kz/article/${slug}`} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": title,
            "image": [mainImage?.asset?.url],
            "datePublished": publishedAt,
            "author": {
              "@type": "Person",
              "name": author?.name || "NewsSite.kz"
            }
          })
        }} />
      </Head>

      <article className="space-y-6 border-b pb-10">
        {mainImage?.asset?.url && (
          <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden">
            <Image
              loader={sanityImageLoader}
              src={mainImage.asset.url}
              alt={title}
              fill
              priority
              quality={75}
              className="object-cover object-center"
            />
          </div>
        )}

        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-gray-500">
          {new Date(publishedAt).toLocaleDateString()} {author?.name && `• ${author.name}`}
        </p>
        {category?.title && (
          <p className="text-xs uppercase text-red-600 font-semibold">{category.title}</p>
        )}

        <div className="prose dark:prose-invert max-w-none">
          <PortableText value={body} components={portableTextComponents} />
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleLike}
            disabled={liked}
            className="flex items-center gap-2 text-sm px-3 py-1 rounded-full transition border border-gray-300 dark:border-gray-700"
          >
            <ThumbsUp
              className={`w-5 h-5 transition ${liked ? 'text-red-600' : 'text-gray-400'}`}
            />
            <span>{likes}</span>
          </button>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <a href={`https://www.facebook.com/sharer/sharer.php?u=https://www.news1.kz/article/${slug}`} target="_blank" rel="noopener noreferrer">
              <Facebook className="w-5 h-5 hover:text-blue-600 transition" />
            </a>
            <a href={`https://twitter.com/intent/tweet?url=https://www.news1.kz/article/${slug}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">
              <Twitter className="w-5 h-5 hover:text-sky-500 transition" />
            </a>
            <a href={`https://t.me/share/url?url=https://www.news1.kz/article/${slug}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">
              <Send className="w-5 h-5 hover:text-blue-400 transition" />
            </a>
          </div>
        </div>
      </article>
    </>
  );
}
