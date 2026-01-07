"use client";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "warning" | "danger" | "success";
}

export function StatCard({ title, value, description, icon, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "border-white/10 bg-white/5",
    warning: "border-yellow-500/20 bg-yellow-500/10",
    danger: "border-red-500/20 bg-red-500/10",
    success: "border-green-500/20 bg-green-500/10",
  };

  return (
    <div className={`rounded-lg border p-4 transition-all hover:border-white/20 ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        </div>
        {icon && <div className="ml-4 text-slate-400">{icon}</div>}
      </div>
    </div>
  );
}

interface StatsCardsProps {
  stats: {
    total: number;
    byStatus: {
      todo: number;
      inProgress: number;
      review: number;
      done: number;
    };
    overdue: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Всего задач"
        value={stats.total}
        variant="default"
        icon={
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
      />
      <StatCard
        title="To Do"
        value={stats.byStatus.todo}
        variant="default"
      />
      <StatCard
        title="In Progress"
        value={stats.byStatus.inProgress}
        variant="warning"
      />
      <StatCard
        title="Review"
        value={stats.byStatus.review}
        variant="warning"
      />
      <StatCard
        title="Done"
        value={stats.byStatus.done}
        variant="success"
      />
      <StatCard
        title="Просрочено"
        value={stats.overdue}
        description={stats.overdue > 0 ? "Требуют внимания" : "Все в срок"}
        variant={stats.overdue > 0 ? "danger" : "default"}
        icon={
          stats.overdue > 0 ? (
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      />
    </div>
  );
}
