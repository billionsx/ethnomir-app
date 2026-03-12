import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'Этномир',
  description: 'Этномир — крупнейший этнографический парк России',
  robots: { index: false, follow: false },
  keywords: 'Этномир, парк, этнографический, музей, Калуга',
  openGraph: {
    title: 'Этномир — крупнейший этнографический парк России',
    description: 'Погружение в культуры мира. Билеты, жильё, экскурсии, мастер-классы.',
    type: 'website',
    locale: 'ru_RU',
  },
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>
}
