"use client";

import clsx from "clsx";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type Option = { label: string; value: string | number };

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  required = false,
}: {
  options: Option[];
  value: string | number | "";
  onChange: (val: string | number | "") => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedOption = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative" ref={ref}>
      {/* Hidden input to ensure required validation passes during form submit if value is present */}
      {required && (
        <input
          type="text"
          required={required}
          value={value}
          onChange={() => {}}
          className="
            pointer-events-none absolute bottom-0 left-0 size-full opacity-0
          "
          tabIndex={-1}
        />
      )}
      <div
        className="
          flex min-h-[44px] cursor-pointer items-center justify-between
          rounded-xl border border-border bg-white px-4 py-2.5 text-sm
          focus-within:border-primary focus-within:ring-2
          focus-within:ring-primary/20
        "
        onClick={() => setOpen(!open)}
      >
        <span className={clsx("truncate", !selectedOption && "text-muted")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown size={15} className="ml-2 shrink-0 text-muted" />
      </div>

      {open && (
        <div className="
          absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border
          border-border bg-white p-1 shadow-lg
        ">
          <div className="
            sticky top-0 flex items-center border-b border-border bg-white p-2
          ">
            <Search size={14} className="mr-2 shrink-0 text-muted" />
            <input
              type="text"
              autoFocus
              className="
                w-full bg-transparent text-sm
                focus:outline-none
              "
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="mt-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-center text-sm text-muted">
                No results found.
              </div>
            ) : (
              filtered.slice(0, 100).map((opt) => (
                <div
                  key={opt.value}
                  className={clsx(
                    `
                      flex cursor-pointer items-center justify-between
                      rounded-lg px-3 py-2 text-sm transition-colors
                      hover:bg-surface
                    `,
                    value === opt.value
                      ? "bg-primary/5 font-medium text-primary"
                      : "text-foreground",
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && (
                    <Check size={14} className="ml-2 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
