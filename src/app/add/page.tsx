"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useStudyRecords } from "@/components/providers/study-records-provider";
import { RecordForm } from "@/components/records/record-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { PageHeading } from "@/components/ui/page-heading";
import { formatMinutesKorean } from "@/lib/format";
import { getRecentRecords, getSubjectTotals, getTodayTotalMinutes } from "@/lib/stats";

const fallbackSubjects = ["알고리즘", "영어", "React", "SQL"];

export default function AddPage() {
  const searchParams = useSearchParams();
  const { records, errorMessage, isHydrated, storageMode } = useStudyRecords();
  const editId = searchParams.get("edit");
  const recordToEdit = editId
    ? records.find((record) => record.id === editId) ?? null
    : null;
  const isEditMode = Boolean(editId);
  const recentRecords = getRecentRecords(records, 2);
  const suggestedSubjects = getSubjectTotals(records)
    .slice(0, 4)
    .map((subject) => subject.subject);
  const todayTotalMinutes = getTodayTotalMinutes(records);
  const hasRecords = records.length > 0;
  const headingDescription =
    isEditMode
      ? "선택한 기록을 다시 열어 날짜, 과목, 공부 시간, 메모를 바로 수정할 수 있습니다."
      : storageMode === "supabase"
        ? "날짜, 과목, 공부 시간, 공부 내용을 입력하면 익명 세션에 바로 저장되고 다른 화면 통계에도 즉시 반영됩니다."
        : errorMessage ||
          "Supabase 연결에 실패해서 지금은 기록을 저장할 수 없어요.";

  if (isEditMode && !isHydrated) {
    return (
      <AppShell>
        <PageHeading
          eyebrow="Edit Record"
          title="수정할 기록을 불러오는 중이에요."
          description="잠시 후 현재 세션에서 선택한 공부 기록을 편집할 수 있습니다."
          actions={
            <Link
              href="/records"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface-muted px-5 text-sm font-semibold text-foreground transition hover:bg-surface"
            >
              기록 리스트 보기
            </Link>
          }
        />
      </AppShell>
    );
  }

  if (isEditMode && !recordToEdit) {
    return (
      <AppShell>
        <PageHeading
          eyebrow="Edit Record"
          title="수정할 기록을 찾지 못했어요."
          description="이미 삭제되었거나 현재 세션에서 접근할 수 없는 기록일 수 있습니다."
          actions={
            <Link
              href="/records"
              className="ui-action-solid inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition"
            >
              기록 리스트로 돌아가기
            </Link>
          }
        />
        <Panel className="gap-4">
          <EmptyState
            title="다시 선택해 주세요."
            description="기록 목록으로 돌아가서 수정할 카드를 다시 선택하면 편집 화면을 열 수 있습니다."
          />
        </Panel>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeading
        eyebrow={isEditMode ? "Edit Record" : "Add Record"}
        title={
          isEditMode
            ? "기존 공부 기록을 가볍게 다듬어 보세요."
            : "한 번의 공부를 한 장의 카드처럼 빠르게 남기세요."
        }
        description={headingDescription}
        actions={
          <Link
            href={isEditMode ? "/records" : "/records"}
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface-muted px-5 text-sm font-semibold text-foreground transition hover:bg-surface"
          >
            {isEditMode ? "기록 리스트로 돌아가기" : "기록 리스트 보기"}
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <RecordForm
          key={isEditMode ? recordToEdit?.id ?? "edit-pending" : "create-record"}
          mode={isEditMode ? "edit" : "create"}
          initialRecord={recordToEdit}
          suggestedSubjects={
            suggestedSubjects.length > 0 ? suggestedSubjects : fallbackSubjects
          }
        />

        <div className="grid gap-4">
          <Panel tone="muted" className="gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isEditMode ? "수정 전에 보는 요약" : "입력 전에 보는 요약"}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                {isEditMode
                  ? "수정한 내용도 저장 즉시 통계에 반영됩니다."
                  : `오늘은 이미 ${formatMinutesKorean(todayTotalMinutes)} 공부했어요.`}
              </h2>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              {isEditMode
                ? "과목, 공부 시간, 메모를 조금만 다듬어도 홈과 통계 카드가 바로 다시 계산됩니다."
                : storageMode === "supabase"
                  ? "한 세션을 기록할 때는 공부 주제와 실제로 한 내용을 짧게 남기면 나중에 통계와 추천 품질을 높이기 좋습니다."
                  : "연결이 복구되면 이 폼에서 다시 저장할 수 있어요. 지금은 입력은 가능하지만 저장은 막아둔 상태입니다."}
            </p>
          </Panel>

          <Panel className="gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isEditMode ? "현재 수정 중인 기록" : "최근 입력 예시"}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                {isEditMode ? "이 기록을 기준으로 값을 조정해 보세요." : "이런 밀도의 메모면 충분합니다."}
              </h2>
            </div>

            {isEditMode && recordToEdit ? (
              <div className="rounded-[22px] border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    {recordToEdit.subject}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatMinutesKorean(recordToEdit.durationMinutes)}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {recordToEdit.content || "메모 없음"}
                </p>
              </div>
            ) : hasRecords ? (
              <div className="grid gap-3">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-[22px] border border-border bg-surface p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">
                        {record.subject}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {formatMinutesKorean(record.durationMinutes)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {record.content || "메모 없음"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="첫 기록을 기다리고 있어요."
                description="아직 저장된 기록이 없어서 예시 카드 대신 가이드를 보여주고 있습니다. 한 줄 메모와 공부 시간만 입력해도 충분히 유용한 통계를 만들 수 있어요."
              />
            )}
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}
