import clsx from "clsx";
import type { ReactNode } from "react";
import React from "react";

type InputFieldProps = {
  label: string;
  rightElement?: ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function InputField({
  label,
  rightElement,
  className,
  ...props
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm leading-none font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          className={clsx(
            `
              w-full rounded-xl border border-[#d8dee9] bg-white px-4 py-3.5
              text-base text-foreground transition-all duration-200
              placeholder:text-muted
              focus:border-primary focus:ring-2 focus:ring-primary/25
              focus:outline-none
            `,
            className,
          )}
        />
        {rightElement ? (
          <div className="
            absolute inset-y-0 right-4 flex items-center text-muted
          ">
            {rightElement}
          </div>
        ) : null}
      </div>
    </div>
  );
}
