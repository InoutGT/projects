import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "danger";

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "bg-white/10 text-white",
  success: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30",
  warning: "bg-amber-500/20 text-amber-100 border border-amber-500/30",
  danger: "bg-rose-500/20 text-rose-100 border border-rose-500/30",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
