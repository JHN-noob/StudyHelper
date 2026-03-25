import type { ReactNode } from "react";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

type SummaryPanelProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  tone?: "default" | "muted" | "accent";
};

export function SummaryPanel({
  eyebrow,
  title,
  description,
  children,
  className,
  tone = "default",
}: SummaryPanelProps) {
  const isAccent = tone === "accent";

  return (
    <Panel tone={tone} className={cn("gap-4", className)}>
      <div>
        <p
          className={cn(
            "text-sm font-medium",
            isAccent ? "text-white/72" : "text-muted-foreground",
          )}
        >
          {eyebrow}
        </p>
        <h2
          className={cn(
            "mt-1 text-xl font-semibold",
            isAccent ? "text-white" : "text-foreground",
          )}
        >
          {title}
        </h2>
      </div>

      {description ? (
        <p
          className={cn(
            "text-sm leading-7",
            isAccent ? "text-white/82" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}

      {children}
    </Panel>
  );
}
