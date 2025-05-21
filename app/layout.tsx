// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import Providers from './providers'
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export const metadata: Metadata = {
  title: 'Facturation',
  description: 'App de gestion de factures',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
