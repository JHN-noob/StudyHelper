"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useStudyRecords } from "@/components/providers/study-records-provider";
import { RecordCard } from "@/components/records/record-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { SelectionChip } from "@/components/ui/selection-chip";
import { SummaryPanel } from "@/components/ui/summary-panel";
import { formatMinutesKorean } from "@/lib/format";
import { getSubjectTotals, getTotalMinutes } from "@/lib/stats";
import type { StudyRecord } from "@/lib/types";

export default function RecordsPage() {
  const { records, errorMessage, isHydrated, deleteRecord, storageMode } =
    useStudyRecords();
  const [selectedSubject, setSelectedSubject] = useState("전체");
  const subjectTotals = getSubjectTotals(records);
  const totalMinutes = getTotalMinutes(records);
  const filterOptions = ["전체", ...subjectTotals.map((subject) => subject.subject)];
  const visibleRecords =
    selectedSubject === "전체"
      ? records
      : records.filter((record) => record.subject === selectedSubject);
  const headingDescription =
    storageMode === "supabase"
      ? "익명 세션으로 저장한 공부 기록을 모아보고, 필요한 기록은 바로 수정하거나 삭제할 수 있어요."
      : errorMessage ||
        "Supabase 연결이 불안정해서 지금은 기록을 불러오거나 수정할 수 없어요.";

  async function handleDelete(record: StudyRecord) {
    const shouldDelete = window.confirm(
      storageMode === "supabase"
        ? `"${record.subject}" 기록을 삭제할까요? 지금 세션에 저장된 데이터에서도 바로 지워져요.`
        : `"${record.subject}" 기록은 지금 삭제할 수 없어요. 연결이 복구된 뒤 다시 시도해주세요.`,
    );

    if (!shouldDelete) {
      return;
    }

    const result = await deleteRecord(record.id);

    if (!result.ok) {
      window.alert(result.errorMessage);
    }
  }

  return (
    <AppShell>
      <PageHeading
        eyebrow="Records"
        title="공부 세션을 한눈에 모아보고 필요한 기록은 바로 정리해보세요."
        description={headingDescription}
        actions={
          <Button href="/add" variant="primary">
            새 기록 추가
          </Button>
        }
      />

      {!isHydrated ? (
        <SummaryPanel
          eyebrow="로딩 중"
          title="공부 기록을 불러오는 중이에요."
          description="현재 세션에서 확인할 수 있는 공부 기록을 준비하고 있어요."
        />
      ) : !records.length ? (
        <SummaryPanel
          eyebrow="Empty"
          title="저장한 기록이 아직 없어요."
          description="공부 기록을 하나만 추가해도 이 페이지에서 바로 확인하고 수정할 수 있어요."
        >
          {storageMode === "supabase" ? (
            <Button href="/add" variant="primary" size="sm">
              첫 기록 추가하기
            </Button>
          ) : null}
        </SummaryPanel>
      ) : (
        <section className="grid gap-4 xl:grid-cols-[0.84fr_1.16fr]">
          <div className="grid gap-4">
            <SummaryPanel
              tone="muted"
              eyebrow="리스트 요약"
              title={`총 ${records.length}개의 세션, ${formatMinutesKorean(totalMinutes)} 누적`}
              description={
                storageMode === "supabase"
                  ? "지금 보는 리스트는 현재 익명 세션에 저장된 기록 기준이에요."
                  : errorMessage ||
                    "연결이 불안정해서 목록이 정상적으로 갱신되지 않을 수 있어요."
              }
            />

            <SummaryPanel
              eyebrow="과목 필터"
              title="원하는 과목만 빠르게 보기"
            >
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((subject) => (
                  <SelectionChip
                    key={subject}
                    active={selectedSubject === subject}
                    onClick={() => setSelectedSubject(subject)}
                  >
                    {subject}
                  </SelectionChip>
                ))}
              </div>
            </SummaryPanel>
          </div>

          <div className="grid gap-3">
            {visibleRecords.length > 0 ? (
              visibleRecords.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  actions={
                    <>
                      <Button href={`/add?edit=${record.id}`} size="compact" variant="primary">
                        기록 수정
                      </Button>
                      <Button
                        type="button"
                        size="compact"
                        variant="secondary"
                        onClick={() => void handleDelete(record)}
                      >
                        기록 삭제
                      </Button>
                    </>
                  }
                />
              ))
            ) : (
              <EmptyState
                title="선택한 과목의 기록이 없어요."
                description="필터를 전체로 바꾸거나 다른 과목을 선택해보세요."
              />
            )}
          </div>
        </section>
      )}
    </AppShell>
  );
}
