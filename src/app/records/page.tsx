"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useStudyRecords } from "@/components/providers/study-records-provider";
import { RecordCard } from "@/components/records/record-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { PageHeading } from "@/components/ui/page-heading";
import { formatMinutesKorean } from "@/lib/format";
import { getSubjectTotals, getTotalMinutes } from "@/lib/stats";
import type { StudyRecord } from "@/lib/types";

export default function RecordsPage() {
  const { records, isHydrated, deleteRecord } = useStudyRecords();
  const [selectedSubject, setSelectedSubject] = useState("전체");
  const subjectTotals = getSubjectTotals(records);
  const totalMinutes = getTotalMinutes(records);
  const filterOptions = ["전체", ...subjectTotals.map((subject) => subject.subject)];
  const visibleRecords =
    selectedSubject === "전체"
      ? records
      : records.filter((record) => record.subject === selectedSubject);

  function handleDelete(record: StudyRecord) {
    const shouldDelete = window.confirm(
      `"${record.subject}" 기록을 삭제할까요? 이 작업은 이 브라우저에서만 지워집니다.`,
    );

    if (!shouldDelete) {
      return;
    }

    deleteRecord(record.id);
  }

  return (
    <AppShell>
      <PageHeading
        eyebrow="Records"
        title="공부 세션을 카드 단위로 모아 보고, 필요한 기록은 바로 정리하세요."
        description="비로그인 상태에서도 기록 추가와 삭제가 실제로 동작하도록 연결했습니다. 필터를 눌러 과목별로 빠르게 확인할 수 있습니다."
        actions={
          <Link
            href="/add"
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-strong"
          >
            새 기록 추가
          </Link>
        }
      />

      {!isHydrated ? (
        <Panel className="gap-4">
          <EmptyState
            title="브라우저 기록을 불러오는 중이에요"
            description="잠시 후 이 기기에 저장된 공부 기록과 삭제 가능한 리스트가 표시됩니다."
          />
        </Panel>
      ) : !records.length ? (
        <Panel className="gap-4">
          <EmptyState
            title="저장된 기록이 아직 없어요"
            description="공부 기록을 하나 추가하면 이 페이지에서 바로 확인하고 삭제할 수 있습니다."
            actions={
              <Link
                href="/add"
                className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                첫 기록 추가하기
              </Link>
            }
          />
        </Panel>
      ) : (
        <section className="grid gap-4 xl:grid-cols-[0.84fr_1.16fr]">
          <div className="grid gap-4">
            <Panel tone="muted" className="gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  리스트 요약
                </p>
                <h2 className="mt-1 text-xl font-semibold text-foreground">
                  총 {records.length}개의 세션, {formatMinutesKorean(totalMinutes)} 누적
                </h2>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">
                지금은 브라우저 저장소에만 기록을 보관하는 단계라서, 같은 기기와
                브라우저에서는 바로 이어서 조회할 수 있습니다.
              </p>
            </Panel>

            <Panel className="gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  과목 필터
                </p>
                <h2 className="mt-1 text-xl font-semibold text-foreground">
                  원하는 주제만 빠르게 보기
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setSelectedSubject(subject)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      selectedSubject === subject
                        ? "border-accent bg-accent text-white"
                        : "border-border bg-surface-muted text-foreground hover:bg-surface"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid gap-3">
            {visibleRecords.length > 0 ? (
              visibleRecords.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  actionLabel="기록 삭제"
                  onAction={handleDelete}
                />
              ))
            ) : (
              <EmptyState
                title="선택한 과목의 기록이 없어요"
                description="필터를 전체로 바꾸거나 다른 과목을 선택해 보세요."
              />
            )}
          </div>
        </section>
      )}
    </AppShell>
  );
}
