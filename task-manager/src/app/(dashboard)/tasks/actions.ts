"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { moveTaskSchema, taskSchema } from "@/lib/validators";

async function requireUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user.id;
}

export async function createTaskAction(formData: FormData): Promise<void> {
  try {
    await requireUserId();
    const parsed = taskSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      priority: formData.get("priority") ?? "MEDIUM",
      status: formData.get("status") ?? "TODO",
      dueDate: formData.get("dueDate") || undefined,
      assigneeId: formData.get("assigneeId") || undefined,
    });

    if (!parsed.success) {
      return;
    }

    const { title, description, priority, status, dueDate, assigneeId } = parsed.data;

    // Получаем задачи в нужном статусе для определения позиции
    const statusEnum = status as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    const tasksInStatus = await prisma.task.findMany({
      where: { status: statusEnum },
      orderBy: { position: "desc" },
      take: 1,
    });

    const newPosition = tasksInStatus.length > 0 ? tasksInStatus[0].position + 1 : 0;

    await prisma.task.create({
      data: {
        title,
        description,
        priority: priority as "LOW" | "MEDIUM" | "HIGH",
        status: statusEnum,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        position: newPosition,
      },
    });

    revalidatePath("/tasks");
  } catch (error) {
    console.error("Error creating task:", error);
  }
}

export async function updateTaskStatusAction(
  taskId: string,
  newStatus: string,
  newPosition: number,
): Promise<void> {
  try {
    await requireUserId();
    const parsed = moveTaskSchema.safeParse({
      taskId,
      status: newStatus,
      position: newPosition,
    });

    if (!parsed.success) {
      return;
    }

    // Проверяем, что задача существует
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return;
    }

    const statusEnum = newStatus as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

    // Обновляем статус и позицию задачи
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: statusEnum,
        position: newPosition,
      },
    });

    // Обновляем позиции других задач в новой колонке
    const tasksInNewStatus = await prisma.task.findMany({
      where: {
        status: statusEnum,
        id: { not: taskId },
        position: { gte: newPosition },
      },
    });

    if (tasksInNewStatus.length > 0) {
      await Promise.all(
        tasksInNewStatus.map((t) =>
          prisma.task.update({
            where: { id: t.id },
            data: { position: t.position + 1 },
          }),
        ),
      );
    }

    revalidatePath("/tasks");
  } catch (error) {
    console.error("Error updating task status:", error);
  }
}
