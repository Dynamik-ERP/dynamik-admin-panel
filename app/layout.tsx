import type { Metadata, Viewport } from 'next'
import { type PropsWithChildren } from 'react'
import PwaUpdateBanner from '@/components/pwa/PwaUpdateBanner'
import './styles.css'

const APP_NAME = 'Dynamik Admin'
const APP_DEFAULT_TITLE = 'Dynamik Admin Panel'
const APP_TITLE_TEMPLATE = '%s | Dynamik Admin'
const APP_DESCRIPTION = 'Dynamik ERP Admin Panel for furniture manufacturing management.'

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dynamik Admin',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
  },
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#FF6B00',
  colorScheme: 'dark',
}

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className="antialiased">
      <body className="bg-[#0B0C0E] text-gray-300">
        {children}
        <PwaUpdateBanner />
      </body>
    </html>
  )
}
