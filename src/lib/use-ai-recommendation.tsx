"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useStudyRecords } from "@/components/providers/study-records-provider";
import { buildStudyRecommendation } from "@/lib/stats";
import type {
  AIStudyRecommendation,
  StudyRecord,
} from "@/lib/types";

const AI_RECOMMENDATION_STORAGE_KEY = "study-helper-ai-recommendation-v1";

type AiRecommendationContextValue = {
  recommendation: AIStudyRecommendation;
  isLoading: boolean;
};

const AiRecommendationContext =
  createContext<AiRecommendationContextValue | null>(null);

type AiRecommendationProviderProps = {
  children: ReactNode;
};

export function AiRecommendationProvider({
  children,
}: AiRecommendationProviderProps) {
  const { records, isHydrated: isRecordsHydrated } = useStudyRecords();
  const [recommendation, setRecommendation] = useState<AIStudyRecommendation>(
    createIdleRecommendation([]),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const previousRecordCountRef = useRef<number | null>(null);
  const hasStoredRecommendationRef = useRef(false);

  useEffect(() => {
    const storedRecommendation = readStoredRecommendation();

    if (storedRecommendation) {
      hasStoredRecommendationRef.current = true;
      setRecommendation(storedRecommendation);
    } else {
      setRecommendation(createIdleRecommendation([]));
    }

    setIsCacheHydrated(true);
  }, []);

  useEffect(() => {
    if (!isRecordsHydrated || !isCacheHydrated) {
      return;
    }

    if (records.length === 0) {
      previousRecordCountRef.current = 0;
      hasStoredRecommendationRef.current = false;
      setRecommendation(createIdleRecommendation([]));
      clearStoredRecommendation();
      setIsLoading(false);
      return;
    }

    if (previousRecordCountRef.current === null) {
      previousRecordCountRef.current = records.length;

      if (!hasStoredRecommendationRef.current) {
        setRecommendation(createIdleRecommendation(records));
      }

      return;
    }

    const previousRecordCount = previousRecordCountRef.current;
    previousRecordCountRef.current = records.length;

    if (records.length <= previousRecordCount) {
      return;
    }

    const controller = new AbortController();
    let isCancelled = false;

    async function generateRecommendation() {
      try {
        setIsLoading(true);

        const nextRecommendation = await requestRecommendation(
          records,
          controller.signal,
        );

        if (isCancelled) {
          return;
        }

        hasStoredRecommendationRef.current = true;
        setRecommendation(nextRecommendation);
        writeStoredRecommendation(nextRecommendation);
      } catch (error) {
        if (isAbortError(error) || isCancelled) {
          return;
        }

        const fallbackRecommendation = createFallbackRecommendation(
          records,
          getErrorDetail(error),
        );

        hasStoredRecommendationRef.current = true;
        setRecommendation(fallbackRecommendation);
        writeStoredRecommendation(fallbackRecommendation);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void generateRecommendation();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [isCacheHydrated, isRecordsHydrated, records]);

  return (
    <AiRecommendationContext.Provider
      value={{
        recommendation,
        isLoading,
      }}
    >
      {children}
    </AiRecommendationContext.Provider>
  );
}

export function useAiRecommendation() {
  const context = useContext(AiRecommendationContext);

  if (!context) {
    throw new Error(
      "useAiRecommendation must be used within AiRecommendationProvider.",
    );
  }

  return context;
}

async function requestRecommendation(
  records: StudyRecord[],
  signal: AbortSignal,
) {
  const response = await fetch("/api/ai/recommendation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: records.slice(0, 10),
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`AI route returned ${response.status}.`);
  }

  const payload = (await response.json()) as unknown;

  if (isAiStudyRecommendation(payload)) {
    return payload;
  }

  return createFallbackRecommendation(
    records,
    "AI route response shape was not recognized.",
  );
}

function createFallbackRecommendation(
  records: StudyRecord[],
  debugMessage?: string,
) {
  return {
    ...buildStudyRecommendation(records),
    source: "local" as const,
    debugMessage,
  };
}

function createIdleRecommendation(records: StudyRecord[]): AIStudyRecommendation {
  if (records.length === 0) {
    return {
      summary: "아직 추천 카드가 준비되지 않았어요.",
      recommendation:
        "공부 기록을 추가하면 최근 흐름을 바탕으로 다음 학습 포인트를 정리해드릴게요.",
      focusSubject: null,
      source: "local",
    };
  }

  return {
    summary: "최근 추천이 아직 준비되지 않았어요.",
    recommendation:
      "새로운 공부 기록을 추가하면 최신 학습 흐름을 바탕으로 추천을 다시 만들어드릴게요.",
    focusSubject: null,
    source: "local",
  };
}

function readStoredRecommendation() {
  try {
    const rawValue = window.localStorage.getItem(AI_RECOMMENDATION_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!isAiStudyRecommendation(parsedValue)) {
      clearStoredRecommendation();
      return null;
    }

    return parsedValue;
  } catch {
    clearStoredRecommendation();
    return null;
  }
}

function writeStoredRecommendation(recommendation: AIStudyRecommendation) {
  window.localStorage.setItem(
    AI_RECOMMENDATION_STORAGE_KEY,
    JSON.stringify(recommendation),
  );
}

function clearStoredRecommendation() {
  window.localStorage.removeItem(AI_RECOMMENDATION_STORAGE_KEY);
}

function isAiStudyRecommendation(
  value: unknown,
): value is AIStudyRecommendation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as AIStudyRecommendation;

  return (
    typeof candidate.summary === "string" &&
    typeof candidate.recommendation === "string" &&
    (typeof candidate.focusSubject === "string" ||
      candidate.focusSubject === null) &&
    (typeof candidate.debugMessage === "string" ||
      typeof candidate.debugMessage === "undefined") &&
    (candidate.source === "local" || candidate.source === "openai")
  );
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function getErrorDetail(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown AI fetch error.";
}
