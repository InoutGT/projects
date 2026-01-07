import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

import {
  addProjectMemberAction,
  createProjectBoardAction,
  removeProjectMemberAction,
} from "../actions";

import { BoardCard } from "./board-card";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/signin" });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }],
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      boards: {
        orderBy: { createdAt: "asc" },
        include: {
          _count: {
            select: { columns: true },
          },
        },
      },
    },
  });

  if (!project) {
    redirect("/projects");
  }

  const isOwner = project.ownerId === session.user.id;

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Link
              href="/projects"
              className="text-sm text-slate-400 hover:text-slate-300"
            >
              ← Проекты
            </Link>
          </div>
          <h1 className="text-3xl font-semibold text-white">{project.name}</h1>
          {project.description && (
            <p className="mt-2 text-slate-400">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Navigation />
          <form action={signOutAction}>
            <Button variant="ghost" type="submit">
              Выйти
            </Button>
          </form>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Доски проекта</h2>
            </div>
            {project.boards.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {project.boards.map((board) => (
                  <BoardCard
                    key={board.id}
                    boardId={board.id}
                    boardName={board.name}
                    projectId={projectId}
                    columnsCount={board._count.columns}
                  />
                ))}
                <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">Создать доску</h3>
                  <form action={createProjectBoardAction} className="space-y-2">
                    <input type="hidden" name="projectId" value={projectId} />
                    <Input name="name" placeholder="Название доски" required />
                    <Button type="submit" variant="secondary" fullWidth>
                      Создать
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-8 text-center">
                  <p className="mb-4 text-slate-400">Пока нет досок в этом проекте</p>
                  <form action={createProjectBoardAction} className="space-y-3">
                    <input type="hidden" name="projectId" value={projectId} />
                    <Input name="name" placeholder="Название доски" required />
                    <Button type="submit" variant="secondary" fullWidth>
                      Создать первую доску
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Участники</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/50 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {project.owner.name || project.owner.email}
                    </p>
                    <p className="text-xs text-slate-400">Владелец</p>
                  </div>
                </div>
                <Badge variant="neutral">Owner</Badge>
              </div>

              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-700" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.user.name || member.user.email}
                      </p>
                      <p className="text-xs text-slate-400">Участник</p>
                    </div>
                  </div>
                  {isOwner && (
                    <form action={removeProjectMemberAction}>
                      <input type="hidden" name="memberId" value={member.id} />
                      <Button variant="ghost" type="submit" className="h-8 px-2 text-xs">
                        Удалить
                      </Button>
                    </form>
                  )}
                </div>
              ))}
            </div>

            {isOwner && (
              <div className="mt-4 rounded-lg border border-dashed border-white/10 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                  Пригласить участника
                </p>
                <form action={addProjectMemberAction} className="space-y-2">
                  <input type="hidden" name="projectId" value={project.id} />
                  <Input
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    required
                  />
                  <Button type="submit" variant="secondary" fullWidth>
                    Пригласить
                  </Button>
                </form>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
              Статистика
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Досок</span>
                <span className="font-medium text-white">{project.boards.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Участников</span>
                <span className="font-medium text-white">
                  {project.members.length + 1}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Создан</span>
                <span className="font-medium text-white">
                  {new Date(project.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
