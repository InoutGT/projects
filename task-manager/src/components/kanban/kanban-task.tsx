"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";

import type { Task } from "./kanban-board";

interface KanbanTaskProps {
  task: Task;
  isDragging?: boolean;
}

export function KanbanTask({ task, isDragging = false }: KanbanTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  const priorityColors = {
    LOW: "bg-slate-600",
    MEDIUM: "bg-yellow-500",
    HIGH: "bg-red-500",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group cursor-grab rounded-lg border border-white/10 bg-slate-900/50 p-3 shadow-sm transition-all hover:border-white/20 hover:shadow-md ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="flex-1 text-sm font-semibold text-white">{task.title}</h4>
        <div className={`h-2 w-2 rounded-full ${priorityColors[task.priority]}`} />
      </div>

      {task.description && (
        <p className="mb-2 text-xs text-slate-400 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full bg-slate-700" />
              <span className="text-xs text-slate-400">
                {task.assignee.name || task.assignee.email.split("@")[0]}
              </span>
            </div>
          )}
        </div>

        {task.dueDate && (
          <span
            className={`text-xs font-medium ${
              isOverdue ? "text-red-400" : "text-slate-400"
            }`}
          >
            {format(new Date(task.dueDate), "d MMM")}
          </span>
        )}
      </div>

      {isOverdue && (
        <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
          <span>⚠️</span>
          <span>Просрочено</span>
        </div>
      )}
    </div>
  );
}
