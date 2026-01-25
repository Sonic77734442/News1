import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import Analytics from '@/components/Analytics';
import ConsentBanner from '@/components/ConsentBanner';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Analytics />
      <ConsentBanner />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
