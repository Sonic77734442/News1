// components/InfiniteArticleScroll.tsx

import React, { useEffect, useRef, useState } from 'react';
import FullArticle from './FullArticle';
import type { PortableTextBlock } from 'sanity';
import { sanity } from '@/lib/sanity';
import { getArticlesByCategory } from '@/lib/queries';

export type ArticleType = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  author?: { name: string };
  category?: { slug: { current: string }; title?: string };
  mainImage?: { asset?: { url: string } };
  description?: string;
  body: PortableTextBlock[];
};

const pageSize = 3;

export default function InfiniteArticleScroll({
  categorySlug,
  excludeSlug,
}: {
  categorySlug: string;
  excludeSlug: string;
}) {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadArticles = async () => {
    if (!categorySlug) return;

    const start = page * pageSize;
    const end = start + pageSize;

    const query = getArticlesByCategory(categorySlug, excludeSlug, start, end);
    const newPosts: ArticleType[] = await sanity.fetch(query);

    if (!newPosts || newPosts.length === 0) {
      setHasMore(false);
      return;
    }

    setArticles((prev) => [...prev, ...newPosts]);
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          loadArticles();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, categorySlug, excludeSlug]);

  return (
    <div className="space-y-16 mt-12">
      {articles.map((article) => (
        <FullArticle key={article._id} {...article} />
      ))}
      {hasMore && (
        <div ref={loaderRef} className="text-center text-gray-400 dark:text-gray-500 py-8">
          Загрузка следующей статьи...
        </div>
      )}
    </div>
  );
}
