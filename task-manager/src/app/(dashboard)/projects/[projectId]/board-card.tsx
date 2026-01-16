"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { deleteProjectBoardAction } from "../actions";

interface BoardCardProps {
  boardId: string;
  boardName: string;
  projectId: string;
  columnsCount: number;
}

export function BoardCard({ boardId, boardName, projectId, columnsCount }: BoardCardProps) {
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Удалить доску "${boardName}"? Все колонки и задачи будут удалены.`)) {
      const formData = new FormData();
      formData.append("boardId", boardId);
      formData.append("projectId", projectId);
      await deleteProjectBoardAction(formData);
      router.refresh();
    }
  };

  return (
    <div className="group relative rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10">
      <div className="pr-8">
        <Link 
          href={`/projects/${projectId}/boards/${boardId}`} 
          className="block"
        >
          <h3 className="mb-2 font-semibold text-white">{boardName}</h3>
          <p className="text-xs text-slate-400">{columnsCount} колонок</p>
        </Link>
      </div>
      <Button
        onClick={handleDelete}
        variant="ghost"
        type="button"
        className="absolute right-2 top-2 z-10 h-6 w-6 p-0 text-red-400 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
        aria-label={`Удалить доску ${boardName}`}
        suppressHydrationWarning
      >
        ×
      </Button>
    </div>
  );
}
