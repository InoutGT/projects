"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";

import { ProjectKanbanColumn } from "./project-kanban-column";
import { ProjectKanbanTask } from "./project-kanban-task";

export type ProjectTask = {
  id: string;
  title: string;
  description?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  dueDate?: string | null;
  assignee?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
  position: number;
  columnId: string;
};

export type ProjectColumn = {
  id: string;
  title: string;
  position: number;
  tasks: ProjectTask[];
};

interface ProjectKanbanBoardProps {
  initialColumns: ProjectColumn[];
  onTaskMove: (taskId: string, newColumnId: string, newPosition: number) => void;
  onDeleteColumn?: (columnId: string) => void;
  onCreateTask?: (formData: FormData) => void;
}

export function ProjectKanbanBoard({
  initialColumns,
  onTaskMove,
  onDeleteColumn,
  onCreateTask,
}: ProjectKanbanBoardProps) {
  const [columns, setColumns] = useState<ProjectColumn[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newColumnId = over.id as string;

    // Находим задачу и текущую колонку
    let currentColumn: ProjectColumn | undefined;
    let task: ProjectTask | undefined;

    for (const col of columns) {
      const foundTask = col.tasks.find((t) => t.id === taskId);
      if (foundTask) {
        currentColumn = col;
        task = foundTask;
        break;
      }
    }

    if (!task || !currentColumn) return;

    // Если задача перемещается в ту же колонку, ничего не делаем
    if (currentColumn.id === newColumnId) {
      return;
    }

    // Проверяем, что новая колонка существует
    const targetColumn = columns.find((col) => col.id === newColumnId);
    if (!targetColumn) {
      return;
    }

    // Обновляем локальное состояние
    const updatedColumns = columns.map((col) => {
      if (col.id === currentColumn!.id) {
        // Удаляем задачу из текущей колонки
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        };
      }
      if (col.id === newColumnId) {
        // Добавляем задачу в новую колонку
        const newPosition = col.tasks.length;
        return {
          ...col,
          tasks: [...col.tasks, { ...task!, columnId: newColumnId, position: newPosition }],
        };
      }
      return col;
    });

    setColumns(updatedColumns);

    // Определяем новую позицию (в конец колонки)
    const newColumnTasks = updatedColumns.find((col) => col.id === newColumnId)?.tasks || [];
    const newPosition = newColumnTasks.length - 1;

    // Вызываем callback для обновления на сервере
    onTaskMove(taskId, newColumnId, newPosition);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns
          .sort((a, b) => a.position - b.position)
          .map((column) => (
            <ProjectKanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              taskCount={column.tasks.length}
              onDelete={onDeleteColumn ? () => onDeleteColumn(column.id) : undefined}
              onCreateTask={onCreateTask}
            >
              <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {column.tasks
                    .sort((a, b) => a.position - b.position)
                    .map((task) => (
                      <ProjectKanbanTask key={task.id} task={task} />
                    ))}
                </div>
              </SortableContext>
            </ProjectKanbanColumn>
          ))}
      </div>
      <DragOverlay>
        {activeTask ? <ProjectKanbanTask task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
