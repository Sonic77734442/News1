import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import sanityImageLoader from '@/lib/sanityImageLoader';

type PostCardProps = {
  post: {
    title?: string;
    slug?: { current?: string };
    publishedAt?: string;
    mainImage?: { asset?: { url?: string } };
    description?: string;
    author?: { name?: string };
    category?: { slug?: { current?: string } };
    _id?: string;
  };
  categoryLabel?: string;
  forceHeight?: boolean;
};

export default function PostCard({ post, categoryLabel, forceHeight = false }: PostCardProps) {
  if (!post || !post.slug?.current || !post.title) {
    console.warn('PostCard: недопустимый объект поста:', post);
    return null;
  }

  const imageUrl = post.mainImage?.asset?.url;
  const altText = post.title || 'Новость';

  return (
    <Link href={`/article/${post.slug.current}`}>
      <article className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm md:hover:shadow-lg transition overflow-hidden group">
        {typeof imageUrl === 'string' && imageUrl.length > 0 && (
          <div className="aspect-[16/9] relative overflow-hidden">
            <Image
              loader={sanityImageLoader}
              src={imageUrl}
              alt={altText}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              quality={75}
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
          </div>
        )}

        <div className="p-5 flex flex-col flex-1 justify-between gap-2">
          {categoryLabel && (
            <span className="text-xs uppercase font-semibold text-red-600">{categoryLabel}</span>
          )}
          {post.publishedAt && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(post.publishedAt).toLocaleDateString()}
            </span>
          )}
          <h3 className="text-lg font-semibold leading-snug text-gray-900 dark:text-white group-hover:underline line-clamp-2">
            {post.title}
          </h3>
          {post.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {post.description}
            </p>
          )}
          {post.author?.name && (
            <p className="text-sm text-gray-400 dark:text-gray-400 italic mt-1">
              Автор: {post.author.name}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
