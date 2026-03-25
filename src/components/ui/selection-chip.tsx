import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SelectionChipProps = {
  active?: boolean;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function SelectionChip({
  active = false,
  children,
  className,
  type = "button",
  ...props
}: SelectionChipProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "ui-tab-active"
          : "border-border bg-surface-muted text-foreground hover:border-foreground hover:bg-surface",
        className,
      )}
    >
      {children}
    </button>
  );
}
