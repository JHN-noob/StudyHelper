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
        "rounded-[28px] border p-5 shadow-[0_16px_30px_rgba(31,26,21,0.06)]",
        tone === "accent"
          ? "border-transparent bg-accent text-white"
          : "border-border bg-surface text-foreground",
      )}
    >
      <p
        className={cn(
          "text-sm font-medium",
          tone === "accent" ? "text-white/78" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p
        className={cn(
          "mt-2 text-sm",
          tone === "accent" ? "text-white/82" : "text-muted-foreground",
        )}
      >
        {helper}
      </p>
    </article>
  );
}
