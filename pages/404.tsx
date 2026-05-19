import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import styles from '@/styles/404.module.css';

const tickerItems = ['Последние новости', 'Финансы', 'Спорт', 'IT', 'Казахстан', 'News1.kz'];

const quickCategories = [
  { href: '/category/finance', icon: '₸', title: 'Финансы', text: 'Курсы, экономика, банки' },
  { href: '/category/sport', icon: '⚽', title: 'Спорт', text: 'Матчи, клубы, события' },
  { href: '/category/it', icon: '⌘', title: 'IT', text: 'Технологии и digital' },
  { href: '/category/kazakhstan', icon: '🇰🇿', title: 'Казахстан', text: 'Главные новости страны' },
];

export default function Custom404() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';
  const tickerTrack = useMemo(() => [...tickerItems, ...tickerItems], []);

  return (
    <div className={styles.page}>
      <Head>
        <title>404 — News1.kz</title>
        <meta name="description" content="Страница не найдена — News1.kz" />
      </Head>

      <div className={styles.pageShell}>
        <header className={styles.siteHeader}>
          <Link className={styles.logo} href="/" aria-label="News1.kz — главная">
            <span className={styles.logoMark}>N1</span>
            <span className={styles.logoText}>News1</span>
          </Link>

          <nav className={styles.mainNav} aria-label="Главное меню">
            <Link href="/all">Все новости</Link>
            <Link href="/category/finance">Финансы</Link>
            <Link href="/category/sport">Спорт</Link>
            <Link href="/category/it">IT</Link>
            <Link href="/category/kazakhstan">Казахстан</Link>
          </nav>

          <button
            className={styles.themeToggle}
            type="button"
            aria-label="Переключить тему"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className={styles.errorLayout}>
          <section className={styles.heroCard} aria-labelledby="title404">
            <div className={styles.ticker} aria-label="Информационная строка">
              <div className={styles.tickerTrack}>
                {tickerTrack.map((item, idx) => (
                  <span key={`${item}-${idx}`}>{item}</span>
                ))}
              </div>
            </div>

            <div className={styles.heroContent}>
              <p className={styles.eyebrow}>Ошибка 404 / Материал не найден</p>
              <h1 id="title404">Новость потерялась в ленте</h1>
              <p className={styles.lead}>
                Возможно, страница была удалена, ссылка изменилась или материал временно недоступен.
                Вернитесь на главную или выберите актуальный раздел.
              </p>

              <form className={styles.searchBox} action="/" method="get">
                <input type="search" name="s" placeholder="Найти новость, тему или раздел" aria-label="Поиск по сайту" />
                <button type="submit">Найти</button>
              </form>

              <div className={styles.actions}>
                <Link className={styles.primaryBtn} href="/">
                  На главную
                </Link>
                <Link className={styles.secondaryBtn} href="/category/kazakhstan">
                  Новости Казахстана
                </Link>
              </div>
            </div>

            <div className={styles.bigNumber} aria-hidden="true">
              <span>4</span>
              <span className={styles.planet}>0</span>
              <span>4</span>
            </div>
          </section>

          <aside className={styles.sidePanel} aria-label="Быстрые разделы">
            <div className={`${styles.panelBlock} ${styles.liveBlock}`}>
              <div className={styles.pulse} />
              <div>
                <p className={styles.smallTitle}>Лента обновляется</p>
                <p className={styles.muted}>Выберите раздел, чтобы продолжить чтение.</p>
              </div>
            </div>

            <div className={styles.categoryGrid}>
              {quickCategories.map((category) => (
                <Link key={category.href} href={category.href} className={styles.categoryCard}>
                  <span>{category.icon}</span>
                  <strong>{category.title}</strong>
                  <small>{category.text}</small>
                </Link>
              ))}
            </div>

            <div className={`${styles.panelBlock} ${styles.quoteBlock}`}>
              <p>«Иногда страница исчезает, но важные новости всегда остаются рядом.»</p>
            </div>
          </aside>
        </main>

        <footer className={styles.siteFooter}>
          <span>© 2026 News1.kz</span>
          <div>
            <Link href="/about">О нас</Link>
            <Link href="/contact">Контакты</Link>
            <Link href="/privacy">Политика конфиденциальности</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
