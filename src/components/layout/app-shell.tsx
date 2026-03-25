"use client";

import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useGuestProfile } from "@/components/providers/guest-profile-provider";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { anonymousNickname } = useGuestProfile();

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/60 to-transparent" />
        <div className="absolute -left-14 top-[-88px] h-56 w-56 rounded-full bg-[rgba(95,107,93,0.18)] blur-3xl" />
        <div className="absolute right-[-36px] top-[-72px] h-48 w-48 rounded-full bg-[rgba(180,135,83,0.16)] blur-3xl" />
      </div>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:px-8">
        <header className="relative z-10 mx-auto mb-4 flex w-full max-w-6xl items-center justify-between gap-3 rounded-[24px] border border-border bg-surface px-4 py-3 shadow-[0_10px_24px_rgba(34,29,24,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent-strong)]">
                My Nickname
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground sm:text-[15px]">
                {anonymousNickname}
              </p>
            </div>
            <div className="rounded-full border border-[#1f1d1a] bg-[#1f1d1a] px-3 py-1.5 text-xs font-medium text-[#fbfaf8] dark:border-[#f2efea] dark:bg-[#f2efea] dark:text-[#1b1a18]">
              익명 세션
            </div>
          </div>
          <Button href="/settings" size="compact" variant="secondary">
            설정
          </Button>
        </header>
        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 sm:gap-5">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
