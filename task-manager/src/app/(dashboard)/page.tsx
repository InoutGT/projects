import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";

import {
  createBoardAction,
  createColumnAction,
  createTaskAction,
  moveTaskAction,
} from "./actions";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/signin" });
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: session.user.id },
    include: {
      boards: {
        orderBy: { createdAt: "asc" },
        include: {
          columns: {
            orderBy: { position: "asc" },
            include: {
              tasks: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!workspace) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6">
        <div className="card space-y-6 p-10 text-center">
          <h1 className="text-3xl font-semibold text-white">
            Workspace пока нет
          </h1>
          <p className="text-slate-400">
            Зарегистрируйтесь заново или проверьте базу данных.
          </p>
          <Link href="/signup" className="text-blue-300 hover:text-blue-200">
            На страницу регистрации
          </Link>
        </div>
      </main>
    );
  }

  const activeBoard = workspace.boards[0];

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            {workspace.name}
          </p>
          <h1 className="text-3xl font-semibold text-white">Доска задач</h1>
          <p className="text-sm text-slate-400">
            {session.user.email} · {workspace.boards.length} бордов
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/projects">
            <Button variant="ghost">Проекты</Button>
          </Link>
          <Link href="/tasks">
            <Button variant="ghost">Задачи</Button>
          </Link>
          <form action={signOutAction}>
            <Button variant="ghost" type="submit">
              Выйти
            </Button>
          </form>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Активный борд
              </p>
              <h2 className="text-xl font-semibold text-white">
                {activeBoard?.name ?? "Борд не создан"}
              </h2>
            </div>
            <Badge variant="neutral">
              {activeBoard?.columns?.length ?? 0} колонок
            </Badge>
          </div>
          {workspace.boards.length > 1 ? (
            <p className="text-sm text-slate-400">
              В этом MVP показан только самый ранний борд. Остальные можно
              увидеть в базе.
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              Добавьте больше бордов, чтобы разделять проекты.
            </p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="mb-3 text-lg font-semibold text-white">
            Создать новый борд
          </h3>
          <form action={createBoardAction} className="space-y-3">
            <Input name="name" placeholder="Например: Запуск продукта" required />
            <Button type="submit" fullWidth>
              Создать борд с базовыми колонками
            </Button>
          </form>
        </div>
      </section>

      {activeBoard ? (
        <section className="grid gap-4 lg:grid-cols-4">
          {activeBoard.columns.map((column) => (
            <div key={column.id} className="card flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Колонка
                  </p>
                  <h3 className="text-lg font-semibold text-white">
                    {column.title}
                  </h3>
                </div>
                <Badge variant="neutral">{column.tasks.length}</Badge>
              </div>

              <div className="space-y-3">
                {column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 shadow"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">
                        {task.title}
                      </p>
                      <Badge
                        variant={
                          task.priority === "HIGH"
                            ? "danger"
                            : task.priority === "LOW"
                              ? "neutral"
                              : "warning"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-300">{task.description}</p>
                    )}

                    <form action={moveTaskAction} className="mt-3 space-y-2">
                      <input type="hidden" name="taskId" value={task.id} />
                      <label className="text-xs text-slate-400">
                        Переместить в
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          name="columnId"
                          defaultValue={column.id}
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
                        >
                          {activeBoard.columns.map((col) => (
                            <option key={col.id} value={col.id}>
                              {col.title}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" variant="secondary">
                          →
                        </Button>
                      </div>
                    </form>
                  </div>
                ))}
              </div>

              <div className="mt-auto space-y-2 rounded-lg border border-dashed border-white/10 p-3">
                <p className="text-xs text-slate-400">Новая задача</p>
                <form action={createTaskAction} className="space-y-2">
                  <input type="hidden" name="columnId" value={column.id} />
                  <Input name="title" placeholder="Название" required />
                  <TextArea
                    name="description"
                    placeholder="Короткое описание"
                    rows={2}
                  />
                  <select
                    name="priority"
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none"
                    defaultValue="MEDIUM"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                  <Button type="submit" variant="secondary" fullWidth>
                    Добавить задачу
                  </Button>
                </form>
              </div>
            </div>
          ))}

          <div className="card h-full p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Колонки
                </p>
                <h3 className="text-lg font-semibold text-white">
                  Добавить колонку
                </h3>
              </div>
            </div>

            <form action={createColumnAction} className="mt-4 space-y-3">
              <input type="hidden" name="boardId" value={activeBoard.id} />
              <Input name="title" placeholder="Например: Review" required />
              <Button type="submit" fullWidth>
                Создать колонку
              </Button>
            </form>

            <div className="mt-6 space-y-2 text-sm text-slate-400">
              <p>• Колонки добавляются в конец.</p>
              <p>• Задачи можно переносить между колонками.</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="card p-6 text-center">
          <h3 className="text-xl font-semibold text-white">
            Пока нет ни одного борда
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Создайте борд, чтобы начать работать с задачами.
          </p>
        </section>
      )}
    </main>
  );
}
