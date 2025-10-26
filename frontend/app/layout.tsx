import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: 'MedTrust AI - Verify Medicine Authenticity',
  description: 'Protect yourself from counterfeit drugs. Verify medicine authenticity using blockchain technology and AI-powered analysis.',
  keywords: ['medicine verification', 'blockchain', 'AI', 'counterfeit drugs', 'pharmaceutical'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}