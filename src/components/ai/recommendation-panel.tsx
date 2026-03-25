"use client";

import { Panel } from "@/components/ui/panel";

type RecommendationPanelProps = {
  eyebrow: string;
  title: string;
  summary: string;
  recommendation: string;
  bodyLabel?: string;
  meta?: string;
  debugMessage?: string;
  showDebug?: boolean;
};

export function RecommendationPanel({
  eyebrow,
  title,
  summary,
  recommendation,
  bodyLabel,
  meta,
  debugMessage,
  showDebug = false,
}: RecommendationPanelProps) {
  return (
    <Panel tone="accent" className="gap-4">
      <div
        className={
          meta
            ? "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
            : undefined
        }
      >
        <div>
          <p className="text-sm font-medium text-white/72">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        </div>
        {meta ? (
          <p className="text-sm font-medium text-white/72">{meta}</p>
        ) : null}
      </div>

      <p className="text-[15px] leading-7 text-white/88">{summary}</p>

      <div className="rounded-[24px] border border-white/18 bg-white/8 p-4">
        {bodyLabel ? (
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
            {bodyLabel}
          </p>
        ) : null}
        <p className={bodyLabel ? "mt-2 text-[15px] leading-7 text-white" : "text-[15px] leading-7 text-white"}>
          {recommendation}
        </p>
        {showDebug && debugMessage ? (
          <p className="mt-3 text-xs leading-6 text-white/70">
            debug: {debugMessage}
          </p>
        ) : null}
      </div>
    </Panel>
  );
}
