import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(95,107,93,0.12),transparent_50%),radial-gradient(circle_at_top_right,rgba(180,135,83,0.08),transparent_36%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:px-8">
        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 sm:gap-5">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
