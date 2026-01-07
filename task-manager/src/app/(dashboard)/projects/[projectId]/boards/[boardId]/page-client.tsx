"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { ProjectKanbanBoard, type ProjectColumn } from "@/components/kanban/project-kanban-board";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";

import { createColumnAction, createTaskAction, deleteColumnAction, moveTaskToColumnAction } from "@/app/(dashboard)/actions";

interface ProjectBoardPageClientProps {
  boardId: string;
  projectId: string;
  initialColumns: ProjectColumn[];
}

export function ProjectBoardPageClient({
  boardId,
  projectId,
  initialColumns,
}: ProjectBoardPageClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleTaskMove = (taskId: string, newColumnId: string, newPosition: number) => {
    startTransition(async () => {
      await moveTaskToColumnAction(taskId, newColumnId, newPosition);
      router.refresh();
    });
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (confirm("Удалить колонку? Все задачи в ней будут удалены.")) {
      await deleteColumnAction(columnId);
      router.refresh();
    }
  };

  const handleCreateTask = async (formData: FormData) => {
    await createTaskAction(formData);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Колонки доски</h2>
        </div>
        {initialColumns.length > 0 ? (
          <div className="flex flex-col gap-6">
            <ProjectKanbanBoard
              initialColumns={initialColumns}
              onTaskMove={handleTaskMove}
              onDeleteColumn={handleDeleteColumn}
              onCreateTask={handleCreateTask}
            />

            {/* Форма создания колонки */}
            <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 max-w-md">
              <h3 className="mb-3 text-sm font-semibold text-white">Создать колонку</h3>
              <form
                action={async (formData) => {
                  await createColumnAction(formData);
                  router.refresh();
                }}
                className="space-y-2"
              >
                <input type="hidden" name="boardId" value={boardId} />
                <Input name="title" placeholder="Например: Review" required />
                <Button type="submit" variant="secondary" fullWidth>
                  Создать
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-8 text-center">
            <p className="mb-4 text-slate-400">Пока нет колонок в этой доске</p>
            <form
              action={async (formData) => {
                await createColumnAction(formData);
                router.refresh();
              }}
              className="mx-auto max-w-md space-y-3"
            >
              <input type="hidden" name="boardId" value={boardId} />
              <Input name="title" placeholder="Название колонки" required />
              <Button type="submit" variant="secondary" fullWidth>
                Создать первую колонку
              </Button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
