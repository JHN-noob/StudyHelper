"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useStudyRecords } from "@/components/providers/study-records-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { formatInputDate } from "@/lib/format";

type RecordFormProps = {
  suggestedSubjects: string[];
};

const fieldClassName =
  "mt-2 h-12 w-full rounded-[18px] border border-border bg-surface px-4 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-foreground";

const textAreaClassName =
  "mt-2 min-h-36 w-full rounded-[22px] border border-border bg-surface px-4 py-3 text-[15px] leading-7 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-foreground";

export function RecordForm({ suggestedSubjects }: RecordFormProps) {
  const { addRecord, storageMode } = useStudyRecords();
  const [studyDate, setStudyDate] = useState(formatInputDate());
  const [subject, setSubject] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedSubject = subject.trim();
    const trimmedContent = content.trim();
    const parsedDuration = Number(durationMinutes);

    if (!trimmedSubject) {
      setIsSaved(false);
      setErrorMessage("과목을 먼저 입력해 주세요.");
      return;
    }

    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setIsSaved(false);
      setErrorMessage("공부 시간은 1분 이상으로 입력해 주세요.");
      return;
    }

    if (!trimmedContent) {
      setIsSaved(false);
      setErrorMessage("오늘 공부한 내용을 한 줄이라도 남겨 주세요.");
      return;
    }

    setIsSubmitting(true);

    const result = await addRecord({
      studyDate,
      subject: trimmedSubject,
      durationMinutes: parsedDuration,
      content: trimmedContent,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setIsSaved(false);
      setErrorMessage(result.errorMessage);
      return;
    }

    setDurationMinutes("");
    setContent("");
    setErrorMessage("");
    setIsSaved(true);
  }

  return (
    <Panel className="gap-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Study Form</p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">
          한 세션을 빠르게 입력하는 카드형 폼
        </h2>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground">
          최근 많이 기록한 과목
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestedSubjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => setSubject(subject)}
              className="rounded-full border border-border bg-surface-muted px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground hover:bg-white"
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      <form className="grid gap-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-foreground">공부 날짜</span>
          <input
            type="date"
            name="study_date"
            value={studyDate}
            onChange={(event) => setStudyDate(event.target.value)}
            className={fieldClassName}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
          <label className="block">
            <span className="text-sm font-medium text-foreground">과목</span>
            <input
              type="text"
              name="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="예: 알고리즘, 영어, React"
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">
              공부 시간
            </span>
            <input
              type="number"
              name="duration_minutes"
              min={0}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              placeholder="60"
              className={fieldClassName}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-foreground">
            오늘 공부한 내용
          </span>
          <textarea
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="무엇을 공부했고, 어떤 부분을 다시 봐야 하는지 간단히 적어두세요."
            className={textAreaClassName}
          />
        </label>

        {errorMessage ? (
          <EmptyState
            title="입력 확인이 필요해요"
            description={errorMessage}
          />
        ) : null}

        {isSaved ? (
          <EmptyState
            title={
              storageMode === "supabase"
                ? "기록이 익명 세션에 저장됐어요"
                : "기록이 브라우저에 저장됐어요"
            }
            description={
              storageMode === "supabase"
                ? "지금은 anonymous auth 기반이라 같은 익명 세션 안에서 기록과 통계가 바로 이어집니다."
                : "현재는 비로그인 fallback 모드라서 이 기기 브라우저의 localStorage에 저장됩니다."
            }
            actions={
              <Link
                href="/records"
                className="ui-action-solid inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition"
              >
                기록 리스트 보기
              </Link>
            }
          />
        ) : (
          <div className="rounded-[22px] border border-dashed border-border bg-surface-muted p-4">
            <p className="text-[15px] leading-7 text-muted-foreground">
              {storageMode === "supabase"
                ? "지금은 anonymous auth 기반이라 저장 버튼을 누르면 익명 세션의 Supabase 기록으로 바로 반영됩니다. 이후 목록 페이지에서 삭제하고, 통계 페이지에서 즉시 반영된 값을 확인할 수 있습니다."
                : "현재는 fallback 모드라서 저장 버튼을 누르면 이 브라우저에 바로 기록됩니다. 이후 목록 페이지에서 삭제하고, 통계 페이지에서 즉시 반영된 값을 확인할 수 있습니다."}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="ui-action-solid inline-flex h-[52px] items-center justify-center rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "저장 중..." : "공부 기록 저장"}
        </button>
      </form>
    </Panel>
  );
}
