import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rork AI Builder - Constructeur d\'Applications IA',
  description: 'Créez des applications web modernes avec l\'intelligence artificielle. Interface intuitive, génération de code intelligente, et collaboration temps réel.',
  keywords: 'AI, application builder, code generator, web development, React, Next.js',
  authors: [{ name: 'Rork AI Builder Team' }],
  creator: 'Rork AI Builder',
  publisher: 'Rork AI Builder',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Rork AI Builder - Constructeur d\'Applications IA',
    description: 'Créez des applications web modernes avec l\'intelligence artificielle',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'Rork AI Builder',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rork AI Builder - Constructeur d\'Applications IA',
    description: 'Créez des applications web modernes avec l\'intelligence artificielle',
    creator: '@rorkaibuilder',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'bg-white shadow-lg',
          headerTitle: 'text-gray-900',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
          socialButtonsBlockButtonText: 'text-gray-700',
          formFieldInput: 'border border-gray-300 focus:border-blue-500',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
        },
      }}
    >
      <html lang="fr" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}