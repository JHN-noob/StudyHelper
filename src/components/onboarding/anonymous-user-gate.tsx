"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SelectionChip } from "@/components/ui/selection-chip";
import { useGuestProfile } from "@/components/providers/guest-profile-provider";

type AnonymousUserGateProps = {
  children: ReactNode;
};

const suggestedAnonymousUserIds = ["focus-note", "study-otter", "deep-work"];

export function AnonymousUserGate({ children }: AnonymousUserGateProps) {
  const { anonymousNickname, isHydrated, saveAnonymousNickname } =
    useGuestProfile();
  const [draftAnonymousNickname, setDraftAnonymousNickname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isHydrated) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/60 to-transparent" />
          <div className="absolute -left-14 top-[-88px] h-56 w-56 rounded-full bg-[rgba(95,107,93,0.18)] blur-3xl" />
          <div className="absolute right-[-36px] top-[-72px] h-48 w-48 rounded-full bg-[rgba(180,135,83,0.16)] blur-3xl" />
        </div>
        <div className="relative mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4 py-10">
          <div className="w-full rounded-[32px] border border-border bg-surface p-8 shadow-[0_18px_36px_rgba(38,31,24,0.08)]">
            <p className="text-sm font-medium text-muted-foreground">
              닉네임 정보를 불러오는 중입니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (anonymousNickname) {
    return children;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const sanitizedAnonymousNickname = draftAnonymousNickname.trim();

    if (sanitizedAnonymousNickname.length < 2) {
      setErrorMessage("익명 닉네임은 두 글자 이상으로 입력해주세요.");
      return;
    }

    if (sanitizedAnonymousNickname.length > 24) {
      setErrorMessage("익명 닉네임은 스물네 글자 이하로 입력해주세요.");
      return;
    }

    saveAnonymousNickname(sanitizedAnonymousNickname);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/60 to-transparent" />
        <div className="absolute -left-14 top-[-88px] h-56 w-56 rounded-full bg-[rgba(95,107,93,0.18)] blur-3xl" />
        <div className="absolute right-[-36px] top-[-72px] h-48 w-48 rounded-full bg-[rgba(180,135,83,0.16)] blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4 py-10">
        <section className="w-full rounded-[32px] border border-border bg-surface p-6 shadow-[0_18px_36px_rgba(38,31,24,0.08)] sm:p-8">
          <span className="inline-flex rounded-full border border-border bg-surface-muted px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent-strong)]">
            Welcome
          </span>
          <h1 className="mt-4 text-[1.92rem] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-4xl">
            먼저 익명 닉네임을 정해주세요.
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground sm:text-base">
            로그인 없이 바로 쓰는 공부 기록 앱입니다. 닉네임은 앱에서 나를
            보여주는 용도이고, 공부 기록과 통계는 현재 익명 세션에 이어집니다.
          </p>

          <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                익명 닉네임
              </span>
              <input
                type="text"
                value={draftAnonymousNickname}
                onChange={(event) => {
                  setDraftAnonymousNickname(event.target.value);
                  setErrorMessage("");
                }}
                placeholder="예: study-otter"
                className="mt-2 h-12 w-full rounded-[18px] border border-border bg-surface-muted px-4 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-foreground focus:bg-surface"
              />
            </label>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                빠르게 시작하기
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestedAnonymousUserIds.map((candidate) => (
                  <SelectionChip
                    key={candidate}
                    onClick={() => {
                      setDraftAnonymousNickname(candidate);
                      setErrorMessage("");
                    }}
                  >
                    {candidate}
                  </SelectionChip>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-dashed border-border bg-surface-muted p-4">
              <p className="text-[15px] leading-7 text-muted-foreground">
                {errorMessage ||
                  "닉네임을 정하면 홈, 기록, 통계 화면으로 바로 이동할 수 있어요."}
              </p>
            </div>

            <Button type="submit" variant="primary">
              시작하기
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
