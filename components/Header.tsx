// components/Header.tsx

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import WeatherWidget from '@/components/WeatherWidget';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <span className="text-xl font-bold text-gray-900 dark:text-white">News1</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-6 items-center">
            <Link href="/all" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Все новости
            </Link>
            <Link href="/category/finance" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Финансы
            </Link>
            <Link href="/category/sport" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Спорт
            </Link>
            <Link href="/category/it" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              IT
            </Link>
            <Link href="/category/kazakhstan" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Казахстан
            </Link>
          </nav>
          <WeatherWidget />
          <ThemeToggle />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="text-gray-700 dark:text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 px-4 pb-4 space-y-2">
          <Link href="/all" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600">
            Все новости
          </Link>
          <Link href="/category/finance" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600">
            Финансы
          </Link>
          <Link href="/category/sport" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600">
            Спорт
          </Link>
          <Link href="/category/it" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600">
            IT
          </Link>
          <Link href="/category/kazakhstan" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600">
            Казахстан
          </Link>
        </div>
      )}
    </header>
  );
}
