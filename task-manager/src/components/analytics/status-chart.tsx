"use client";

interface StatusChartProps {
  data: {
    todo: number;
    inProgress: number;
    review: number;
    done: number;
  };
}

export function StatusChart({ data }: StatusChartProps) {
  const total = data.todo + data.inProgress + data.review + data.done;

  const bars = [
    { label: "To Do", value: data.todo, color: "bg-slate-600", percentage: total > 0 ? (data.todo / total) * 100 : 0 },
    { label: "In Progress", value: data.inProgress, color: "bg-yellow-500", percentage: total > 0 ? (data.inProgress / total) * 100 : 0 },
    { label: "Review", value: data.review, color: "bg-blue-500", percentage: total > 0 ? (data.review / total) * 100 : 0 },
    { label: "Done", value: data.done, color: "bg-green-500", percentage: total > 0 ? (data.done / total) * 100 : 0 },
  ];

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Распределение по статусам</h3>
      <div className="space-y-4">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-300">{bar.label}</span>
              <span className="text-slate-400">{bar.value} ({bar.percentage.toFixed(0)}%)</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full ${bar.color} transition-all duration-500`}
                style={{ width: `${bar.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
