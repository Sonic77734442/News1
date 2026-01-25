import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white font-sans">
      <Head>
        <title>Контакты – News1.kz</title>
        <meta name="description" content="Контакты редакции News1.kz." />
        <link rel="canonical" href="https://news1.kz/contact" />
      </Head>

      <Header />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold">Контакты</h1>
        <p>По всем вопросам пишите на почту:</p>
        <p className="font-semibold">news1kz.editor@gmail.com</p>
        <p>
          Также доступны соцсети: Facebook, Telegram, Instagram (ссылки в
          боковой панели и футере).
        </p>
      </main>

      <Footer />
    </div>
  );
}
