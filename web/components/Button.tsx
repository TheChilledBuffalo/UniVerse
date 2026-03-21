import clsx from "clsx";
import React from "react";

type ButtonProps = {
  fullWidth?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        `
          min-w-1/2 self-center rounded-xl bg-violet-600 py-3 font-semibold
          text-white shadow-md transition-all duration-200
          hover:bg-violet-700 hover:shadow-lg
          active:scale-[0.98]
        `,
        className,
        fullWidth && "w-full",
      )}
    >
      {children}
    </button>
  );
}
