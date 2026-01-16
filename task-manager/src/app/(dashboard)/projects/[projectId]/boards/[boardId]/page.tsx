import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Navigation } from "@/components/navigation";
import type { ProjectColumn } from "@/components/kanban/project-kanban-board";
import { prisma } from "@/lib/prisma";

import { ProjectBoardPageClient } from "./page-client";

export default async function ProjectBoardPage({
  params,
}: {
  params: Promise<{ projectId: string; boardId: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const { projectId, boardId } = await params;

  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      projectId: projectId,
      project: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
    },
    include: {
      project: {
        select: { id: true, name: true },
      },
      columns: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
            include: {
              assignee: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
    },
  });

  if (!board) {
    redirect(`/projects/${projectId}`);
  }

  // Преобразуем данные для клиентского компонента
  const columns: ProjectColumn[] = board.columns.map((column) => ({
    id: column.id,
    title: column.title,
    position: column.position,
    tasks: column.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate?.toISOString() || null,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
          }
        : null,
      position: task.position,
      columnId: task.columnId || column.id,
    })),
  }));

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Link
              href={`/projects/${projectId}`}
              className="text-sm text-slate-400 hover:text-slate-300"
            >
              ← {board.project?.name || "Проект"}
            </Link>
          </div>
          <h1 className="text-3xl font-semibold text-white">{board.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Navigation />
        </div>
      </header>

      <ProjectBoardPageClient
        boardId={board.id}
        projectId={projectId}
        initialColumns={columns}
      />
    </main>
  );
}
