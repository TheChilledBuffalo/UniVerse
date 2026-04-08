import { ReactNode } from "react";

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
};

type DataTableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
};

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyMessage = "No data found.",
}: DataTableProps<T>) {
  return (
    <div className="
      overflow-hidden rounded-2xl border border-border bg-white shadow-sm
    ">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="
                    px-4 py-3 text-left text-xs font-semibold tracking-wider
                    text-muted uppercase
                  "
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={String(row[keyField])}
                  className="
                    border-b border-border/60 transition-colors
                    last:border-0
                    hover:bg-surface/50
                  "
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-foreground">
                      {col.render
                        ? col.render(row)
                        : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
