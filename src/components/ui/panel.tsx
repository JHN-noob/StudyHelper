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
        "flex flex-col rounded-[28px] border p-5 shadow-[0_16px_30px_rgba(31,26,21,0.06)] sm:p-6",
        tone === "accent"
          ? "border-transparent bg-accent text-white"
          : tone === "muted"
            ? "border-border bg-surface-muted text-foreground"
            : "border-border bg-surface text-foreground",
        className,
      )}
    >
      {children}
    </section>
  );
}
