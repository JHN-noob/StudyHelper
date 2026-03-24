import type { ReactNode } from "react";

type PageHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: PageHeadingProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-border bg-surface-muted p-6 shadow-[0_12px_28px_rgba(38,31,24,0.05)] sm:p-8">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent-soft/35 blur-3xl" />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-border bg-surface-muted px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent-strong)]">
            {eyebrow}
          </span>
          <h1 className="mt-4 max-w-3xl text-[1.92rem] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        {actions ? (
          <div className="grid w-full max-w-sm gap-3 sm:flex sm:max-w-none sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
