import type { ReactNode } from "react";
import { formatMinutesKorean, formatStudyDate } from "@/lib/format";
import type { StudyRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type RecordCardProps = {
  record: StudyRecord;
  showAction?: boolean;
  actionLabel?: string;
  onAction?: (record: StudyRecord) => void;
  actions?: ReactNode;
};

export function RecordCard({
  record,
  showAction = true,
  actionLabel = "기록 삭제",
  onAction,
  actions,
}: RecordCardProps) {
  const hasContent = record.content.trim().length > 0;

  return (
    <article className="relative overflow-hidden rounded-[26px] border border-border bg-surface p-5 shadow-[0_10px_24px_rgba(34,29,24,0.05)]">
      <div className="pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-full bg-accent-soft/40 blur-2xl" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            {formatStudyDate(record.studyDate)}
          </p>
          <h3
            className={cn(
              "mt-2 text-[15px] leading-7",
              hasContent
                ? "font-semibold text-foreground"
                : "font-medium text-muted-foreground",
            )}
          >
            {hasContent ? record.content : "메모 없음"}
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

        {actions ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {actions}
          </div>
        ) : showAction ? (
          <button
            type="button"
            onClick={() => onAction?.(record)}
            disabled={!onAction}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-full border border-border bg-surface-muted px-4 text-sm font-medium text-muted-foreground",
              onAction
                ? "cursor-pointer transition hover:border-foreground hover:text-foreground"
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
