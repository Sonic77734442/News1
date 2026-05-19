// components/InfiniteArticleScroll.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import FullArticle from './FullArticle';
import type { PortableTextBlock } from 'sanity';
import { sanity } from '@/lib/sanity';
import { articlesByCategoryQuery } from '@/lib/queries';

export type ArticleType = {
  _id: string;
  title: string;
  slug?: { current?: string };
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
  const pageRef = useRef(0);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    setArticles([]);
    setPage(0);
    setHasMore(true);
  }, [categorySlug, excludeSlug]);

  const loadArticles = useCallback(async () => {
    if (!categorySlug) return;

    const start = pageRef.current * pageSize;
    const end = start + pageSize;

    const newPosts: ArticleType[] = await sanity.fetch(articlesByCategoryQuery, {
      categorySlug,
      excludeSlug,
      start,
      end,
    });

    if (!newPosts || newPosts.length === 0) {
      setHasMore(false);
      return;
    }

    setArticles((prev) => [...prev, ...newPosts]);
    setPage((prev) => prev + 1);
  }, [categorySlug, excludeSlug]);

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
  }, [hasMore, loadArticles]);

  return (
    <div className="space-y-16 mt-12">
      {articles.map((article) => (
        <FullArticle key={article._id} {...article} />
      ))}
      {hasMore && (
        <div ref={loaderRef} className="text-center text-gray-400 dark:text-gray-500 py-8">
          Р—Р°РіСЂСѓР·РєР° СЃР»РµРґСѓСЋС‰РµР№ СЃС‚Р°С‚СЊРё...
        </div>
      )}
    </div>
  );
}
