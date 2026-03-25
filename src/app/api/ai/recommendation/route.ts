import { NextResponse } from "next/server";
import { buildStudyRecommendation } from "@/lib/stats";
import type {
  AIStudyRecommendation,
  StudyRecord,
} from "@/lib/types";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5-mini";
const OPENAI_MAX_OUTPUT_TOKENS = 1400;
const SHOULD_EXPOSE_DEBUG_MESSAGE = process.env.NODE_ENV !== "production";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let recordsForFallback: StudyRecord[] = [];

  try {
    const body = (await request.json()) as unknown;
    const records = coerceRecords(body);
    recordsForFallback = records;
    const fallbackRecommendation = createFallbackRecommendation(records, undefined);

    if (records.length === 0) {
      return NextResponse.json(fallbackRecommendation);
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        createFallbackRecommendation(records, "OPENAI_API_KEY is missing."),
      );
    }

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        max_output_tokens: OPENAI_MAX_OUTPUT_TOKENS,
        reasoning: {
          effort: "minimal",
          summary: "auto",
        },
        text: {
          format: {
            type: "json_schema",
            name: "study_recommendation",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                summary: {
                  type: "string",
                },
                recommendation: {
                  type: "string",
                },
                focusSubject: {
                  type: ["string", "null"],
                },
              },
              required: ["summary", "recommendation", "focusSubject"],
            },
          },
        },
        input: [
          {
            role: "system",
            content:
              "You are a concise study coach. Return JSON with keys summary, recommendation, focusSubject. Keep summary and recommendation each under 80 Korean characters. focusSubject must be a string or null.",
          },
          {
            role: "user",
            content: buildPrompt(records),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      const debugMessage = `OpenAI request failed: ${response.status} ${truncateText(errorBody)}`;

      logServerError(debugMessage);

      return NextResponse.json(createFallbackRecommendation(records, debugMessage));
    }

    const payload = (await response.json()) as unknown;
    const incompleteReason = getIncompleteReason(payload);

    if (incompleteReason) {
      const debugMessage =
        `OpenAI response was incomplete: ${incompleteReason}. Try a higher max_output_tokens or lower reasoning effort.`;
      logServerError(debugMessage);

      return NextResponse.json(
        createFallbackRecommendation(
          records,
          debugMessage,
        ),
      );
    }

    const outputText = extractOutputText(payload);

    if (!outputText) {
      const debugMessage =
        `OpenAI response did not include readable text. ${summarizeOutputShape(payload)}`;
      logServerError(debugMessage);

      return NextResponse.json(
        createFallbackRecommendation(
          records,
          debugMessage,
        ),
      );
    }

    const parsedPayload = safeParseJson(outputText);

    if (!isRecommendationPayload(parsedPayload)) {
      logServerError("OpenAI response JSON did not match the expected shape.");

      return NextResponse.json(
        createFallbackRecommendation(
          records,
          "OpenAI response JSON did not match the expected shape.",
        ),
      );
    }

    return NextResponse.json({
      summary: parsedPayload.summary,
      recommendation: parsedPayload.recommendation,
      focusSubject: parsedPayload.focusSubject,
      source: "openai",
    } satisfies AIStudyRecommendation);
  } catch (error) {
    logServerError("Unexpected AI route failure.", error);

    return NextResponse.json(
      createFallbackRecommendation(recordsForFallback, getErrorDetail(error)),
    );
  }
}

function coerceRecords(body: unknown) {
  if (!body || typeof body !== "object") {
    return [] as StudyRecord[];
  }

  const candidate = body as { records?: unknown };

  if (!Array.isArray(candidate.records)) {
    return [] as StudyRecord[];
  }

  return candidate.records.filter(isStudyRecord).slice(0, 10);
}

function createFallbackRecommendation(
  records: StudyRecord[],
  debugMessage?: string,
) {
  if (debugMessage && !SHOULD_EXPOSE_DEBUG_MESSAGE) {
    return {
      ...buildStudyRecommendation(records),
      source: "local" as const,
    };
  }

  return {
    ...buildStudyRecommendation(records),
    source: "local" as const,
    debugMessage,
  };
}

function buildPrompt(records: StudyRecord[]) {
  const compactRecords = records.map((record) => ({
    studyDate: record.studyDate,
    subject: record.subject,
    durationMinutes: record.durationMinutes,
    content: record.content,
  }));

  return [
    "다음 최근 공부 기록을 보고 짧은 학습 요약과 다음 추천을 만들어줘.",
    "균형이 부족한 과목, 공부 시간 편중, 복습 포인트를 우선적으로 반영해.",
    "JSON만 반환해.",
    JSON.stringify(compactRecords),
  ].join("\n\n");
}

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const candidate = payload as {
    output_text?: unknown;
    output?: Array<{
      type?: string;
      refusal?: string;
      content?: Array<{
        type?: string;
        text?: string;
        refusal?: string;
      }>;
    }>;
  };

  if (typeof candidate.output_text === "string") {
    return candidate.output_text;
  }

  if (!Array.isArray(candidate.output)) {
    return "";
  }

  for (const item of candidate.output) {
    if (typeof item.refusal === "string") {
      return JSON.stringify({
        summary: "AI 응답이 거절되었어요.",
        recommendation: item.refusal,
        focusSubject: null,
      });
    }

    if (!Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }

       if (typeof content.text === "string") {
        return content.text;
      }

      if (typeof content.refusal === "string") {
        return JSON.stringify({
          summary: "AI 응답이 거절되었어요.",
          recommendation: content.refusal,
          focusSubject: null,
        });
      }
    }
  }

  return "";
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function isRecommendationPayload(
  value: unknown,
): value is Omit<AIStudyRecommendation, "source"> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Omit<AIStudyRecommendation, "source">;

  return (
    typeof candidate.summary === "string" &&
    typeof candidate.recommendation === "string" &&
    (typeof candidate.debugMessage === "string" ||
      typeof candidate.debugMessage === "undefined") &&
    (typeof candidate.focusSubject === "string" ||
      candidate.focusSubject === null)
  );
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

function getErrorDetail(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown server error.";
}

function logServerError(message: string, error?: unknown) {
  if (error) {
    console.error("[api/ai/recommendation]", message, error);
    return;
  }

  console.error("[api/ai/recommendation]", message);
}

function truncateText(value: string, maxLength = 180) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
}

function summarizeOutputShape(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "Payload was not an object.";
  }

  const candidate = payload as {
    output?: Array<{
      type?: string;
      content?: Array<{
        type?: string;
      }>;
    }>;
  };

  if (!Array.isArray(candidate.output) || candidate.output.length === 0) {
    return "output array was empty.";
  }

  const shape = candidate.output
    .map((item) => {
      const contentTypes = Array.isArray(item.content)
        ? item.content.map((content) => content.type ?? "unknown").join(",")
        : "no-content";

      return `${item.type ?? "unknown"}[${contentTypes}]`;
    })
    .join(" | ");

  return `output shape: ${shape}`;
}

function getIncompleteReason(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const candidate = payload as {
    status?: unknown;
    incomplete_details?: {
      reason?: unknown;
    } | null;
  };

  if (candidate.status !== "incomplete") {
    return "";
  }

  const reason = candidate.incomplete_details?.reason;

  return typeof reason === "string" ? reason : "unknown";
}
