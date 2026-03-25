"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { NicknameSettingsPanel } from "@/components/settings/nickname-settings-panel";
import { PageHeading } from "@/components/ui/page-heading";
import { Panel } from "@/components/ui/panel";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeading
        eyebrow="Settings"
        title="닉네임과 사용 방식을 가볍게 정리하세요."
        description="익명 닉네임을 바꾸거나 초기화할 수 있고, AI 추천이 어떤 정보를 사용하는지도 여기에서 확인할 수 있습니다."
        actions={
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface-muted px-5 text-sm font-semibold text-foreground transition hover:bg-surface"
          >
            홈으로 돌아가기
          </Link>
        }
      />

      <div className="grid gap-4">
        <NicknameSettingsPanel />

        <Panel tone="muted" className="gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              AI 사용 안내
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              추천 카드에는 공부 기록 일부가 사용됩니다.
            </h2>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">
            추천 카드 생성 시 공부 날짜, 과목, 공부 시간, 메모 내용 일부가
            OpenAI API로 전송될 수 있습니다. 공부 메모에는 비밀번호, 계정 정보,
            연락처 같은 민감한 개인정보를 적지 않는 것을 권장합니다.
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            OpenAI 연결이 실패하면 추천 카드는 로컬 규칙 기반 요약으로
            대체되며, 운영환경에서는 내부 디버그 오류 메시지를 화면에 노출하지
            않습니다.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
