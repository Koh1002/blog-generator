"use client";

import Link from "next/link";
import { useIdeas } from "@/lib/hooks/use-ideas";
import { IdeaStatusBadge } from "@/components/ideas/idea-status-badge";
import { truncate, formatDate } from "@/lib/utils";

export function RecentIdeas() {
  const { data, isLoading } = useIdeas({ limit: 5, sort: "createdAt", order: "desc" });

  if (isLoading) {
    return <div className="text-sm text-gray-400">読み込み中...</div>;
  }

  if (!data?.ideas?.length) {
    return (
      <p className="text-sm text-gray-400">
        まだネタがありません。インボックスから追加しましょう。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {data.ideas.map(
        (idea: {
          id: string;
          title?: string | null;
          content: string;
          status: string;
          createdAt: string;
        }) => (
          <Link
            key={idea.id}
            href={`/ideas/${idea.id}`}
            className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-2 min-w-0">
              <IdeaStatusBadge status={idea.status} />
              <span className="truncate text-sm text-gray-700">
                {idea.title ?? truncate(idea.content, 50)}
              </span>
            </div>
            <span className="ml-2 text-xs text-gray-400 whitespace-nowrap">
              {formatDate(idea.createdAt)}
            </span>
          </Link>
        )
      )}
    </div>
  );
}
