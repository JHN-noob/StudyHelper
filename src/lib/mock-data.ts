import type { StudyRecord } from "@/lib/types";

function padNumber(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(
    date.getDate(),
  )}`;
}

function formatDateTime(date: Date) {
  return `${formatDate(date)}T${padNumber(date.getHours())}:${padNumber(
    date.getMinutes(),
  )}:00`;
}

function createStudyMoment(daysAgo: number, hours: number, minutes: number) {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setDate(date.getDate() - daysAgo);

  return {
    studyDate: formatDate(date),
    createdAt: formatDateTime(date),
  };
}

export const mockStudyRecords: StudyRecord[] = [
  {
    id: "session-01",
    ...createStudyMoment(0, 7, 30),
    subject: "React",
    durationMinutes: 80,
    content: "대시보드 레이아웃과 모바일 카드 UI 구조를 정리했다.",
  },
  {
    id: "session-02",
    ...createStudyMoment(0, 21, 0),
    subject: "영어",
    durationMinutes: 35,
    content: "리스닝 쉐도잉과 단어 복습을 짧게 이어서 했다.",
  },
  {
    id: "session-03",
    ...createStudyMoment(1, 20, 30),
    subject: "알고리즘",
    durationMinutes: 90,
    content: "최단 경로 문제를 다시 풀고 오답 노트를 업데이트했다.",
  },
  {
    id: "session-04",
    ...createStudyMoment(1, 8, 15),
    subject: "SQL",
    durationMinutes: 50,
    content: "join, group by, subquery 예제를 직접 손으로 다시 작성했다.",
  },
  {
    id: "session-05",
    ...createStudyMoment(2, 22, 0),
    subject: "네트워크",
    durationMinutes: 60,
    content: "TCP 흐름 제어와 혼잡 제어 개념을 표로 정리했다.",
  },
  {
    id: "session-06",
    ...createStudyMoment(3, 19, 0),
    subject: "영어",
    durationMinutes: 40,
    content: "기사 한 편을 읽고 모르는 표현을 메모해두었다.",
  },
  {
    id: "session-07",
    ...createStudyMoment(5, 21, 10),
    subject: "알고리즘",
    durationMinutes: 70,
    content: "DP 기초 문제를 다시 보며 점화식 습관을 복기했다.",
  },
  {
    id: "session-08",
    ...createStudyMoment(6, 6, 50),
    subject: "React",
    durationMinutes: 55,
    content: "App Router 라우팅 패턴과 공용 레이아웃 분리 방법을 살폈다.",
  },
];
