import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { FootballBg } from '@/components/ui/FootballBg'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'OffThePitch — Live Football Calls. World Cup 2026.',
  description: 'Back your football instinct with live conviction calls during World Cup 2026. No gambling — pure match intelligence.',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  themeColor: '#080811',
  width: 'device-width',
  initialScale: 1,
}

// Inline script: apply saved theme before first paint to prevent flash
const themeScript = `(function(){try{var t=localStorage.getItem('otp-theme');if(t){var d=JSON.parse(t);if(d&&d.state&&d.state.theme){document.documentElement.setAttribute('data-theme',d.state.theme);}}}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full antialiased">
        <FootballBg />
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </body>
    </html>
  )
}
