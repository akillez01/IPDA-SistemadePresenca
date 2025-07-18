import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import { ClientLayout } from './client-layout';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ipda.app.br'),
  title: 'IPDA - Sistema de Presença',
  description: 'Sistema de controle de presença para Igreja Pentecostal Deus é Amor',
  icons: {
    icon: '/images/logodeuseamor.png',
    shortcut: '/images/logodeuseamor.png',
    apple: '/images/logodeuseamor.png',
  },
  openGraph: {
    title: 'IPDA - Sistema de Presença',
    description: 'Sistema de controle de presença para Igreja Pentecostal Deus é Amor',
    images: ['/images/logodeuseamor.png'],
    url: '/',
    siteName: 'IPDA - Sistema de Presença',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IPDA - Sistema de Presença',
    description: 'Sistema de controle de presença para Igreja Pentecostal Deus é Amor',
    images: ['/images/logodeuseamor.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/png" href="/images/logodeuseamor.png" />
        <link rel="apple-touch-icon" href="/images/logodeuseamor.png" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="IPDA Presença" />
      </head>
      <body className="font-body bg-background antialiased">
        {process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID} />
        )}
        <ClientLayout>{children}</ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
