import { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="
      flex flex-col items-center justify-center rounded-2xl border border-dashed
      border-border bg-white py-16 text-center
    ">
      <div className="
        mb-4 flex size-16 items-center justify-center rounded-2xl bg-surface
        text-muted
      ">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
