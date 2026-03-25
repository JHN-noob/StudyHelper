"use client";

import Link from "next/link";
import { RecommendationPanel } from "@/components/ai/recommendation-panel";
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

const SHOULD_SHOW_AI_DEBUG = process.env.NODE_ENV === "development";

export default function StatsPage() {
  const { records, errorMessage, isHydrated, storageMode } = useStudyRecords();
  const recentWeekRecords = getRecordsForLastDays(records, 7);
  const weeklySummary = getLast7DaysSummary(records);
  const subjectTotals = getSubjectTotals(records);
  const weeklyTotalMinutes = getTotalMinutes(recentWeekRecords);
  const todayTotalMinutes = getTodayTotalMinutes(records);
  const averageSessionMinutes = getAverageSessionMinutes(recentWeekRecords);
  const activeSubjectCount = getActiveSubjectCount(recentWeekRecords);
  const { recommendation, isLoading: isAiLoading } = useAiRecommendation();
  const hasRecords = records.length > 0;
  const headingDescription =
    storageMode === "supabase"
      ? "오늘 총 공부 시간, 과목별 누적, 최근 7일 흐름을 모두 현재 기록 기준으로 계산해 보여줘요."
      : errorMessage ||
        "Supabase 연결이 불안정해서 지금은 통계를 불러올 수 없어요.";

  return (
    <AppShell>
      <PageHeading
        eyebrow="Stats"
        title="최근 공부 패턴을 보고 다음 복습 우선순위를 정해보세요."
        description={headingDescription}
        actions={
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface-muted px-5 text-sm font-semibold text-foreground transition hover:bg-surface"
          >
            홈으로 이동
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
          helper="전체 세션 합계"
        />
        <MetricCard
          label="평균 세션 길이"
          value={formatMinutesKorean(averageSessionMinutes)}
          helper="최근 7일 기록 기준"
        />
        <MetricCard
          label="활성 과목"
          value={`${activeSubjectCount}개`}
          helper="최근 7일에 공부한 과목"
        />
      </section>

      {!isHydrated ? (
        <Panel className="gap-4">
          <EmptyState
            title="통계를 준비하는 중이에요."
            description="현재 세션의 공부 기록을 바탕으로 통계를 계산하고 있어요."
          />
        </Panel>
      ) : !hasRecords ? (
        <Panel className="gap-4">
          <EmptyState
            title="통계를 만들 기록이 아직 없어요."
            description="공부 기록을 하나만 추가해도 오늘 총 공부, 과목별 누적, 최근 7일 요약이 바로 만들어져요."
            actions={
              storageMode === "supabase" ? (
                <Link
                  href="/add"
                  className="ui-action-solid inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition"
                >
                  기록 추가하러 가기
                </Link>
              ) : null
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
                공부 시간의 흐름 비교
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
              어떤 과목에 가장 많이 집중했을까?
            </h2>
          </div>

          {subjectTotals.length > 0 ? (
            <SubjectTotalList totals={subjectTotals} />
          ) : (
            <EmptyState
              title="과목별 통계가 아직 없어요."
              description="기록이 쌓이면 과목별 총 공부 시간이 자동으로 정리돼요."
            />
          )}
        </Panel>
      </section>

      <RecommendationPanel
        eyebrow={recommendation.source === "openai" ? "AI Summary" : "Recommendation"}
        title="기록 기반 추천 카드"
        summary={recommendation.summary}
        recommendation={recommendation.recommendation}
        meta={
          isAiLoading
            ? "AI 추천 생성 중"
            : recommendation.source === "openai"
              ? "AI 응답 사용 중"
              : "기록 기반 추천 표시 중"
        }
        debugMessage={recommendation.debugMessage}
        showDebug={
          SHOULD_SHOW_AI_DEBUG && recommendation.source === "local"
        }
      />
    </AppShell>
  );
}
