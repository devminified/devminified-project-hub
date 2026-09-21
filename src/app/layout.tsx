import type { Metadata } from "next";
import { Archivo, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const generalSans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "./fonts/GeneralSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/GeneralSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/GeneralSans-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/GeneralSans-Bold.woff2", weight: "700", style: "normal" },
  ],
});

// Devminified design-system faces (see "Crispers" design files): Poppins
// carries headings and buttons, Archivo carries body copy. They are exposed as
// variables only — the app still renders in General Sans; the sign-in screen
// opts in via `font-display` / `font-body`.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Devminified Project Hub",
  description:
    "Browse Devminified projects and their environments, docs, and readmes.",
  icons: {
    icon: "/devminified-favicon.png",
    apple: "/devminified-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${generalSans.variable} ${poppins.variable} ${archivo.variable} h-full antialiased`}
    >
      {/* Browser extensions inject attributes (e.g. __processed_…) onto <body>
          before React hydrates, causing a benign hydration mismatch warning.
          suppressHydrationWarning silences it for this element only. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
