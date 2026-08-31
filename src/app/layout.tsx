import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"

import { ThemeScript } from "@/components/ui/theme"
import { MotionProvider } from "@/components/ui/motion-provider"
import { Toaster } from "@/components/ui/toast"
import "./globals.css"

const generalSans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "./fonts/GeneralSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/GeneralSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/GeneralSans-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/GeneralSans-Bold.woff2", weight: "700", style: "normal" },
  ],
})

export const metadata: Metadata = {
  title: {
    default: "Devminified Project Hub",
    template: "%s · Devminified Project Hub",
  },
  description:
    "Browse Devminified projects and their environments, docs, and readmes.",
  icons: {
    icon: "/devminified-favicon.png",
    apple: "/devminified-favicon.png",
  },
}

/**
 * `colorScheme: "light dark"` lets the UA theme form controls, scrollbars and
 * the address bar to match. The two `themeColor` entries keep mobile Safari /
 * Chrome chrome in sync with `--background` in each theme.
 */
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e18" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning: ThemeScript sets the `dark` class and
    // `color-scheme` on <html> before React hydrates. Browser extensions do
    // the same to <body>.
    <html
      lang="en"
      className={`${generalSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <MotionProvider>
          {children}
          <Toaster />
        </MotionProvider>
      </body>
    </html>
  )
}
