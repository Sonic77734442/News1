import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-300">
        <p>&copy; {new Date().getFullYear()} NewsSite.kz — Все права защищены.</p>
        <div className="mt-2 space-x-4">
          <Link href="/about" className="hover:underline">О нас</Link>
          <Link href="/contact" className="hover:underline">Контакты</Link>
          <Link href="/privacy" className="hover:underline">Политика конфиденциальности</Link>
        </div>
      </div>
    </footer>
  );
}
