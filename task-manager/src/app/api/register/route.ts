import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

// Force Node.js runtime to avoid Edge Runtime issues with Prisma on Vercel
export const runtime = "nodejs";

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
    console.error("Registration error:", error);
    
    // Проверяем, является ли ошибка ошибкой подключения к БД
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";
    
    // Prisma ошибки подключения
    if (errorName === "PrismaClientInitializationError" || 
        errorMessage.includes("Can't reach database server") || 
        errorMessage.includes("P1001") ||
        errorMessage.includes("connect ECONNREFUSED") ||
        errorMessage.includes("Connection refused") ||
        errorMessage.includes("does not exist")) {
      return NextResponse.json(
        { 
          error: "Не удалось подключиться к базе данных. Убедитесь, что:\n" +
                 "1. PostgreSQL запущен и доступен на localhost:5432\n" +
                 "2. База данных 'task_manager' создана\n" +
                 "3. Миграции применены (выполните: npx prisma migrate dev)\n" +
                 "4. DATABASE_URL в файле .env корректна"
        },
        { status: 503 },
      );
    }
    
    // Ошибки уникальности
    if (errorMessage.includes("P2002") || 
        errorMessage.includes("Unique constraint") ||
        errorMessage.includes("Unique violation")) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 },
      );
    }
    
    // Ошибки валидации Prisma
    if (errorMessage.includes("P2003") || errorMessage.includes("Foreign key constraint")) {
      return NextResponse.json(
        { error: "Ошибка при создании пользователя. Проверьте, что миграции базы данных применены." },
        { status: 500 },
      );
    }
    
    return NextResponse.json(
      { 
        error: "Не удалось зарегистрировать пользователя",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 },
    );
  }
}
