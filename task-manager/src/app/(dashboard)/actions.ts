"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  boardSchema,
  columnSchema,
  moveTaskSchema,
  taskSchema,
} from "@/lib/validators";

async function requireUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user.id;
}

async function requireWorkspace(userId: string) {
  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: userId },
  });

  if (!workspace) {
    throw new Error("WORKSPACE_NOT_FOUND");
  }

  return workspace;
}

async function assertBoardAccess(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [
        { workspace: { ownerId: userId } },
        { project: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] } },
      ],
    },
  });

  if (!board) {
    throw new Error("BOARD_NOT_FOUND");
  }

  return board;
}

export async function deleteColumnAction(columnId: string): Promise<void> {
  try {
    const userId = await requireUserId();
    
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: {
        board: {
          include: {
            workspace: true,
            project: {
              include: { members: true },
            },
          },
        },
      },
    });

    if (!column) {
      return;
    }

    // Проверяем доступ: либо workspace owner, либо project owner/member
    const hasAccess =
      (column.board.workspace && column.board.workspace.ownerId === userId) ||
      (column.board.project &&
        (column.board.project.ownerId === userId ||
          column.board.project.members.some((m) => m.userId === userId)));

    if (!hasAccess) {
      return;
    }

    await prisma.column.delete({
      where: { id: columnId },
    });

    revalidatePath("/");
    if (column.board.projectId) {
      revalidatePath(`/projects/${column.board.projectId}/boards/${column.board.id}`);
    }
  } catch (error) {
    console.error("Error deleting column:", error);
  }
}

export async function createColumnAction(formData: FormData): Promise<void> {
  try {
    const userId = await requireUserId();
    const parsed = columnSchema.safeParse({
      title: formData.get("title"),
      boardId: formData.get("boardId"),
    });

    if (!parsed.success) {
      return;
    }

    const { boardId, title } = parsed.data;
    const board = await assertBoardAccess(boardId, userId);

    const lastColumn = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
    });

    const position = typeof lastColumn?.position === "number" ? lastColumn.position + 1 : 0;

    await prisma.column.create({
      data: {
        boardId,
        title,
        position,
      },
    });

    revalidatePath("/");
    if (board.projectId) {
      revalidatePath(`/projects/${board.projectId}/boards/${boardId}`);
    }
  } catch (error) {
    console.error("Error creating column:", error);
  }
}

export async function createTaskAction(formData: FormData): Promise<void> {
  try {
    await requireUserId();
    const columnId = formData.get("columnId") as string | null;
    
    const parsed = taskSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      priority: formData.get("priority") ?? "MEDIUM",
      status: formData.get("status") ?? "TODO",
    });

    if (!parsed.success) {
      return;
    }

    const { description, priority, title, status } = parsed.data;

    // Если указан columnId, создаем задачу в колонке
    if (columnId) {
      const column = await prisma.column.findUnique({
        where: { id: columnId },
        include: { board: true },
      });

      if (!column) {
        return;
      }

      const lastTask = await prisma.task.findFirst({
        where: { columnId },
        orderBy: { position: "desc" },
      });

      const position = typeof lastTask?.position === "number" ? lastTask.position + 1 : 0;

      await prisma.task.create({
        data: {
          title,
          description,
          priority: priority as "LOW" | "MEDIUM" | "HIGH",
          status: status as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE",
          position,
          columnId,
        },
      });

      revalidatePath("/");
      if (column.board.projectId) {
        revalidatePath(`/projects/${column.board.projectId}/boards/${column.board.id}`);
      }
    } else {
      // Старый способ - создание по статусу (для обратной совместимости)
      const lastTask = await prisma.task.findFirst({
        where: { status: status as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" },
        orderBy: { position: "desc" },
      });

      const position = typeof lastTask?.position === "number" ? lastTask.position + 1 : 0;

      await prisma.task.create({
        data: {
          title,
          description,
          priority: priority as "LOW" | "MEDIUM" | "HIGH",
          status: status as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE",
          position,
        },
      });

      revalidatePath("/");
    }
  } catch (error) {
    console.error("Error creating task:", error);
  }
}

export async function moveTaskAction(formData: FormData): Promise<void> {
  try {
    await requireUserId();
    const taskId = formData.get("taskId") as string;
    const columnId = formData.get("columnId") as string | null;
    const status = formData.get("status") as string | null;
    const position = Number(formData.get("position") || 0);

    if (!taskId) {
      return;
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: { include: { board: true } } },
    });

    if (!task) {
      return;
    }

    // Если указан columnId, перемещаем в колонку
    if (columnId) {
      const newColumn = await prisma.column.findUnique({
        where: { id: columnId },
        include: { board: true },
      });

      if (!newColumn) {
        return;
      }

      await prisma.task.update({
        where: { id: taskId },
        data: {
          columnId,
          position,
        },
      });

      revalidatePath("/");
      if (newColumn.board.projectId) {
        revalidatePath(`/projects/${newColumn.board.projectId}/boards/${newColumn.board.id}`);
      }
    } else if (status) {
      // Старый способ - перемещение по статусу (для обратной совместимости)
      const parsed = moveTaskSchema.safeParse({
        taskId,
        status,
        position,
      });

      if (!parsed.success) {
        return;
      }

      const statusEnum = status as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

      await prisma.task.update({
        where: { id: taskId },
        data: { status: statusEnum, position },
      });

      revalidatePath("/");
    }
  } catch (error) {
    console.error("Error moving task:", error);
  }
}

export async function moveTaskToColumnAction(
  taskId: string,
  newColumnId: string,
  newPosition: number,
): Promise<void> {
  try {
    await requireUserId();

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: { include: { board: true } } },
    });

    if (!task) {
      return;
    }

    const newColumn = await prisma.column.findUnique({
      where: { id: newColumnId },
      include: { board: true },
    });

    if (!newColumn) {
      return;
    }

    // Обновляем позиции других задач в новой колонке
    const tasksInNewColumn = await prisma.task.findMany({
      where: {
        columnId: newColumnId,
        id: { not: taskId },
        position: { gte: newPosition },
      },
    });

    if (tasksInNewColumn.length > 0) {
      await Promise.all(
        tasksInNewColumn.map((t) =>
          prisma.task.update({
            where: { id: t.id },
            data: { position: t.position + 1 },
          }),
        ),
      );
    }

    // Перемещаем задачу
    await prisma.task.update({
      where: { id: taskId },
      data: {
        columnId: newColumnId,
        position: newPosition,
      },
    });

    revalidatePath("/");
    if (newColumn.board.projectId) {
      revalidatePath(`/projects/${newColumn.board.projectId}/boards/${newColumn.board.id}`);
    }
  } catch (error) {
    console.error("Error moving task to column:", error);
  }
}
