"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { StatsCards } from "@/components/analytics/stats-cards";
import { StatusChart } from "@/components/analytics/status-chart";
import { KanbanBoard, type Task } from "@/components/kanban/kanban-board";

import { createTaskAction, updateTaskStatusAction } from "./actions";

interface Stats {
  total: number;
  byStatus: {
    todo: number;
    inProgress: number;
    review: number;
    done: number;
  };
  overdue: number;
}

export default function TasksPageClient({
  initialTasks,
  stats,
}: {
  initialTasks: Task[];
  stats: Stats;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleTaskMove = (taskId: string, newStatus: string, newPosition: number) => {
    startTransition(async () => {
      await updateTaskStatusAction(taskId, newStatus, newPosition);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Задачи</h1>
          <p className="text-sm text-slate-400">Управление задачами проекта</p>
        </div>
        <div className="flex items-center gap-4">
          <Navigation />
          <CreateTaskForm />
        </div>
      </div>

      {/* Статистика */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">Аналитика</h2>
        <StatsCards stats={stats} />
      </section>

      {/* График */}
      <section>
        <StatusChart data={stats.byStatus} />
      </section>

      {/* Kanban доска */}
      <KanbanBoard initialTasks={initialTasks} onTaskMove={handleTaskMove} />
    </div>
  );
}

function CreateTaskForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    await createTaskAction(formData);
    setIsOpen(false);
    router.refresh();
  };

  if (!isOpen) {
    return <Button onClick={() => setIsOpen(true)}>Создать задачу</Button>;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-slate-900 p-4">
      <form action={handleSubmit} className="space-y-3">
        <Input name="title" placeholder="Название задачи" required />
        <TextArea name="description" placeholder="Описание" rows={3} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Приоритет</label>
            <select
              name="priority"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              defaultValue="MEDIUM"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Статус</label>
            <select
              name="status"
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              defaultValue="TODO"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-slate-400">Дедлайн</label>
            <Input name="dueDate" type="date" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit">Создать</Button>
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}
