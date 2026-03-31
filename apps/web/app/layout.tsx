import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#1a1a1e',
}

export const metadata: Metadata = {
  title: 'Этномир',
  description: 'Этномир — крупнейший развлекательно-познавательный парк РФ',
  robots: { index: false, follow: false },
  keywords: 'Этномир, парк, этнографический, музей, Калуга',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Этномир',
  },
  openGraph: {
    title: 'Этномир — крупнейший развлекательно-познавательный парк РФ',
    description: 'Погружение в культуры мира. Билеты, жильё, экскурсии, мастер-классы.',
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary',
    title: 'Этномир — крупнейший развлекательно-познавательный парк РФ',
    description: 'Погружение в культуры мира. Билеты, жильё, экскурсии, мастер-классы.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '64x64', type: 'image/x-icon' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-180x180.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/icon-167x167.png', sizes: '167x167', type: 'image/png' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>
}
