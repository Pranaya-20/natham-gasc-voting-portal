import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Natham GASC Voting Portal",
  description: "Official Secretary and Office-Bearer Election Voting Portal for Natham Government Arts College.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full font-sans antialiased text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
