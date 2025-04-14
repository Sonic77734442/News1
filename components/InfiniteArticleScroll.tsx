import React, { useEffect, useRef, useState } from 'react';
import FullArticle from './FullArticle';

export type ArticleType = {
  title: string;
  publishedAt: string;
  author?: { name: string };
  category?: { title: string };
  mainImage?: { asset: { url: string } };
  body: string;
};

const dummyArticles: ArticleType[] = Array.from({ length: 10 }, (_, i) => ({
  title: `Заголовок статьи #${i + 1}`,
  publishedAt: new Date().toISOString(),
  author: { name: 'Автор статьи' },
  category: { title: 'Категория' },
  mainImage: { asset: { url: '/placeholder.jpg' } },
  body: `Текст статьи номер ${i + 1}. Здесь может быть markdown или rich text.`
}));

export default function InfiniteArticleScroll() {
  const [articles, setArticles] = useState<ArticleType[]>(dummyArticles.slice(0, 3)); // сразу 3 статьи
  const [index, setIndex] = useState(3); // Начинаем с третьей статьи
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && index < dummyArticles.length) {
          setArticles((prev) => [...prev, dummyArticles[index]]);
          setIndex((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div className="space-y-16">
      {articles.map((article, idx) => (
        <FullArticle key={idx} {...article} />
      ))}
      <div ref={loaderRef} className="text-center text-gray-400 dark:text-gray-500 py-8">
        Загрузка следующей статьи...
      </div>
    </div>
  );
}
