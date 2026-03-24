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
  getActiveSubjectCount,
  getLast7DaysSummary,
  getRecentRecords,
  getRecordsForLastDays,
  getSubjectTotals,
  getTodayTotalMinutes,
  getTotalMinutes,
} from "@/lib/stats";
import { useAiRecommendation } from "@/lib/use-ai-recommendation";

export default function Home() {
  const { records, errorMessage, isHydrated, storageMode } = useStudyRecords();
  const recentWeekRecords = getRecordsForLastDays(records, 7);
  const weeklySummary = getLast7DaysSummary(records);
  const recentRecords = getRecentRecords(records, 3);
  const subjectTotals = getSubjectTotals(records);
  const todayTotalMinutes = getTodayTotalMinutes(records);
  const weeklyTotalMinutes = getTotalMinutes(recentWeekRecords);
  const activeSubjectCount = getActiveSubjectCount(recentWeekRecords);
  const { recommendation, isLoading: isAiLoading } = useAiRecommendation(records);
  const hasRecords = records.length > 0;
  const showEmptyState = isHydrated && !hasRecords;
  const headingDescription =
    storageMode === "supabase"
      ? "익명 Supabase 세션으로 공부 기록을 저장하고, 통계와 추천 카드도 같은 데이터 기준으로 이어지도록 연결했습니다."
      : errorMessage ||
        "Supabase 연결 전까지는 이 브라우저 저장 모드로 기록을 유지합니다.";

  return (
    <AppShell>
      <PageHeading
        eyebrow="Study Helper"
        title="공부 흐름을 기록하고, 오늘의 우선순위를 한 화면에서 정리하세요."
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
          helper={isHydrated ? "오늘 쌓인 총 집중 시간" : "기록 불러오는 중"}
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
            description={
              storageMode === "supabase"
                ? "먼저 한 세션만 기록해도 홈 대시보드, 최근 기록, 통계, 추천 카드가 바로 살아납니다. 지금은 익명 세션으로 이어지는 개인 워크스페이스 형태예요."
                : "먼저 한 세션만 기록해도 홈 대시보드, 최근 기록, 통계, 추천 카드가 바로 살아납니다. 현재는 이 브라우저 저장 모드로 동작하고 있어요."
            }
            actions={
              <Link
                href="/add"
                className="ui-action-solid inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition"
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
            <p className="text-sm font-medium text-white/72">
              {recommendation.source === "openai" ? "AI 추천 영역" : "추천 영역"}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              최근 학습 패턴 요약
            </h2>
          </div>
          <p className="text-[15px] leading-7 text-white/88">
            {recommendation.summary}
          </p>
          <div className="rounded-[24px] border border-white/18 bg-white/8 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
              {isAiLoading
                ? "Loading"
                : recommendation.source === "openai"
                  ? "OpenAI"
                  : "Local Fallback"}
            </p>
            <p className="mt-2 text-[15px] leading-7 text-white">
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
