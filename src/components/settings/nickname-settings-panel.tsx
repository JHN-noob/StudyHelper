"use client";

import { useState, type FormEvent } from "react";
import { useGuestProfile } from "@/components/providers/guest-profile-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { SelectionChip } from "@/components/ui/selection-chip";
import { SummaryPanel } from "@/components/ui/summary-panel";

const suggestedNicknames = ["focus-note", "study-otter", "deep-work"];

export function NicknameSettingsPanel() {
  const {
    anonymousNickname,
    clearAnonymousNickname,
    saveAnonymousNickname,
  } = useGuestProfile();
  const [draftAnonymousNickname, setDraftAnonymousNickname] = useState(
    anonymousNickname,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const sanitizedAnonymousNickname = draftAnonymousNickname.trim();

    if (sanitizedAnonymousNickname.length < 2) {
      setIsSaved(false);
      setErrorMessage("닉네임은 두 글자 이상으로 입력해주세요.");
      return;
    }

    if (sanitizedAnonymousNickname.length > 24) {
      setIsSaved(false);
      setErrorMessage("닉네임은 스물네 글자 이하로 입력해주세요.");
      return;
    }

    saveAnonymousNickname(sanitizedAnonymousNickname);
    setErrorMessage("");
    setIsSaved(true);
  }

  function handleResetNickname() {
    const shouldResetNickname = window.confirm(
      "닉네임을 초기화할까요? 초기화하면 다시 첫 화면에서 닉네임을 입력하게 돼요.",
    );

    if (!shouldResetNickname) {
      return;
    }

    clearAnonymousNickname();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
      <Panel className="gap-6">
        <SummaryPanel
          eyebrow="닉네임 설정"
          title="지금 쓰는 이름을 편하게 바꿔보세요."
          className="border-0 bg-transparent p-0 shadow-none"
        >
          <div className="rounded-[22px] border border-border bg-surface-muted p-4">
            <p className="text-sm font-medium text-muted-foreground">
              현재 닉네임
            </p>
            <p className="mt-2 text-base font-semibold text-foreground">
              {anonymousNickname}
            </p>
          </div>
        </SummaryPanel>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-foreground">
              새 닉네임
            </span>
            <input
              type="text"
              value={draftAnonymousNickname}
              onChange={(event) => {
                setDraftAnonymousNickname(event.target.value);
                setErrorMessage("");
                setIsSaved(false);
              }}
              className="mt-2 h-12 w-full rounded-[18px] border border-border bg-surface px-4 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-foreground"
              placeholder="예: study-otter"
            />
          </label>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              추천 닉네임
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedNicknames.map((nickname) => (
                <SelectionChip
                  key={nickname}
                  onClick={() => {
                    setDraftAnonymousNickname(nickname);
                    setErrorMessage("");
                    setIsSaved(false);
                  }}
                >
                  {nickname}
                </SelectionChip>
              ))}
            </div>
          </div>

          {errorMessage ? (
            <EmptyState
              title="닉네임을 다시 확인해주세요."
              description={errorMessage}
            />
          ) : isSaved ? (
            <EmptyState
              title="닉네임이 저장됐어요."
              description="이제 상단 바와 앱 전체에서 새 닉네임이 바로 보여요."
            />
          ) : (
            <div className="rounded-[22px] border border-dashed border-border bg-surface-muted p-4">
              <p className="text-[15px] leading-7 text-muted-foreground">
                닉네임은 앱 안에서 나를 구분해 보여주는 이름이에요. 다른 기기와
                자동으로 연결되는 고유 계정 ID는 아니에요.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary" size="sm">
              닉네임 저장
            </Button>
          </div>
        </form>
      </Panel>

      <SummaryPanel
        tone="muted"
        eyebrow="초기화"
        title="첫 화면부터 다시 시작할 수 있어요."
        description="닉네임을 초기화하면 앱이 다시 첫 화면으로 돌아가고 새 닉네임을 입력해야 해요. 공부 기록 자체는 현재 세션 기준으로 그대로 유지돼요."
      >
        <Button type="button" variant="ghost" size="sm" onClick={handleResetNickname}>
          닉네임 초기화
        </Button>
      </SummaryPanel>
    </div>
  );
}
