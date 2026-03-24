"use client";

import Link from "next/link";
import { IdeaStatusBadge } from "./idea-status-badge";
import { PlatformFitIndicator } from "./platform-fit-indicator";
import { Badge } from "@/components/ui/badge";
import { IDEA_TYPE_LABELS } from "@/lib/constants";
import { truncate, formatDate } from "@/lib/utils";
import { Star } from "lucide-react";

interface IdeaCardProps {
  idea: {
    id: string;
    content: string;
    title?: string | null;
    summary?: string | null;
    status: string;
    ideaType?: string | null;
    importance: number;
    platformFit?: string | null;
    createdAt: string;
    tags?: { tag: { id: string; name: string } }[];
    _count?: { drafts: number; publications: number };
  };
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IdeaStatusBadge status={idea.status} />
          {idea.ideaType && (
            <Badge variant="outline">
              {IDEA_TYPE_LABELS[idea.ideaType] ?? idea.ideaType}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < idea.importance
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <h3 className="mb-1 font-medium text-gray-900">
        {idea.title ?? truncate(idea.content, 80)}
      </h3>

      {idea.summary && (
        <p className="mb-2 text-sm text-gray-500">
          {truncate(idea.summary, 120)}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {idea.tags?.map((t) => (
            <Badge key={t.tag.id} variant="secondary" className="text-[10px]">
              {t.tag.name}
            </Badge>
          ))}
        </div>
        <PlatformFitIndicator platformFit={idea.platformFit ?? null} compact />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>{formatDate(idea.createdAt)}</span>
        <div className="flex gap-3">
          {idea._count && idea._count.drafts > 0 && (
            <span>{idea._count.drafts} 下書き</span>
          )}
          {idea._count && idea._count.publications > 0 && (
            <span>{idea._count.publications} 公開</span>
          )}
        </div>
      </div>
    </Link>
  );
}
