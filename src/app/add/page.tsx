"use client";

import Link from "next/link";
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
  const { records } = useStudyRecords();
  const recentRecords = getRecentRecords(records, 2);
  const suggestedSubjects = getSubjectTotals(records)
    .slice(0, 4)
    .map((subject) => subject.subject);
  const todayTotalMinutes = getTodayTotalMinutes(records);
  const hasRecords = records.length > 0;

  return (
    <AppShell>
      <PageHeading
        eyebrow="Add Record"
        title="한 번의 공부를 한 장의 카드처럼 빠르게 남기세요."
        description="모바일 입력을 기준으로 날짜, 과목, 공부 시간, 공부 내용을 자연스럽게 기록하고 즉시 통계에 반영되도록 구성했습니다."
        actions={
          <Link
            href="/records"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface-muted px-5 text-sm font-semibold text-foreground transition hover:bg-surface"
          >
            기록 리스트 보기
          </Link>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <RecordForm
          suggestedSubjects={
            suggestedSubjects.length > 0 ? suggestedSubjects : fallbackSubjects
          }
        />

        <div className="grid gap-4">
          <Panel tone="muted" className="gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                입력 전에 보는 요약
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                오늘은 이미 {formatMinutesKorean(todayTotalMinutes)}를 공부했어요.
              </h2>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              한 세션을 기록할 때는 공부 주제와 실제로 한 내용을 짧게 남기면
              나중에 통계와 추천 품질을 높이기 좋습니다.
            </p>
          </Panel>

          <Panel className="gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                최근 입력 예시
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                이런 밀도의 메모면 충분합니다
              </h2>
            </div>

            {hasRecords ? (
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
                      {record.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="첫 기록을 기다리고 있어요"
                description="아직 저장된 기록이 없어서 예시 카드 대신 가이드를 보여주고 있습니다. 한 줄 메모와 공부 시간만 입력해도 충분히 유용한 통계를 만들 수 있어요."
              />
            )}
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}
