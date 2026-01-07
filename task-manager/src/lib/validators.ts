import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Имя обязательно").max(50),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Пароль от 8 символов"),
});

export const signInSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Пароль от 8 символов"),
});

export const boardSchema = z.object({
  name: z.string().min(2).max(80),
});

export const columnSchema = z.object({
  title: z.string().min(2).max(50),
  boardId: z.string().min(1),
});

export const taskSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).default("TODO"),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const moveTaskSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
  position: z.number().int().min(0),
});

export const projectSchema = z.object({
  name: z.string().min(2, "Название должно быть не короче 2 символов").max(100),
  description: z.string().max(500).optional(),
});

export const projectMemberSchema = z.object({
  projectId: z.string().min(1),
  email: z.string().email("Введите корректный email"),
});
