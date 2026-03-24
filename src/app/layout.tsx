import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StudyRecordsProvider } from "@/components/providers/study-records-provider";
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
  title: {
    default: "Study Helper",
    template: "%s | Study Helper",
  },
  description: "A mobile-first study tracker dashboard for logging sessions, viewing records, and checking simple stats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StudyRecordsProvider>{children}</StudyRecordsProvider>
      </body>
    </html>
  );
}
