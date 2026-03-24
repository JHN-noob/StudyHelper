import { NextResponse } from "next/server";
import { buildStudyRecommendation } from "@/lib/stats";
import type {
  AIStudyRecommendation,
  StudyRecord,
} from "@/lib/types";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5-mini";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const records = coerceRecords(body);
    const fallbackRecommendation = createFallbackRecommendation(records);

    if (records.length === 0) {
      return NextResponse.json(fallbackRecommendation);
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(fallbackRecommendation);
    }

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        max_output_tokens: 260,
        text: {
          format: {
            type: "json_object",
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

      return NextResponse.json(
        {
          ...fallbackRecommendation,
          debugMessage: `OpenAI request failed: ${response.status} ${errorBody}`,
        },
        { status: 200 },
      );
    }

    const payload = (await response.json()) as unknown;
    const outputText = extractOutputText(payload);

    if (!outputText) {
      return NextResponse.json(fallbackRecommendation);
    }

    const parsedPayload = safeParseJson(outputText);

    if (!isRecommendationPayload(parsedPayload)) {
      return NextResponse.json(fallbackRecommendation);
    }

    return NextResponse.json({
      summary: parsedPayload.summary,
      recommendation: parsedPayload.recommendation,
      focusSubject: parsedPayload.focusSubject,
      source: "openai",
    } satisfies AIStudyRecommendation);
  } catch {
    return NextResponse.json(createFallbackRecommendation([]));
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

function createFallbackRecommendation(records: StudyRecord[]) {
  return {
    ...buildStudyRecommendation(records),
    source: "local" as const,
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
      content?: Array<{
        type?: string;
        text?: string;
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
    if (!Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (content.type === "output_text" && typeof content.text === "string") {
        return content.text;
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
