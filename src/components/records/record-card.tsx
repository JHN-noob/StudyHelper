import { formatMinutesKorean, formatStudyDate } from "@/lib/format";
import type { StudyRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type RecordCardProps = {
  record: StudyRecord;
  showAction?: boolean;
  actionLabel?: string;
  onAction?: (record: StudyRecord) => void;
};

export function RecordCard({
  record,
  showAction = true,
  actionLabel = "기록 삭제",
  onAction,
}: RecordCardProps) {
  return (
    <article className="rounded-[28px] border border-border bg-surface p-5 shadow-[0_16px_30px_rgba(31,26,21,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            {formatStudyDate(record.studyDate)}
          </p>
          <h3 className="mt-2 text-base font-semibold leading-7 text-foreground">
            {record.content}
          </h3>
        </div>

        <span className="inline-flex shrink-0 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-semibold text-foreground">
          {record.subject}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
          <span>{formatMinutesKorean(record.durationMinutes)} 집중</span>
        </div>

        {showAction ? (
          <button
            type="button"
            onClick={() => onAction?.(record)}
            disabled={!onAction}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-medium text-muted-foreground",
              onAction
                ? "cursor-pointer transition hover:border-accent hover:text-accent"
                : "cursor-not-allowed opacity-80",
            )}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}
