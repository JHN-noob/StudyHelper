"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { NewStudyRecordInput, StudyRecord } from "@/lib/types";

const STORAGE_KEY = "study-helper-records-v1";

type StudyRecordsContextValue = {
  records: StudyRecord[];
  isHydrated: boolean;
  addRecord: (input: NewStudyRecordInput) => void;
  deleteRecord: (id: string) => void;
};

const StudyRecordsContext = createContext<StudyRecordsContextValue | null>(null);

type StudyRecordsProviderProps = {
  children: ReactNode;
};

export function StudyRecordsProvider({
  children,
}: StudyRecordsProviderProps) {
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);

      if (!rawValue) {
        setIsHydrated(true);
        return;
      }

      const parsedValue = JSON.parse(rawValue);

      if (Array.isArray(parsedValue)) {
        setRecords(sortRecords(parsedValue.filter(isStudyRecord)));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [isHydrated, records]);

  const value: StudyRecordsContextValue = {
    records,
    isHydrated,
    addRecord(input) {
      const record: StudyRecord = {
        id: createRecordId(),
        studyDate: input.studyDate,
        subject: input.subject.trim(),
        durationMinutes: input.durationMinutes,
        content: input.content.trim(),
        createdAt: new Date().toISOString(),
      };

      setRecords((currentRecords) => sortRecords([record, ...currentRecords]));
    },
    deleteRecord(id) {
      setRecords((currentRecords) =>
        currentRecords.filter((record) => record.id !== id),
      );
    },
  };

  return (
    <StudyRecordsContext.Provider value={value}>
      {children}
    </StudyRecordsContext.Provider>
  );
}

export function useStudyRecords() {
  const context = useContext(StudyRecordsContext);

  if (!context) {
    throw new Error("useStudyRecords must be used within StudyRecordsProvider.");
  }

  return context;
}

function createRecordId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sortRecords(records: StudyRecord[]) {
  return [...records].sort((left, right) => {
    if (left.studyDate === right.studyDate) {
      return right.createdAt.localeCompare(left.createdAt);
    }

    return right.studyDate.localeCompare(left.studyDate);
  });
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
