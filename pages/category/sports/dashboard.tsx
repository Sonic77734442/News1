import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { MoonLoader } from 'react-spinners';
import SportNews from '@/components/SportNews';

interface Match {
  id: number;
  teamA: string;
  teamB: string;
  time: string;
  oddsA: number;
  oddsB: number;
}

export default function SportDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const fakeData: Match[] = [
        { id: 1, teamA: 'Кайрат', teamB: 'Астана', time: '18:00', oddsA: 2.1, oddsB: 3.4 },
        { id: 2, teamA: 'Барселона', teamB: 'Реал Мадрид', time: '21:00', oddsA: 2.5, oddsB: 2.8 },
      ];
      setMatches(fakeData);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen flex flex-col">
      <Head>
        <title>Спортивный дашборд – News1.kz</title>
        <meta name="description" content="Актуальные матчи и последние новости спорта." />
        <meta property="og:title" content="Спортивный дашборд – News1.kz" />
        <meta property="og:description" content="Актуальные матчи и последние новости спорта." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://news1.kz/category/sports/dashboard" />
        <meta property="og:image" content="https://news1.kz/default-preview.png" />
        <meta property="og:site_name" content="News1.kz" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Спортивный дашборд – News1.kz" />
        <meta name="twitter:description" content="Актуальные матчи и последние новости спорта." />
        <meta name="twitter:image" content="https://news1.kz/default-preview.png" />

        <link rel="canonical" href="https://news1.kz/category/sports/dashboard" />
      </Head>
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-6">Спортивный дашборд</h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <MoonLoader color="#10b981" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{match.teamA}</span>
                  <span className="text-sm text-gray-500">vs</span>
                  <span className="font-medium">{match.teamB}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Время: {match.time}</span>
                  <span>Коэф: {match.oddsA} / {match.oddsB}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <hr className="my-10 border-gray-300 dark:border-gray-600" />

        <h2 className="text-2xl font-semibold mb-4">Последние новости спорта</h2>
        <SportNews />
      </main>

      <Footer />
    </div>
  );
}
