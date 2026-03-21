import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniVerse",
  description: "All-in-one LMS and Campus Portal for educational institutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`
        ${inter.variable}
        min-h-screen antialiased
      `}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
