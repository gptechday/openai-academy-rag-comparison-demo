import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/hooks/use-toast";

/**
 * Root Layout Component
 * 
 * This component serves as the application's root layout and provides:
 * - Font configuration using Geist Sans and Geist Mono fonts
 * - Application metadata for SEO and browser display
 * - Toast notification system setup
 * - Base HTML structure with language configuration
 * 
 * All pages in the application inherit from this layout to maintain consistent styling
 * and functionality throughout the application.
 */

/**
 * Configure Geist Sans as the primary font
 * Sets CSS variable --font-geist-sans for use throughout the app
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Configure Geist Mono as the monospace font
 * Sets CSS variable --font-geist-mono for code blocks and other monospaced text
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Application metadata for SEO and browser display
 */
export const metadata: Metadata = {
  title: "Vector Search vs Knowledge Graph Demo",
  description: "A demonstration comparing vector search and knowledge graph approaches for information retrieval",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
      </body>
    </html>
  );
}
