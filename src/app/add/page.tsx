"use client";

import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useStudyRecords } from "@/components/providers/study-records-provider";
import { RecordForm } from "@/components/records/record-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { PageHeading } from "@/components/ui/page-heading";
import { SummaryPanel } from "@/components/ui/summary-panel";
import { formatMinutesKorean } from "@/lib/format";
import {
  getRecentRecords,
  getSubjectTotals,
  getTodayTotalMinutes,
} from "@/lib/stats";

const fallbackSubjects = ["알고리즘", "영어", "React", "SQL"];

export default function AddPage() {
  const searchParams = useSearchParams();
  const { records, errorMessage, isHydrated, storageMode } = useStudyRecords();
  const editId = searchParams.get("edit");
  const recordToEdit = editId
    ? records.find((record) => record.id === editId) ?? null
    : null;
  const isEditMode = Boolean(editId);
  const recentRecords = getRecentRecords(records, 4);
  const suggestedSubjects = getSubjectTotals(records)
    .slice(0, 4)
    .map((subject) => subject.subject);
  const todayTotalMinutes = getTodayTotalMinutes(records);
  const hasRecords = records.length > 0;
  const headingDescription = isEditMode
    ? "선택한 기록을 다시 열어 날짜, 과목, 공부 시간, 메모를 바로 수정할 수 있어요."
    : storageMode === "supabase"
      ? "날짜, 과목, 공부 시간만 입력해도 익명 세션에 바로 저장되고 다른 화면의 통계에도 바로 반영돼요."
      : errorMessage ||
        "Supabase 연결이 불안정해서 지금은 기록을 저장할 수 없어요.";

  if (isEditMode && !isHydrated) {
    return (
      <AppShell>
        <PageHeading
          eyebrow="Edit Record"
          title="수정할 기록을 불러오는 중이에요."
          description="현재 세션에서 선택한 공부 기록을 찾고 있어요."
          actions={
            <Button href="/records" variant="secondary">
              기록 리스트 보기
            </Button>
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
          description="이미 삭제했거나 현재 세션에서 접근할 수 없는 기록일 수 있어요."
          actions={
            <Button href="/records" variant="primary">
              기록 리스트로 돌아가기
            </Button>
          }
        />
        <Panel className="gap-4">
          <EmptyState
            title="다시 선택해주세요."
            description="기록 목록으로 돌아가 수정할 카드를 다시 선택하면 바로 이어서 편집할 수 있어요."
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
            ? "기존 공부 기록을 더 정확하게 다듬어보세요."
            : "이번 공부를 한 장의 카드처럼 빠르게 남겨보세요."
        }
        description={headingDescription}
        actions={
          <Button href="/records" variant="secondary">
            {isEditMode ? "기록 리스트로 돌아가기" : "기록 리스트 보기"}
          </Button>
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
          <SummaryPanel
            tone="muted"
            eyebrow={isEditMode ? "수정 전에 보는 요약" : "입력 전에 보는 요약"}
            title={
              isEditMode
                ? "수정한 내용은 저장 직후 통계에 반영돼요."
                : `오늘은 이미 ${formatMinutesKorean(todayTotalMinutes)} 공부했어요.`
            }
            description={
              isEditMode
                ? "과목, 시간, 메모를 조금만 바꿔도 홈과 통계 카드가 바로 다시 계산돼요."
                : storageMode === "supabase"
                  ? "짧은 메모만 적어도 나중에 복습할 때 맥락이 더 잘 떠올라요. 메모가 없어도 저장은 가능해요."
                  : "연결이 복구되면 같은 화면에서 다시 저장할 수 있어요. 지금은 입력은 가능해도 저장이 막혀 있어요."
            }
          />

          <SummaryPanel
            eyebrow={isEditMode ? "현재 수정 중인 기록" : "최근 입력 예시"}
            title={
              isEditMode
                ? "이 기록을 기준으로 값을 조정해보세요."
                : "방금 남긴 기록은 이런 카드로 보여요."
            }
          >
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
                description="아직 저장된 기록이 없어서 예시 카드 대신 안내를 보여드리고 있어요. 짧은 메모나 공부 시간만 입력해도 충분해요."
              />
            )}
          </SummaryPanel>
        </div>
      </section>
    </AppShell>
  );
}
