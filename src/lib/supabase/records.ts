import type {
  NewStudyRecordInput,
  StudyRecord,
  UpdateStudyRecordInput,
} from "@/lib/types";

export const LEGACY_STORAGE_KEY = "study-helper-records-v1";
export const STUDY_RECORDS_TABLE =
  process.env.NEXT_PUBLIC_STUDY_RECORDS_TABLE?.trim() || "study_records";

export type StudyRecordRow = {
  id: string;
  study_date: string;
  subject: string;
  duration_minutes: number;
  content: string;
  created_at: string;
};

export type StudyRecordInsert = {
  user_id: string;
  study_date: string;
  subject: string;
  duration_minutes: number;
  content: string;
  created_at: string;
};

export type StudyRecordUpdate = {
  study_date: string;
  subject: string;
  duration_minutes: number;
  content: string;
};

export const STUDY_RECORD_SELECT =
  "id, study_date, subject, duration_minutes, content, created_at";

export function mapStudyRecordRow(row: StudyRecordRow): StudyRecord {
  return {
    id: row.id,
    studyDate: row.study_date,
    subject: row.subject,
    durationMinutes: row.duration_minutes,
    content: row.content,
    createdAt: row.created_at,
  };
}

export function mapStudyRecordInputToInsert(
  input: NewStudyRecordInput,
  userId: string,
): StudyRecordInsert {
  return {
    user_id: userId,
    study_date: input.studyDate,
    subject: input.subject.trim(),
    duration_minutes: input.durationMinutes,
    content: input.content.trim(),
    created_at: new Date().toISOString(),
  };
}

export function mapStudyRecordInputToUpdate(input: UpdateStudyRecordInput): StudyRecordUpdate {
  return {
    study_date: input.studyDate,
    subject: input.subject.trim(),
    duration_minutes: input.durationMinutes,
    content: input.content.trim(),
  };
}

export function sortStudyRecords(records: StudyRecord[]) {
  return [...records].sort((left, right) => {
    if (left.studyDate === right.studyDate) {
      return right.createdAt.localeCompare(left.createdAt);
    }

    return right.studyDate.localeCompare(left.studyDate);
  });
}

export function readLegacyStudyRecords() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return sortStudyRecords(parsedValue.filter(isStudyRecord));
  } catch {
    return [];
  }
}

export function writeLegacyStudyRecords(records: StudyRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(records));
}

export function clearLegacyStudyRecords() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}

function isStudyRecord(value: unknown): value is StudyRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as StudyRecord;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.studyDate === "string" &&
    typeof candidate.subject === "string" &&
    typeof candidate.durationMinutes === "number" &&
    typeof candidate.content === "string" &&
    typeof candidate.createdAt === "string"
  );
}
