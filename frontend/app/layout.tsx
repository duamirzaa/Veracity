import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import ErrorOverlaySuppressor from '@/components/ErrorOverlaySuppressor'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Project Veracity - Software Defect Prediction',
  description: 'Comprehensive decision-support system for predicting software defects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={plusJakartaSans.className} suppressHydrationWarning>
        <ErrorOverlaySuppressor />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
