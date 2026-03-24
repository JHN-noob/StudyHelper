"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useStudyRecords } from "@/components/providers/study-records-provider";
import { RecordCard } from "@/components/records/record-card";
import { SubjectTotalList } from "@/components/stats/subject-total-list";
import { WeeklyChart } from "@/components/stats/weekly-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeading } from "@/components/ui/page-heading";
import { Panel } from "@/components/ui/panel";
import { formatMinutesKorean } from "@/lib/format";
import {
  buildStudyRecommendation,
  getActiveSubjectCount,
  getLast7DaysSummary,
  getRecentRecords,
  getRecordsForLastDays,
  getSubjectTotals,
  getTodayTotalMinutes,
  getTotalMinutes,
} from "@/lib/stats";

export default function Home() {
  const { records, isHydrated } = useStudyRecords();
  const recentWeekRecords = getRecordsForLastDays(records, 7);
  const weeklySummary = getLast7DaysSummary(records);
  const recentRecords = getRecentRecords(records, 3);
  const subjectTotals = getSubjectTotals(records);
  const todayTotalMinutes = getTodayTotalMinutes(records);
  const weeklyTotalMinutes = getTotalMinutes(recentWeekRecords);
  const activeSubjectCount = getActiveSubjectCount(recentWeekRecords);
  const recommendation = buildStudyRecommendation(records);
  const hasRecords = records.length > 0;
  const showEmptyState = isHydrated && !hasRecords;

  return (
    <AppShell>
      <PageHeading
        eyebrow="Study Helper"
        title="공부 흐름을 기록하고, 오늘의 우선순위를 한 화면에서 정리하세요."
        description="비로그인 상태에서도 기록 추가, 삭제, 통계 확인이 바로 되도록 브라우저 저장소 기반 MVP로 연결했습니다."
        actions={
          <>
            <Link
              href="/add"
              className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              공부 기록 추가
            </Link>
            <Link
              href="/records"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
            >
              기록 리스트 보기
            </Link>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="오늘 공부 시간"
          value={formatMinutesKorean(todayTotalMinutes)}
          helper={isHydrated ? "오늘 쌓인 총 집중 시간" : "브라우저 기록 불러오는 중"}
          tone="accent"
        />
        <MetricCard
          label="최근 7일 누적"
          value={formatMinutesKorean(weeklyTotalMinutes)}
          helper="최근 일주일 원본 기록 합산"
        />
        <MetricCard
          label="활성 과목 수"
          value={`${activeSubjectCount}개`}
          helper="최근 7일 안에 공부한 주제"
        />
      </section>

      {showEmptyState ? (
        <Panel className="gap-4">
          <EmptyState
            title="아직 저장된 공부 기록이 없어요"
            description="먼저 한 세션만 기록해도 홈 대시보드, 최근 기록, 통계, 추천 카드가 바로 살아납니다. 지금은 로그인 없이 이 브라우저에만 저장됩니다."
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
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel className="gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                지난 7일 흐름
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                하루 단위 집중 시간
              </h2>
            </div>
            <Link
              href="/stats"
              className="text-sm font-semibold text-accent transition hover:text-accent-strong"
            >
              통계 전체 보기
            </Link>
          </div>
          <WeeklyChart points={weeklySummary} />
        </Panel>

        <Panel tone="accent" className="gap-4">
          <div>
            <p className="text-sm font-medium text-[rgba(255,255,255,0.78)]">
              AI 추천 영역
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              최근 학습 패턴 요약
            </h2>
          </div>
          <p className="text-sm leading-7 text-[rgba(255,255,255,0.88)]">
            {recommendation.summary}
          </p>
          <div className="rounded-[24px] border border-white/18 bg-white/8 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[rgba(255,255,255,0.7)]">
              Local AI
            </p>
            <p className="mt-2 text-sm leading-7 text-white">
              {recommendation.recommendation}
            </p>
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel className="gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                최근 기록
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                마지막 공부 세션
              </h2>
            </div>
            <Link
              href="/records"
              className="text-sm font-semibold text-accent transition hover:text-accent-strong"
            >
              모두 보기
            </Link>
          </div>

          {recentRecords.length > 0 ? (
            <div className="grid gap-3">
              {recentRecords.map((record) => (
                <RecordCard key={record.id} record={record} showAction={false} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="최근 기록이 아직 없어요"
              description="새 기록이 저장되면 가장 최근 공부 세션이 이 영역에 바로 표시됩니다."
            />
          )}
        </Panel>

        <Panel className="gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              과목별 누적
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              어디에 시간을 가장 많이 썼는지
            </h2>
          </div>

          {subjectTotals.length > 0 ? (
            <SubjectTotalList totals={subjectTotals.slice(0, 4)} />
          ) : (
            <EmptyState
              title="과목 통계가 아직 없어요"
              description="공부 기록이 쌓이면 어떤 과목에 시간을 많이 쓰는지 자동으로 계산됩니다."
            />
          )}
        </Panel>
      </section>
    </AppShell>
  );
}
