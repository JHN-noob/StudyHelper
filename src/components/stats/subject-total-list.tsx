import { formatMinutesKorean } from "@/lib/format";
import type { SubjectTotal } from "@/lib/types";

type SubjectTotalListProps = {
  totals: SubjectTotal[];
};

export function SubjectTotalList({ totals }: SubjectTotalListProps) {
  const maxMinutes = totals[0]?.minutes ?? 1;

  return (
    <div className="grid gap-4">
      {totals.map((subject) => {
        const ratio = Math.max((subject.minutes / maxMinutes) * 100, 12);

        return (
          <div key={subject.subject} className="grid gap-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {subject.subject}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {subject.sessions}회 기록
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatMinutesKorean(subject.minutes)}
              </p>
            </div>

            <div className="h-2.5 rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${ratio}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
