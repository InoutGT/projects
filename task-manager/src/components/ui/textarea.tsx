import React from "react";

import { cn } from "@/lib/utils";

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40",
        className,
      )}
      {...props}
    />
  ),
);

TextArea.displayName = "TextArea";
