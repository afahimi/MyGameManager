import type { Metadata } from 'next'
//import { Inter } from 'next/font/google/index'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'

import store from './store.ts'
import { Provider } from 'react-redux'

import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com"></link>
        <link href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400&display=swap" rel="stylesheet"></link>
      </head>
        <body className={inter.className}>{children}</body>
    </html>
  )
}
