import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";

import { createProjectAction } from "./actions";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/signin" });
}

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Получаем проекты, где пользователь владелец или участник
  const projects = await prisma.project.findMany({
    where: {
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
      },
      _count: {
        select: { boards: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Проекты</h1>
          <p className="text-sm text-slate-400">
            {session.user.email} · {projects.length} проектов
          </p>
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

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group relative rounded-lg border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-1 text-lg font-semibold text-white">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-slate-400">{project.description}</p>
                )}
              </div>
              {project.ownerId === session.user.id && (
                <Badge variant="neutral">Владелец</Badge>
              )}
            </div>

            <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
              <span>{project._count.boards} досок</span>
              <span>·</span>
              <span>{project.members.length + 1} участников</span>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 ring-2 ring-slate-900" />
                {project.members.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="h-8 w-8 rounded-full bg-slate-700 ring-2 ring-slate-900"
                    title={member.user.name || member.user.email}
                  />
                ))}
                {project.members.length > 3 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs text-slate-400 ring-2 ring-slate-900">
                    +{project.members.length - 3}
                  </div>
                )}
              </div>
              <span className="text-xs text-slate-500">
                {project.owner.name || project.owner.email}
              </span>
            </div>

            <div className="flex gap-2">
              <Link href={`/projects/${project.id}`} className="flex-1">
                <Button variant="secondary" fullWidth>
                  Открыть
                </Button>
              </Link>
            </div>
          </div>
        ))}

        <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-6">
          <h3 className="mb-3 text-lg font-semibold text-white">Создать проект</h3>
          <form action={createProjectAction} className="space-y-3">
            <Input name="name" placeholder="Название проекта" required />
            <TextArea
              name="description"
              placeholder="Описание (необязательно)"
              rows={3}
            />
            <Button type="submit" fullWidth>
              Создать
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
