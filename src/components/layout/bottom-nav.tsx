"use client";

import type { JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: () => JSX.Element;
};

const navItems: NavItem[] = [
  { href: "/", label: "홈", icon: renderHomeIcon },
  { href: "/add", label: "추가", icon: renderAddIcon },
  { href: "/records", label: "기록", icon: renderListIcon },
  { href: "/stats", label: "통계", icon: renderStatsIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4">
      <nav className="pointer-events-auto mx-auto flex max-w-md items-center gap-1 rounded-[30px] border border-white/12 bg-[rgba(53,48,43,0.88)] p-2 shadow-[0_16px_36px_rgba(53,40,30,0.16)] backdrop-blur xl:max-w-lg">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-2 rounded-[20px] px-3 py-3 text-[12px] font-medium transition duration-200",
                isActive
                  ? "ui-tab-active"
                  : "ui-tab-inactive",
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                {item.icon()}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function renderHomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5.5 9.8V21h13V9.8" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function renderAddIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
      <path d="M4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" />
    </svg>
  );
}

function renderListIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 7h11" />
      <path d="M8 12h11" />
      <path d="M8 17h11" />
      <path d="M4.5 7h.01" />
      <path d="M4.5 12h.01" />
      <path d="M4.5 17h.01" />
    </svg>
  );
}

function renderStatsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 20V11" />
      <path d="M12 20V5" />
      <path d="M19 20v-8" />
      <path d="M3 20h18" />
    </svg>
  );
}
