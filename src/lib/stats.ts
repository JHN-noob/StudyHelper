import { formatMinutesKorean } from "@/lib/format";
import type {
  DailyStudySummary,
  StudyRecommendation,
  StudyRecord,
  SubjectTotal,
} from "@/lib/types";

function padNumber(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(
    date.getDate(),
  )}`;
}

export function getRecentRecords(records: StudyRecord[], count = 4) {
  return [...records]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, count);
}

export function getRecordsForLastDays(records: StudyRecord[], days: number) {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (days - 1));

  const startKey = formatDateKey(startDate);

  return records.filter((record) => record.studyDate >= startKey);
}

export function getTodayTotalMinutes(records: StudyRecord[]) {
  const today = formatDateKey(new Date());

  return records
    .filter((record) => record.studyDate === today)
    .reduce((total, record) => total + record.durationMinutes, 0);
}

export function getTotalMinutes(records: StudyRecord[]) {
  return records.reduce((total, record) => total + record.durationMinutes, 0);
}

export function getActiveSubjectCount(records: StudyRecord[]) {
  return new Set(records.map((record) => record.subject)).size;
}

export function getAverageSessionMinutes(records: StudyRecord[]) {
  if (records.length === 0) {
    return 0;
  }

  return Math.round(getTotalMinutes(records) / records.length);
}

export function getSubjectTotals(records: StudyRecord[]): SubjectTotal[] {
  const subjectMap = new Map<string, SubjectTotal>();

  records.forEach((record) => {
    const current = subjectMap.get(record.subject);

    if (current) {
      current.minutes += record.durationMinutes;
      current.sessions += 1;
      return;
    }

    subjectMap.set(record.subject, {
      subject: record.subject,
      minutes: record.durationMinutes,
      sessions: 1,
    });
  });

  return [...subjectMap.values()].sort((left, right) => {
    if (right.minutes === left.minutes) {
      return left.subject.localeCompare(right.subject, "ko");
    }

    return right.minutes - left.minutes;
  });
}

export function getLast7DaysSummary(records: StudyRecord[]): DailyStudySummary[] {
  const minuteMap = new Map<string, number>();

  records.forEach((record) => {
    minuteMap.set(
      record.studyDate,
      (minuteMap.get(record.studyDate) ?? 0) + record.durationMinutes,
    );
  });

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    const daysAgo = 6 - index;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - daysAgo);

    const dateKey = formatDateKey(date);

    return {
      date: dateKey,
      label: new Intl.DateTimeFormat("ko-KR", {
        weekday: "short",
      }).format(date),
      minutes: minuteMap.get(dateKey) ?? 0,
      isToday: daysAgo === 0,
    };
  });
}

export function buildStudyRecommendation(
  records: StudyRecord[],
): StudyRecommendation {
  if (records.length === 0) {
    return {
      summary: "아직 학습 기록이 없어서 패턴을 요약할 데이터가 없습니다.",
      recommendation:
        "먼저 오늘 한 세션만 기록해 보세요. 기록이 쌓이면 과목 편중과 복습 우선순위를 더 구체적으로 추천할 수 있습니다.",
      focusSubject: null,
    };
  }

  const weeklyRecords = getRecordsForLastDays(records, 7);
  const weeklySummary = getLast7DaysSummary(records);
  const subjectTotals = getSubjectTotals(weeklyRecords);
  const weeklyTotalMinutes = weeklySummary.reduce(
    (total, day) => total + day.minutes,
    0,
  );
  const topSubject = subjectTotals[0]?.subject ?? null;
  const leastFocusedSubject =
    subjectTotals.length > 1 ? subjectTotals[subjectTotals.length - 1]?.subject : null;
  const lowestDay = [...weeklySummary].sort((left, right) => {
    if (left.minutes === right.minutes) {
      return left.date.localeCompare(right.date);
    }

    return left.minutes - right.minutes;
  })[0];

  const summary = topSubject
    ? `최근 7일 동안 ${formatMinutesKorean(weeklyTotalMinutes)}를 공부했고, ${topSubject} 비중이 가장 높았습니다.`
    : "최근 학습 기록을 바탕으로 패턴을 요약할 데이터가 아직 충분하지 않습니다.";

  const recommendation = leastFocusedSubject
    ? `${leastFocusedSubject} 과목을 30분 정도 짧게 보강하면 과목 편중을 완화하기 좋습니다.`
    : lowestDay.minutes === 0
      ? `${lowestDay.label}처럼 비어 있는 날에 25분 복습 세션을 하나 넣어 흐름을 끊지 않도록 해보세요.`
      : "최근 흐름이 비교적 고르게 유지되고 있어, 오늘은 가장 중요한 한 과목만 짧게 복습해도 충분합니다.";

  return {
    summary,
    recommendation,
    focusSubject: leastFocusedSubject,
  };
}
