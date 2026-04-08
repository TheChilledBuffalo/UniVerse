import clsx from "clsx";
import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: "primary" | "success" | "warning" | "error" | "accent";
  subtext?: string;
};

const colorMap = {
  primary: {
    bg: "bg-primary/10",
    icon: "text-primary",
    border: "border-primary/20",
  },
  success: {
    bg: "bg-success/10",
    icon: "text-success",
    border: "border-success/20",
  },
  warning: {
    bg: "bg-warning/10",
    icon: "text-warning",
    border: "border-warning/20",
  },
  error: {
    bg: "bg-error/10",
    icon: "text-error",
    border: "border-error/20",
  },
  accent: {
    bg: "bg-accent/10",
    icon: "text-accent",
    border: "border-accent/20",
  },
};

export default function StatCard({
  label,
  value,
  icon,
  color = "primary",
  subtext,
}: StatCardProps) {
  const c = colorMap[color];
  return (
    <div
      className={clsx(
        `
          flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm
          transition-shadow
          hover:shadow-md
        `,
        c.border,
      )}
    >
      <div
        className={clsx(
          "flex size-12 shrink-0 items-center justify-center rounded-xl",
          c.bg,
          c.icon,
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {subtext && <p className="mt-0.5 text-xs text-muted">{subtext}</p>}
      </div>
    </div>
  );
}
