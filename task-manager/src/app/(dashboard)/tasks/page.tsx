import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import TasksPageClient from "./page-client";

export default async function TasksPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { assigneeId: session.user.id },
        { assigneeId: null },
      ],
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { position: "asc" },
    ],
  });

  const formattedTasks = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority as "LOW" | "MEDIUM" | "HIGH",
    status: task.status as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE",
    dueDate: task.dueDate?.toISOString() || null,
    assignee: task.assignee,
    position: task.position,
  }));

  // Вычисляем статистику
  const now = new Date();
  const stats = {
    total: tasks.length,
    byStatus: {
      todo: tasks.filter((t) => t.status === "TODO").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      review: tasks.filter((t) => t.status === "REVIEW").length,
      done: tasks.filter((t) => t.status === "DONE").length,
    },
    overdue: tasks.filter((t) => {
      if (!t.dueDate || t.status === "DONE") return false;
      return new Date(t.dueDate) < now;
    }).length,
  };

  return <TasksPageClient initialTasks={formattedTasks} stats={stats} />;
}
