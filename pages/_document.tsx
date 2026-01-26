import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ru" suppressHydrationWarning>
      <Head>
        <meta name="facebook-domain-verification" content="61emn4o3d20at0o73tcdcb7bcbnqrn" />
        <link rel="dns-prefetch" href="https://www.tradingview-widget.com" />
        <link rel="dns-prefetch" href="https://s3.tradingview.com" />
        <link rel="preconnect" href="https://www.tradingview-widget.com" />
        <link rel="preconnect" href="https://s3.tradingview.com" />
      </Head>
      <body className="antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WJH6SMCV"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
