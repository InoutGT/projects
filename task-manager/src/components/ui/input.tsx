import React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
