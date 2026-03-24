import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = {
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted" | "accent";
};

export function Panel({
  children,
  className,
  tone = "default",
}: PanelProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden flex flex-col rounded-[28px] border p-5 shadow-[0_10px_24px_rgba(34,29,24,0.05)] sm:p-6",
        tone === "accent"
          ? "border-transparent bg-[#1f1d1a] text-[#fbfaf8]"
          : tone === "muted"
            ? "border-border bg-surface-muted text-foreground"
            : "border-border bg-surface text-foreground",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-6 top-0 h-px",
          tone === "accent"
            ? "bg-gradient-to-r from-transparent via-white/10 to-transparent"
            : "bg-gradient-to-r from-transparent via-white/80 to-transparent",
        )}
      />
      {children}
    </section>
  );
}
