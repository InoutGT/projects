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

import { KanbanColumn } from "./kanban-column";
import { KanbanTask } from "./kanban-task";

export type Task = {
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
};

type Column = {
  id: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  title: string;
  tasks: Task[];
};

interface KanbanBoardProps {
  initialTasks: Task[];
  onTaskMove: (taskId: string, newStatus: string, newPosition: number) => void;
}

export function KanbanBoard({ initialTasks, onTaskMove }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const columns: Column[] = [
    { id: "TODO", title: "To Do", tasks: tasks.filter((t) => t.status === "TODO") },
    {
      id: "IN_PROGRESS",
      title: "In Progress",
      tasks: tasks.filter((t) => t.status === "IN_PROGRESS"),
    },
    { id: "REVIEW", title: "Review", tasks: tasks.filter((t) => t.status === "REVIEW") },
    { id: "DONE", title: "Done", tasks: tasks.filter((t) => t.status === "DONE") },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    if (
      !["TODO", "IN_PROGRESS", "REVIEW", "DONE"].includes(newStatus) ||
      newStatus === tasks.find((t) => t.id === taskId)?.status
    ) {
      return;
    }

    // Обновляем локальное состояние
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, status: newStatus as Task["status"] };
      }
      return task;
    });

    setTasks(updatedTasks);

    // Определяем новую позицию (в конец колонки)
    const newColumnTasks = updatedTasks.filter((t) => t.status === newStatus);
    const newPosition = newColumnTasks.length - 1;

    // Вызываем callback для обновления на сервере
    onTaskMove(taskId, newStatus, newPosition);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} id={column.id} title={column.title}>
            <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {column.tasks
                  .sort((a, b) => a.position - b.position)
                  .map((task) => (
                    <KanbanTask key={task.id} task={task} />
                  ))}
              </div>
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <KanbanTask task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
