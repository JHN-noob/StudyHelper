"use client";

import { AppShell } from "@/components/layout/app-shell";
import { NicknameSettingsPanel } from "@/components/settings/nickname-settings-panel";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";
import { SummaryPanel } from "@/components/ui/summary-panel";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeading
        eyebrow="Settings"
        title="닉네임과 사용 방식을 가볍게 정리해보세요."
        description="익명 닉네임을 바꾸거나 초기화할 수 있고, AI 추천이 어떤 정보를 사용하는지도 여기서 확인할 수 있어요."
        actions={
          <Button href="/" variant="secondary">
            홈으로 돌아가기
          </Button>
        }
      />

      <div className="grid gap-4">
        <NicknameSettingsPanel />

        <SummaryPanel
          tone="muted"
          eyebrow="AI 사용 안내"
          title="추천 카드는 공부 기록 일부를 사용해요."
          description="추천 카드를 만들 때 공부 날짜, 과목, 공부 시간, 메모 내용 일부가 OpenAI API로 전송될 수 있어요. 공부 메모에는 비밀번호, 계정 정보, 연락처 같은 민감한 개인정보를 적지 않는 것을 권장해요."
        >
          <p className="text-sm leading-7 text-muted-foreground">
            OpenAI 연결이 실패하면 추천 카드는 로컬 규칙 기반 요약으로
            대체되며, 운영환경에서는 내부 디버그 메시지를 화면에 노출하지
            않아요.
          </p>
        </SummaryPanel>
      </div>
    </AppShell>
  );
}
