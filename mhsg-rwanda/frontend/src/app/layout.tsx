import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import './globals.css'
import type { Metadata } from 'next'
import { Providers } from '@/components/layout/Providers'

export const metadata: Metadata = {
  title: 'MHSG Rwanda — Service Marketplace',
  description: 'Connect with garages, mechanics, spare-parts sellers and home technicians in Rwanda.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
