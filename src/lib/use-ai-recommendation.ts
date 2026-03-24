"use client";

import { useEffect, useState } from "react";
import { buildStudyRecommendation } from "@/lib/stats";
import type {
  AIStudyRecommendation,
  StudyRecord,
} from "@/lib/types";

export function useAiRecommendation(records: StudyRecord[]) {
  const fallbackRecommendation = createFallbackRecommendation(records);
  const [recommendation, setRecommendation] = useState<AIStudyRecommendation>(
    fallbackRecommendation,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const nextFallback = createFallbackRecommendation(records);

    setRecommendation(nextFallback);

    if (records.length === 0) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let isCancelled = false;

    async function fetchRecommendation() {
      try {
        setIsLoading(true);

        const response = await fetch("/api/ai/recommendation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            records: records.slice(0, 10),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`AI route returned ${response.status}.`);
        }

        const payload = (await response.json()) as unknown;

        if (!isCancelled && isAiStudyRecommendation(payload)) {
          setRecommendation(payload);
        }
      } catch (error) {
        if (isAbortError(error) || isCancelled) {
          return;
        }

        setRecommendation(nextFallback);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchRecommendation();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [records]);

  return {
    recommendation,
    isLoading,
  };
}

function createFallbackRecommendation(records: StudyRecord[]) {
  return {
    ...buildStudyRecommendation(records),
    source: "local" as const,
  };
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
    (candidate.source === "local" || candidate.source === "openai")
  );
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}
