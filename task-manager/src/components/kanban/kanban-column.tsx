"use client";

import { useDroppable } from "@dnd-kit/core";

interface KanbanColumnProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export function KanbanColumn({ id, title, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border border-white/10 bg-white/5 p-4 transition-colors ${
        isOver ? "border-blue-500/50 bg-blue-500/10" : ""
      }`}
    >
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      <div className="min-h-[200px]">{children}</div>
    </div>
  );
}
