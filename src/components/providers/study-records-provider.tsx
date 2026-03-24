"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  clearLegacyStudyRecords,
  mapStudyRecordInputToInsert,
  mapStudyRecordRow,
  readLegacyStudyRecords,
  sortStudyRecords,
  STUDY_RECORD_SELECT,
  STUDY_RECORDS_TABLE,
  writeLegacyStudyRecords,
  type StudyRecordRow,
} from "@/lib/supabase/records";
import type {
  NewStudyRecordInput,
  RecordsStorageMode,
  StudyRecord,
} from "@/lib/types";

type MutationResult =
  | { ok: true }
  | { ok: false; errorMessage: string };

type StudyRecordsContextValue = {
  records: StudyRecord[];
  isHydrated: boolean;
  isSyncing: boolean;
  storageMode: RecordsStorageMode;
  errorMessage: string;
  addRecord: (input: NewStudyRecordInput) => Promise<MutationResult>;
  deleteRecord: (id: string) => Promise<MutationResult>;
  refreshRecords: () => Promise<void>;
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [storageMode, setStorageMode] = useState<RecordsStorageMode>("supabase");
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function initialize() {
      setIsSyncing(true);
      setErrorMessage("");

      try {
        const supabase = getSupabaseBrowserClient();
        const session = await ensureAnonymousSession(supabase);

        if (!session?.user) {
          throw new Error("Anonymous session was not created.");
        }

        if (isCancelled) {
          return;
        }

        setSessionUserId(session.user.id);

        const remoteRecords = await fetchRemoteRecords(supabase);
        const legacyRecords = readLegacyStudyRecords();

        if (remoteRecords.length === 0 && legacyRecords.length > 0) {
          await migrateLegacyRecords(supabase, session.user.id, legacyRecords);

          const migratedRecords = await fetchRemoteRecords(supabase);

          if (isCancelled) {
            return;
          }

          clearLegacyStudyRecords();
          setRecords(migratedRecords);
          setStorageMode("supabase");
          return;
        }

        if (isCancelled) {
          return;
        }

        setRecords(remoteRecords);
        setStorageMode("supabase");
      } catch (error) {
        const legacyRecords = readLegacyStudyRecords();

        if (isCancelled) {
          return;
        }

        setRecords(legacyRecords);
        setStorageMode("local");
        setSessionUserId(null);
        setErrorMessage(createInitializationErrorMessage(error, legacyRecords));
      } finally {
        if (!isCancelled) {
          setIsHydrated(true);
          setIsSyncing(false);
        }
      }
    }

    void initialize();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || storageMode !== "local") {
      return;
    }

    writeLegacyStudyRecords(records);
  }, [isHydrated, records, storageMode]);

  async function refreshRecords() {
    if (storageMode !== "supabase") {
      return;
    }

    try {
      setIsSyncing(true);
      const nextRecords = await fetchRemoteRecords(getSupabaseBrowserClient());

      setRecords(nextRecords);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        createCrudErrorMessage(
          error,
          "저장된 기록을 다시 불러오지 못했어요. 테이블 이름과 RLS 정책을 확인해보세요.",
        ),
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function addRecord(input: NewStudyRecordInput): Promise<MutationResult> {
    const trimmedSubject = input.subject.trim();
    const trimmedContent = input.content.trim();

    if (storageMode === "local" || !sessionUserId) {
      const record: StudyRecord = {
        id: createRecordId(),
        studyDate: input.studyDate,
        subject: trimmedSubject,
        durationMinutes: input.durationMinutes,
        content: trimmedContent,
        createdAt: new Date().toISOString(),
      };

      setRecords((currentRecords) => sortStudyRecords([record, ...currentRecords]));
      return { ok: true };
    }

    try {
      setIsSyncing(true);

      const { data, error } = await getSupabaseBrowserClient()
        .from(STUDY_RECORDS_TABLE)
        .insert(mapStudyRecordInputToInsert(input, sessionUserId))
        .select(STUDY_RECORD_SELECT)
        .single<StudyRecordRow>();

      if (error || !data) {
        throw error ?? new Error("Record insert returned no data.");
      }

      setRecords((currentRecords) =>
        sortStudyRecords([mapStudyRecordRow(data), ...currentRecords]),
      );
      setErrorMessage("");

      return { ok: true };
    } catch (error) {
      const nextErrorMessage = createCrudErrorMessage(
        error,
        "Supabase에 기록을 저장하지 못했어요. 테이블 컬럼과 insert/select 정책을 다시 확인해보세요.",
      );

      setErrorMessage(nextErrorMessage);

      return {
        ok: false,
        errorMessage: nextErrorMessage,
      };
    } finally {
      setIsSyncing(false);
    }
  }

  async function deleteRecord(id: string): Promise<MutationResult> {
    if (storageMode === "local") {
      setRecords((currentRecords) =>
        currentRecords.filter((record) => record.id !== id),
      );

      return { ok: true };
    }

    try {
      setIsSyncing(true);

      const { error } = await getSupabaseBrowserClient()
        .from(STUDY_RECORDS_TABLE)
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setRecords((currentRecords) =>
        currentRecords.filter((record) => record.id !== id),
      );
      setErrorMessage("");

      return { ok: true };
    } catch (error) {
      const nextErrorMessage = createCrudErrorMessage(
        error,
        "기록을 삭제하지 못했어요. delete 정책과 사용자별 접근 조건을 확인해보세요.",
      );

      setErrorMessage(nextErrorMessage);

      return {
        ok: false,
        errorMessage: nextErrorMessage,
      };
    } finally {
      setIsSyncing(false);
    }
  }

  const value: StudyRecordsContextValue = {
    records,
    isHydrated,
    isSyncing,
    storageMode,
    errorMessage,
    addRecord,
    deleteRecord,
    refreshRecords,
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

async function ensureAnonymousSession(supabase: SupabaseClient) {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (sessionData.session) {
    return sessionData.session;
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw error;
  }

  return data.session;
}

async function fetchRemoteRecords(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from(STUDY_RECORDS_TABLE)
    .select(STUDY_RECORD_SELECT)
    .order("study_date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<StudyRecordRow[]>();

  if (error) {
    throw error;
  }

  return sortStudyRecords((data ?? []).map(mapStudyRecordRow));
}

async function migrateLegacyRecords(
  supabase: SupabaseClient,
  userId: string,
  legacyRecords: StudyRecord[],
) {
  const rows = legacyRecords.map((record) => ({
    user_id: userId,
    study_date: record.studyDate,
    subject: record.subject,
    duration_minutes: record.durationMinutes,
    content: record.content,
    created_at: record.createdAt,
  }));

  const { error } = await supabase.from(STUDY_RECORDS_TABLE).insert(rows);

  if (error) {
    throw error;
  }
}

function createInitializationErrorMessage(
  error: unknown,
  legacyRecords: StudyRecord[],
) {
  const detail = getErrorDetail(error);

  if (legacyRecords.length > 0) {
    return `Supabase 연결에 실패해서 현재는 이 브라우저 저장 모드로 동작하고 있어요. ${detail}`;
  }

  return `Supabase 연결에 실패했어요. 테이블 이름, anonymous auth, RLS 정책을 먼저 확인해보세요. ${detail}`;
}

function createCrudErrorMessage(error: unknown, fallbackMessage: string) {
  const detail = getErrorDetail(error);

  return detail ? `${fallbackMessage} (${detail})` : fallbackMessage;
}

function getErrorDetail(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

function createRecordId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
