import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white font-sans">
      <Head>
        <title>Политика конфиденциальности – News1.kz</title>
        <meta name="description" content="Политика конфиденциальности News1.kz." />
        <link rel="canonical" href="https://news1.kz/privacy" />
      </Head>

      <Header />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold">Политика конфиденциальности</h1>
        <p>
          Мы уважаем вашу конфиденциальность. На сайте используются аналитические
          инструменты (например, Яндекс.Метрика и Google Tag Manager) для
          улучшения качества контента и удобства пользователей.
        </p>
        <p>
          Мы не передаём персональные данные третьим лицам, за исключением
          случаев, предусмотренных законодательством.
        </p>
        <p>
          Вы можете отключить cookies в настройках браузера, однако это может
          повлиять на работу отдельных функций сайта.
        </p>
      </main>

      <Footer />
    </div>
  );
}
