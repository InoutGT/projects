import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Заполните имя, email и пароль (не короче 8 символов)" },
        { status: 400 },
      );
    }

    const { email, name, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже есть" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const workspaceName = name ? `${name} — Workspace` : "Личный Workspace";

    await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        workspaces: {
          create: {
            name: workspaceName,
            boards: {
              create: [
                {
                  name: "Борд по умолчанию",
                  columns: {
                    create: [
                      {
                        title: "Backlog",
                        position: 0,
                        tasks: {
                          create: [
                            {
                              title: "Добавить первую задачу",
                              description: "Нажмите «Создать задачу», чтобы добавить свои задачи.",
                              position: 0,
                            },
                          ],
                        },
                      },
                      { title: "In Progress", position: 1 },
                      { title: "Done", position: 2 },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Не удалось зарегистрировать пользователя" },
      { status: 500 },
    );
  }
}
