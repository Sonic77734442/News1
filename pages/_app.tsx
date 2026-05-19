import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import Analytics from '@/components/Analytics';
import ConsentBanner from '@/components/ConsentBanner';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className={inter.variable}>
        <Analytics />
        <ConsentBanner />
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  );
}
