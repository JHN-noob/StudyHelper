import type { DailyStudySummary } from "@/lib/types";

type WeeklyChartProps = {
  points: DailyStudySummary[];
};

export function WeeklyChart({ points }: WeeklyChartProps) {
  const maxMinutes = Math.max(...points.map((point) => point.minutes), 1);

  return (
    <div className="grid grid-cols-7 gap-2 sm:gap-3">
      {points.map((point) => {
        const barHeight = Math.max((point.minutes / maxMinutes) * 100, 10);

        return (
          <div key={point.date} className="flex flex-col items-center gap-2">
            <div className="flex h-40 w-full items-end rounded-[24px] bg-surface-muted p-2">
              <div
                className={`w-full rounded-[16px] ${
                  point.isToday ? "bg-warning" : "bg-accent"
                }`}
                style={{ height: `${barHeight}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground">
              {point.label}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              {point.minutes > 0 ? `${point.minutes}m` : "-"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
