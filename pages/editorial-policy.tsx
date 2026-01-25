import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white font-sans">
      <Head>
        <title>Редакционная политика – News1.kz</title>
        <meta
          name="description"
          content="Редакционная политика News1.kz: принципы, проверка фактов и исправления."
        />
        <link rel="canonical" href="https://news1.kz/editorial-policy" />
      </Head>

      <Header />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold">Редакционная политика</h1>
        <p>
          Мы стремимся публиковать точную, проверенную и актуальную информацию.
          Материалы создаются на основе открытых источников, официальных
          сообщений, пресс-релизов и публичных данных.
        </p>
        <h2 className="text-xl font-semibold">Принципы</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Проверяем факты перед публикацией.</li>
          <li>Указываем источники, если они доступны.</li>
          <li>Разделяем новости и мнения.</li>
          <li>Используем прозрачные заголовки без кликбейта.</li>
        </ul>
        <h2 className="text-xl font-semibold">Исправления</h2>
        <p>
          Если вы нашли ошибку, сообщите нам по адресу
          <span className="font-semibold"> news1kz.editor@gmail.com</span>. Мы
          проверим информацию и при необходимости внесём исправления.
        </p>
        <h3 className="text-lg font-semibold">Правила исправлений</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Мы исправляем фактические ошибки как можно быстрее после проверки.</li>
          <li>Существенные правки отмечаем в конце материала с датой обновления.</li>
          <li>Мелкие опечатки и стилистика могут исправляться без отдельной пометки.</li>
          <li>Если материал требует уточнений, мы обновляем его и указываем источник.</li>
        </ul>
      </main>

      <Footer />
    </div>
  );
}
