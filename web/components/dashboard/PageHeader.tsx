import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="
      mb-6 flex flex-col gap-1
      sm:flex-row sm:items-center sm:justify-between
    ">
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        )}
      </div>
      {action && <div className="
        mt-3
        sm:mt-0
      ">{action}</div>}
    </div>
  );
}
