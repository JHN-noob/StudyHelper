import type { Metadata } from "next";
import { StudyRecordsProvider } from "@/components/providers/study-records-provider";
import "./globals.css";

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
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StudyRecordsProvider>{children}</StudyRecordsProvider>
      </body>
    </html>
  );
}
