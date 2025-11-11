import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import ThemeToggle from "@/components/ThemeToggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Trading Strategy Backtesting Platform",
  description: "Upload OHLC data, configure strategy parameters, and run backtests"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center">
                    <Link 
                      href="/" 
                      className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      📊 Trading Backtest Platform
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="/history"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>History</span>
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
            <ThemeToggle />
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
