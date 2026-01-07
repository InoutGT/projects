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
    where: { id: boardId, workspace: { ownerId: userId } },
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
      include: { board: { include: { workspace: true } } },
    });

    if (!column || column.board.workspace.ownerId !== userId) {
      return;
    }

    await prisma.column.delete({
      where: { id: columnId },
    });

    revalidatePath("/");
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
    await assertBoardAccess(boardId, userId);

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
  } catch (error) {
    console.error("Error creating column:", error);
  }
}

export async function createTaskAction(formData: FormData): Promise<void> {
  try {
    await requireUserId();
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
  } catch (error) {
    console.error("Error creating task:", error);
  }
}

export async function moveTaskAction(formData: FormData): Promise<void> {
  try {
    await requireUserId();
    const parsed = moveTaskSchema.safeParse({
      taskId: formData.get("taskId"),
      status: formData.get("status"),
      position: Number(formData.get("position")),
    });

    if (!parsed.success) {
      return;
    }

    const { taskId, status, position } = parsed.data;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return;
    }

    const statusEnum = status as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

    await prisma.task.update({
      where: { id: taskId },
      data: { status: statusEnum, position },
    });

    revalidatePath("/");
  } catch (error) {
    console.error("Error moving task:", error);
  }
}
