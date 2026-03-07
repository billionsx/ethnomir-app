import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'ЭтноМир', description: 'Этнографический парк-музей' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>
}
