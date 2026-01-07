"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { projectMemberSchema, projectSchema } from "@/lib/validators";

async function requireUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session.user.id;
}

export async function createProjectAction(formData: FormData): Promise<void> {
  try {
    const userId = await requireUserId();
    const parsed = projectSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return;
    }

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        ownerId: userId,
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${project.id}`);
  } catch (error) {
    console.error("Error creating project:", error);
  }
}

export async function addProjectMemberAction(formData: FormData): Promise<void> {
  try {
    const userId = await requireUserId();
    const parsed = projectMemberSchema.safeParse({
      projectId: formData.get("projectId"),
      email: formData.get("email"),
    });

    if (!parsed.success) {
      return;
    }

    const { projectId, email } = parsed.data;

    // Проверяем, что пользователь является владельцем проекта
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!project) {
      return;
    }

    // Находим пользователя по email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return;
    }

    // Проверяем, не является ли пользователь уже участником
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return;
    }

    await prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id,
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
  } catch (error) {
    console.error("Error adding project member:", error);
  }
}

export async function removeProjectMemberAction(formData: FormData): Promise<void> {
  try {
    const userId = await requireUserId();
    const memberId = formData.get("memberId");

    if (!memberId || typeof memberId !== "string") {
      return;
    }

    // Проверяем, что пользователь является владельцем проекта
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
      include: { project: true },
    });

    if (!member || member.project.ownerId !== userId) {
      return;
    }

    await prisma.projectMember.delete({
      where: { id: memberId },
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${member.project.id}`);
  } catch (error) {
    console.error("Error removing project member:", error);
  }
}

export async function createProjectBoardAction(formData: FormData): Promise<void> {
  try {
    const userId = await requireUserId();
    const projectId = formData.get("projectId") as string;
    const boardName = formData.get("name") as string;

    if (!projectId || !boardName) {
      return;
    }

    // Проверяем доступ к проекту (владелец или участник)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });

    if (!project) {
      return;
    }

    // Создаем доску с базовыми колонками
    const board = await prisma.board.create({
      data: {
        name: boardName,
        projectId: projectId,
        columns: {
          create: [
            { title: "Backlog", position: 0 },
            { title: "In Progress", position: 1 },
            { title: "Review", position: 2 },
            { title: "Done", position: 3 },
          ],
        },
      },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/boards/${board.id}`);
  } catch (error) {
    console.error("Error creating project board:", error);
  }
}

export async function deleteProjectBoardAction(formData: FormData): Promise<void> {
  try {
    const userId = await requireUserId();
    const boardId = formData.get("boardId") as string;
    const projectId = formData.get("projectId") as string;

    if (!boardId || !projectId) {
      return;
    }

    // Проверяем доступ к проекту (владелец или участник)
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        projectId: projectId,
        project: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
      },
      include: {
        project: true,
      },
    });

    if (!board) {
      return;
    }

    // Удаляем доску (колонки и задачи удалятся каскадно благодаря onDelete: Cascade)
    await prisma.board.delete({
      where: { id: boardId },
    });

    revalidatePath(`/projects/${projectId}`);
  } catch (error) {
    console.error("Error deleting project board:", error);
  }
}
