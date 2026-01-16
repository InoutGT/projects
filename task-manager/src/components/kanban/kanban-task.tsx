"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import type { Task } from "./kanban-board";
import { deleteTaskAction, updateTaskAction } from "@/app/(dashboard)/tasks/actions";

interface KanbanTaskProps {
  task: Task;
  isDragging?: boolean;
}

export function KanbanTask({ task, isDragging = false }: KanbanTaskProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
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

  const handleDelete = async () => {
    if (confirm("Удалить задачу?")) {
      await deleteTaskAction(task.id);
      router.refresh();
    }
  };

  const handleEdit = async (formData: FormData) => {
    formData.append("taskId", task.id);
    await updateTaskAction(formData);
    setIsEditing(false);
    router.refresh();
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-white/10 bg-slate-900/50 p-3">
        <form action={handleEdit} className="space-y-2">
          <Input name="title" defaultValue={task.title} required />
          <TextArea name="description" defaultValue={task.description || ""} rows={2} />
          <select
            name="priority"
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white"
            defaultValue={task.priority}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <select
            name="status"
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white"
            defaultValue={task.status}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>
          <Input
            name="dueDate"
            type="date"
            defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
          />
          <div className="flex gap-1">
            <Button type="submit" className="flex-1 text-xs">
              Сохранить
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditing(false)}
              className="text-xs"
            >
              Отмена
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border border-white/10 bg-slate-900/50 p-3 shadow-sm transition-all hover:border-white/20 hover:shadow-md ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4
          {...attributes}
          {...listeners}
          className="flex-1 cursor-grab text-sm font-semibold text-white"
        >
          {task.title}
        </h4>
        <div className="flex items-center gap-1">
          <div className={`h-2 w-2 rounded-full ${priorityColors[task.priority]}`} />
          <Button
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-5 w-5 p-0 text-xs opacity-0 transition-opacity group-hover:opacity-100"
          >
            ✏️
          </Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="h-5 w-5 p-0 text-xs text-red-400 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
          >
            ×
          </Button>
        </div>
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
