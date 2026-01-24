import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'Institute Service Portal',
  description: 'Complete Institute Service Portal with role-based authentication',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
