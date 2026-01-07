"use client";

import { useDroppable } from "@dnd-kit/core";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";

interface ProjectKanbanColumnProps {
  id: string;
  title: string;
  taskCount?: number;
  onDelete?: () => void;
  onCreateTask?: (formData: FormData) => void;
  children: React.ReactNode;
}

export function ProjectKanbanColumn({
  id,
  title,
  taskCount,
  onDelete,
  onCreateTask,
  children,
}: ProjectKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border border-white/10 bg-white/5 flex flex-col gap-4 p-6 transition-colors shadow-lg flex-shrink-0 w-[600px] ${
        isOver ? "border-blue-500/50 bg-blue-500/10" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">Колонка</p>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        {taskCount !== undefined && (
          <div className="flex items-center gap-2">
            <Badge variant="neutral" className="text-sm px-2 py-1">{taskCount}</Badge>
            {onDelete && (
              <Button
                onClick={onDelete}
                variant="ghost"
                size="sm"
                type="button"
                className="text-red-400 hover:text-red-300 text-lg"
              >
                ×
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 flex-1 min-h-[150px]">{children}</div>

      {onCreateTask && (
        <div className="mt-auto space-y-3 rounded-lg border border-dashed border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white mb-1">Новая задача</p>
          <form action={onCreateTask} className="space-y-3">
            <input type="hidden" name="columnId" value={id} />
            <Input name="title" placeholder="Название" required className="text-sm" />
            <TextArea name="description" placeholder="Короткое описание" rows={2} className="text-sm" />
            <select
              name="priority"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white focus:border-blue-400 focus:outline-none"
              defaultValue="MEDIUM"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
            <Button type="submit" variant="secondary" fullWidth className="py-2.5">
              Добавить задачу
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
