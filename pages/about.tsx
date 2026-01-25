import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white font-sans">
      <Head>
        <title>О нас – News1.kz</title>
        <meta
          name="description"
          content="News1.kz — независимое новостное издание о Казахстане: экономика, политика, финансы, спорт и технологии."
        />
        <link rel="canonical" href="https://news1.kz/about" />
      </Head>

      <Header />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold">О нас</h1>
        <p>
          News1.kz — независимое новостное издание о Казахстане. Мы публикуем
          оперативные новости, аналитику и объясняющие материалы.
        </p>
        <p>
          Темы: экономика, политика, финансы, спорт, технологии. Мы стремимся
          предоставлять точную и проверенную информацию, указывая источники и
          исправляя ошибки при необходимости.
        </p>
        <p>
          Редакция: один автор. Если вы заметили ошибку — напишите нам, мы
          проверим и внесём исправления.
        </p>
      </main>

      <Footer />
    </div>
  );
}
