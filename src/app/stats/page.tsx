"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useStudyRecords } from "@/components/providers/study-records-provider";
import { SubjectTotalList } from "@/components/stats/subject-total-list";
import { WeeklyChart } from "@/components/stats/weekly-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeading } from "@/components/ui/page-heading";
import { Panel } from "@/components/ui/panel";
import { formatMinutesKorean } from "@/lib/format";
import {
  getActiveSubjectCount,
  getAverageSessionMinutes,
  getLast7DaysSummary,
  getRecordsForLastDays,
  getSubjectTotals,
  getTodayTotalMinutes,
  getTotalMinutes,
} from "@/lib/stats";
import { useAiRecommendation } from "@/lib/use-ai-recommendation";

export default function StatsPage() {
  const { records, errorMessage, isHydrated, storageMode } = useStudyRecords();
  const recentWeekRecords = getRecordsForLastDays(records, 7);
  const weeklySummary = getLast7DaysSummary(records);
  const subjectTotals = getSubjectTotals(records);
  const weeklyTotalMinutes = getTotalMinutes(recentWeekRecords);
  const todayTotalMinutes = getTodayTotalMinutes(records);
  const averageSessionMinutes = getAverageSessionMinutes(recentWeekRecords);
  const activeSubjectCount = getActiveSubjectCount(recentWeekRecords);
  const { recommendation, isLoading: isAiLoading } = useAiRecommendation(records);
  const hasRecords = records.length > 0;
  const headingDescription =
    storageMode === "supabase"
      ? "오늘 총 시간, 과목별 누적, 최근 7일 흐름을 모두 익명 Supabase 세션에 저장된 기록에서 계산합니다."
      : errorMessage ||
        "Supabase 연결 전까지는 현재 브라우저 저장 기록을 기준으로 통계를 보여줍니다.";

  return (
    <AppShell>
      <PageHeading
        eyebrow="Stats"
        title="최근 공부 패턴을 읽고 다음 복습 우선순위를 정하세요."
        description={headingDescription}
        actions={
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface-muted px-5 text-sm font-semibold text-foreground transition hover:bg-surface"
          >
            대시보드로 이동
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="오늘 총 공부"
          value={formatMinutesKorean(todayTotalMinutes)}
          helper="당일 누적 기준"
          tone="accent"
        />
        <MetricCard
          label="최근 7일 누적"
          value={formatMinutesKorean(weeklyTotalMinutes)}
          helper="전체 세션 합산"
        />
        <MetricCard
          label="평균 세션 길이"
          value={formatMinutesKorean(averageSessionMinutes)}
          helper="최근 7일 기록 기준"
        />
        <MetricCard
          label="활성 과목"
          value={`${activeSubjectCount}개`}
          helper="최근 7일 내 고유 주제"
        />
      </section>

      {!isHydrated ? (
        <Panel className="gap-4">
          <EmptyState
            title="통계용 기록을 불러오는 중이에요"
            description="잠시 후 현재 세션의 공부 기록을 기준으로 통계가 계산됩니다."
          />
        </Panel>
      ) : !hasRecords ? (
        <Panel className="gap-4">
          <EmptyState
            title="통계를 만들 기록이 아직 없어요"
            description="공부 기록을 하나라도 추가하면 오늘 총 시간, 과목별 누적, 최근 7일 요약과 추천 카드가 자동으로 계산됩니다."
            actions={
              <Link
                href="/add"
                className="ui-action-solid inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition"
              >
                기록 추가하러 가기
              </Link>
            }
          />
        </Panel>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <Panel className="gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                최근 7일 히스토리
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                공부 시간이 몰린 날과 빈 날
              </h2>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              최근 일주일 기준
            </p>
          </div>
          <WeeklyChart points={weeklySummary} />
        </Panel>

        <Panel className="gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              과목별 누적 시간
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              어떤 과목에 비중이 몰렸는지
            </h2>
          </div>

          {subjectTotals.length > 0 ? (
            <SubjectTotalList totals={subjectTotals} />
          ) : (
            <EmptyState
              title="과목별 누적이 아직 없어요"
              description="기록이 쌓이면 과목별 총 공부 시간이 자동으로 정리됩니다."
            />
          )}
        </Panel>
      </section>

      <Panel tone="accent" className="gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/72">
              {recommendation.source === "openai" ? "AI Summary" : "Recommendation"}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              기록 기반 추천 카드
            </h2>
          </div>
          <p className="text-sm font-medium text-white/72">
            {isAiLoading
              ? "AI 추천 생성 중"
              : recommendation.source === "openai"
                ? "OpenAI 응답 사용 중"
                : "로컬 fallback 사용 중"}
          </p>
        </div>
        <p className="text-[15px] leading-7 text-white/88">
          {recommendation.summary}
        </p>
        <div className="rounded-[24px] border border-white/18 bg-white/8 p-4">
          <p className="text-[15px] leading-7 text-white">
            {recommendation.recommendation}
          </p>
        </div>
      </Panel>
    </AppShell>
  );
}
