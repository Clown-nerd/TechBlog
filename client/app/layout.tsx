import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bash n Build - Tech Blog',
  description: 'A tech blog targeting the Kenyan and pan-African developer community.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Fonts — must match style.css: Fraunces (display), IBM Plex Sans (body), IBM Plex Mono (code) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
