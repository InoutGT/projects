import React from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white hover:brightness-110",
  secondary:
    "bg-slate-800 text-slate-50 border border-white/10 hover:border-white/20",
  ghost: "bg-transparent text-slate-100 hover:bg-white/5 border border-transparent",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export function Button({
  className,
  variant = "primary",
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:opacity-60 disabled:cursor-not-allowed",
        variantStyles[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
