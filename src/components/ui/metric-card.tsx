import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  tone?: "default" | "accent";
};

export function MetricCard({
  label,
  value,
  helper,
  tone = "default",
}: MetricCardProps) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[26px] border p-5 shadow-[0_10px_22px_rgba(34,29,24,0.05)]",
        tone === "accent"
          ? "border-transparent bg-[#1f1d1a] text-[#fbfaf8]"
          : "border-border bg-surface text-foreground",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-full blur-2xl",
          tone === "accent" ? "bg-white/6" : "bg-accent-soft/55",
        )}
      />
      <p
        className={cn(
          "relative text-sm font-medium",
          tone === "accent" ? "text-white/72" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p className="relative mt-3 text-[2rem] font-semibold tracking-tight">
        {value}
      </p>
      <p
        className={cn(
          "relative mt-2 text-sm",
          tone === "accent" ? "text-white/78" : "text-muted-foreground",
        )}
      >
        {helper}
      </p>
    </article>
  );
}
