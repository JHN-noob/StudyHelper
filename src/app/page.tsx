"use client";

import Link from "next/link";
import { RecommendationPanel } from "@/components/ai/recommendation-panel";
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
  getActiveSubjectCount,
  getLast7DaysSummary,
  getRecentRecords,
  getRecordsForLastDays,
  getSubjectTotals,
  getTodayTotalMinutes,
  getTotalMinutes,
} from "@/lib/stats";
import { useAiRecommendation } from "@/lib/use-ai-recommendation";

const SHOULD_SHOW_AI_DEBUG = process.env.NODE_ENV === "development";

export default function Home() {
  const { records, errorMessage, isHydrated, storageMode } = useStudyRecords();
  const recentWeekRecords = getRecordsForLastDays(records, 7);
  const weeklySummary = getLast7DaysSummary(records);
  const recentRecords = getRecentRecords(records, 3);
  const subjectTotals = getSubjectTotals(records);
  const todayTotalMinutes = getTodayTotalMinutes(records);
  const weeklyTotalMinutes = getTotalMinutes(recentWeekRecords);
  const activeSubjectCount = getActiveSubjectCount(recentWeekRecords);
  const { recommendation, isLoading: isAiLoading } = useAiRecommendation();
  const hasRecords = records.length > 0;
  const showEmptyState = isHydrated && !hasRecords;
  const headingDescription =
    storageMode === "supabase"
      ? "익명 세션으로 공부 기록을 저장하고, 통계와 추천 카드도 같은 데이터 기준으로 바로 이어집니다."
      : errorMessage ||
        "Supabase 연결이 불안정해서 지금은 기록을 불러오거나 저장할 수 없어요.";

  return (
    <AppShell>
      <PageHeading
        eyebrow="Study Helper"
        title="공부 흐름을 기록하고, 오늘의 우선순위를 한 화면에서 정리해보세요."
        description={headingDescription}
        actions={
          <>
            <Link
              href="/add"
              className="ui-action-solid inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition"
            >
              공부 기록 추가
            </Link>
            <Link
              href="/records"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface-muted px-5 text-sm font-semibold text-foreground transition hover:bg-surface"
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
          helper={isHydrated ? "오늘 쌓인 총 집중 시간" : "기록을 불러오는 중"}
          tone="accent"
        />
        <MetricCard
          label="최근 7일 누적"
          value={formatMinutesKorean(weeklyTotalMinutes)}
          helper="최근 일주일 동안 쌓인 기록 합계"
        />
        <MetricCard
          label="활성 과목 수"
          value={`${activeSubjectCount}개`}
          helper="최근 7일 안에 공부한 과목"
        />
      </section>

      {showEmptyState ? (
        <Panel className="gap-4">
          <EmptyState
            title="아직 저장한 공부 기록이 없어요."
            description={
              storageMode === "supabase"
                ? "첫 기록만 남겨도 최근 기록, 통계, 추천 카드가 바로 채워져요. 가볍게 한 세션부터 시작해보세요."
                : "지금은 연결 상태가 불안정해서 첫 기록을 저장할 수 없어요. 잠시 후 다시 시도해보세요."
            }
            actions={
              storageMode === "supabase" ? (
                <Link
                  href="/add"
                  className="ui-action-solid inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition"
                >
                  첫 기록 추가하기
                </Link>
              ) : null
            }
          />
        </Panel>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel className="gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                최근 7일 흐름
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

        <RecommendationPanel
          eyebrow={recommendation.source === "openai" ? "AI 추천 영역" : "추천 영역"}
          title="최근 학습 패턴 요약"
          summary={recommendation.summary}
          recommendation={recommendation.recommendation}
          bodyLabel={
            isAiLoading
              ? "Loading"
              : recommendation.source === "openai"
                ? "AI"
                : "Recommendation"
          }
          debugMessage={recommendation.debugMessage}
          showDebug={
            SHOULD_SHOW_AI_DEBUG && recommendation.source === "local"
          }
        />
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
              title="최근 기록이 아직 없어요."
              description="공부 기록이 쌓이면 가장 최근 세션이 이 영역에 바로 보여요."
            />
          )}
        </Panel>

        <Panel className="gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              과목별 누적
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              어떤 과목을 가장 많이 공부했을까?
            </h2>
          </div>

          {subjectTotals.length > 0 ? (
            <SubjectTotalList totals={subjectTotals.slice(0, 4)} />
          ) : (
            <EmptyState
              title="과목 통계가 아직 없어요."
              description="공부 기록이 쌓이면 과목별 누적 시간이 자동으로 정리돼요."
            />
          )}
        </Panel>
      </section>
    </AppShell>
  );
}
