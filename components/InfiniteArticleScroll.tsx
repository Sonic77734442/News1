// components/InfiniteArticleScroll.tsx
import React, { useEffect, useRef, useState } from 'react';
import FullArticle from './FullArticle';
import type { PortableTextBlock } from 'sanity';
import { fetchCategoryPosts } from '@/lib/sanity'; // адаптируй путь если нужно

export type ArticleType = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  author?: { name: string };
  category?: { slug: { current: string }, title: string };
  mainImage?: { asset: { url: string } };
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
    const start = page * pageSize;
    const end = start + pageSize;

    const newPosts = await fetchCategoryPosts(categorySlug, start, end);
    const filtered = newPosts.filter((post: ArticleType) => post.slug.current !== excludeSlug);

    if (filtered.length === 0) {
      setHasMore(false);
      return;
    }

    setArticles((prev) => [...prev, ...filtered]);
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (!categorySlug) return;

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
  }, [hasMore, categorySlug]);

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
