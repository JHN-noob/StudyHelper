export type StudyRecord = {
  id: string;
  studyDate: string;
  subject: string;
  durationMinutes: number;
  content: string;
  createdAt: string;
};

export type NewStudyRecordInput = {
  studyDate: string;
  subject: string;
  durationMinutes: number;
  content: string;
};

export type UpdateStudyRecordInput = NewStudyRecordInput;

export type SubjectTotal = {
  subject: string;
  minutes: number;
  sessions: number;
};

export type DailyStudySummary = {
  date: string;
  label: string;
  minutes: number;
  isToday: boolean;
};

export type StudyRecommendation = {
  summary: string;
  recommendation: string;
  focusSubject: string | null;
};

export type StudyRecommendationSource = "local" | "openai";

export type AIStudyRecommendation = StudyRecommendation & {
  source: StudyRecommendationSource;
  debugMessage?: string;
};

export type RecordsStorageMode = "supabase" | "unavailable";
