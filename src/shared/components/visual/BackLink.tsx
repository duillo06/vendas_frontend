import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { cn } from "@/shared/lib/utils";

type BackLinkProps = {
  to: string;
  label: string;
  className?: string;
};

export function BackLink({ to, label, className }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand transition hover:underline",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}
