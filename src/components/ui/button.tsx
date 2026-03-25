import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import Link, { type LinkProps } from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "sm" | "compact";

type CommonButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonAsLinkProps = CommonButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  LinkProps & {
    href: string;
  };

type ButtonAsButtonProps = CommonButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

export type ButtonProps = ButtonAsLinkProps | ButtonAsButtonProps;

export function getButtonClassName(
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center rounded-full transition",
    size === "md"
      ? "h-12 px-5 text-sm font-semibold"
      : size === "sm"
        ? "h-11 px-4 text-sm font-semibold"
        : "h-10 px-4 text-sm font-medium",
    variant === "primary"
      ? "ui-action-solid"
      : variant === "ghost"
        ? "border border-border bg-surface px-4 text-muted-foreground hover:border-foreground hover:text-foreground"
        : "border border-border bg-surface-muted text-foreground hover:bg-surface",
    className,
  );
}

export function Button(props: ButtonProps) {
  if ("href" in props && typeof props.href === "string") {
    const {
      children,
      className,
      variant = "secondary",
      size = "md",
      href,
      ...linkProps
    } = props;

    return (
      <Link
        {...linkProps}
        href={href}
        className={getButtonClassName(variant, size, className)}
      >
        {children}
      </Link>
    );
  }

  const {
    children,
    className,
    variant = "secondary",
    size = "md",
    type = "button",
    ...buttonProps
  } = props;

  return (
    <button
      {...buttonProps}
      type={type}
      className={getButtonClassName(variant, size, className)}
    >
      {children}
    </button>
  );
}
