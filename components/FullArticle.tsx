import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Facebook, Twitter, Send, ThumbsUp } from 'lucide-react';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from 'sanity';
import { portableTextComponents } from "@/components/portableTextComponents";

type FullArticleProps = {
  title: string;
  publishedAt: string;
  author?: { name: string };
  category?: { title?: string }; // ✅ сделано опциональным
  mainImage?: { asset?: { url: string } }; // ✅ asset опционален
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

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={plainTextPreview} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={mainImage?.asset?.url} />
        <meta property="og:url" content={`https://newssite.kz/article/${slug}`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={plainTextPreview} />
        <meta name="twitter:image" content={mainImage?.asset?.url} />

        {/* Canonical */}
        <link rel="canonical" href={`https://newssite.kz/article/${slug}`} />

        {/* Schema.org */}
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
            <img
              src={mainImage.asset.url}
              alt={title}
              className="w-full h-full object-cover object-center"
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

        {/* Like and Share */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleLike}
            disabled={liked}
            className="flex items-center gap-2 text-sm px-3 py-1 rounded-full transition border border-gray-300 dark:border-gray-700"
          >
            <ThumbsUp
              className={`w-5 h-5 transition ${
                liked ? 'text-red-600' : 'text-gray-400'
              }`}
            />
            <span>{likes}</span>
          </button>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Facebook className="w-5 h-5 hover:text-blue-600 transition" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Twitter className="w-5 h-5 hover:text-sky-500 transition" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Send className="w-5 h-5 hover:text-blue-400 transition" />
            </a>
          </div>
        </div>

        {/* Комментарии */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Комментарии</h2>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-1">{comment.name}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
              placeholder="Оставьте комментарий..."
            ></textarea>
            <button
              onClick={handleAddComment}
              className="self-end px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Отправить
            </button>
          </div>
        </div>
      </article>
    </>
  );
}
