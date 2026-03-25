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
  mapStudyRecordInputToInsert,
  mapStudyRecordInputToUpdate,
  mapStudyRecordRow,
  sortStudyRecords,
  STUDY_RECORD_SELECT,
  STUDY_RECORDS_TABLE,
  type StudyRecordRow,
} from "@/lib/supabase/records";
import type {
  NewStudyRecordInput,
  RecordsStorageMode,
  StudyRecord,
  UpdateStudyRecordInput,
} from "@/lib/types";

type MutationResult =
  | { ok: true }
  | { ok: false; errorMessage: string };

const SHOULD_EXPOSE_STORAGE_ERROR_DETAIL = process.env.NODE_ENV === "development";

type StudyRecordsContextValue = {
  records: StudyRecord[];
  isHydrated: boolean;
  isSyncing: boolean;
  storageMode: RecordsStorageMode;
  errorMessage: string;
  addRecord: (input: NewStudyRecordInput) => Promise<MutationResult>;
  updateRecord: (
    id: string,
    input: UpdateStudyRecordInput,
  ) => Promise<MutationResult>;
  deleteRecord: (id: string) => Promise<MutationResult>;
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

        if (isCancelled) {
          return;
        }

        setRecords(remoteRecords);
        setStorageMode("supabase");
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setRecords([]);
        setStorageMode("unavailable");
        setSessionUserId(null);
        setErrorMessage(createInitializationErrorMessage(error));
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

  // Reserved for a future manual re-sync action.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    if (storageMode !== "supabase" || !sessionUserId) {
      const nextErrorMessage =
        errorMessage ||
        "현재는 저장 연결이 불안정해서 기록을 저장할 수 없어요. 잠시 후 다시 시도해 주세요.";

      setErrorMessage(nextErrorMessage);

      return {
        ok: false,
        errorMessage: nextErrorMessage,
      };
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

  async function updateRecord(
    id: string,
    input: UpdateStudyRecordInput,
  ): Promise<MutationResult> {
    if (storageMode !== "supabase" || !sessionUserId) {
      const nextErrorMessage =
        errorMessage ||
        "현재는 저장 연결이 불안정해서 기록을 수정할 수 없어요. 잠시 후 다시 시도해 주세요.";

      setErrorMessage(nextErrorMessage);

      return {
        ok: false,
        errorMessage: nextErrorMessage,
      };
    }

    try {
      setIsSyncing(true);

      const { data, error } = await getSupabaseBrowserClient()
        .from(STUDY_RECORDS_TABLE)
        .update(mapStudyRecordInputToUpdate(input))
        .eq("id", id)
        .select(STUDY_RECORD_SELECT)
        .single<StudyRecordRow>();

      if (error || !data) {
        throw error ?? new Error("Record update returned no data.");
      }

      const updatedRecord = mapStudyRecordRow(data);

      setRecords((currentRecords) =>
        sortStudyRecords(
          currentRecords.map((record) =>
            record.id === id ? updatedRecord : record,
          ),
        ),
      );
      setErrorMessage("");

      return { ok: true };
    } catch (error) {
      const nextErrorMessage = createCrudErrorMessage(
        error,
        "기록을 수정하지 못했어요. update/select 정책과 컬럼 이름을 다시 확인해보세요.",
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
    if (storageMode !== "supabase" || !sessionUserId) {
      const nextErrorMessage =
        errorMessage ||
        "현재는 저장 연결이 불안정해서 기록을 삭제할 수 없어요. 잠시 후 다시 시도해 주세요.";

      setErrorMessage(nextErrorMessage);

      return {
        ok: false,
        errorMessage: nextErrorMessage,
      };
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
    updateRecord,
    deleteRecord,
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

function createInitializationErrorMessage(error: unknown) {
  const detail = getErrorDetail(error);

  if (!SHOULD_EXPOSE_STORAGE_ERROR_DETAIL || !detail) {
    return "Supabase 연결에 실패했어요. 지금은 기록을 불러오거나 저장할 수 없어요. 잠시 후 다시 시도하거나 설정을 확인해보세요.";
  }

  return `Supabase 연결에 실패했어요. 지금은 기록을 불러오거나 저장할 수 없어요. 잠시 후 다시 시도하거나 설정을 확인해보세요. ${detail}`;
}

function createCrudErrorMessage(error: unknown, fallbackMessage: string) {
  const detail = getErrorDetail(error);

  if (!SHOULD_EXPOSE_STORAGE_ERROR_DETAIL || !detail) {
    return fallbackMessage;
  }

  return `${fallbackMessage} (${detail})`;
}

function getErrorDetail(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };
    const parts: string[] = [];

    if (typeof candidate.message === "string" && candidate.message.trim()) {
      parts.push(candidate.message.trim());
    }

    if (typeof candidate.details === "string" && candidate.details.trim()) {
      parts.push(candidate.details.trim());
    }

    if (typeof candidate.hint === "string" && candidate.hint.trim()) {
      parts.push(`hint: ${candidate.hint.trim()}`);
    }

    if (typeof candidate.code === "string" && candidate.code.trim()) {
      parts.push(`code: ${candidate.code.trim()}`);
    }

    if (parts.length > 0) {
      return parts.join(" / ");
    }
  }

  return "";
}
