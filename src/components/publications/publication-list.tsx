"use client";

import { useState } from "react";
import { usePublications, useDeletePublication } from "@/lib/hooks/use-publications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { PLATFORMS, PLATFORM_LABELS } from "@/lib/constants";
import { formatDate, truncate } from "@/lib/utils";
import { ExternalLink, Trash2 } from "lucide-react";

export function PublicationList() {
  const [platform, setPlatform] = useState<string>("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePublications({
    platform: platform || undefined,
    page,
  });
  const deletePublication = useDeletePublication();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm("この公開記録を削除しますか？")) return;
    try {
      await deletePublication.mutateAsync(id);
      toast("削除しました", "success");
    } catch {
      toast("削除に失敗しました", "error");
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Select
          value={platform}
          onChange={(e) => {
            setPlatform(e.target.value);
            setPage(1);
          }}
          className="w-40"
        >
          <option value="">すべての媒体</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-400">読み込み中...</div>
      ) : !data?.publications?.length ? (
        <div className="py-12 text-center text-gray-400">
          まだ公開記録がありません。
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.publications.map(
              (pub: {
                id: string;
                platform: string;
                publishedAt: string;
                url?: string | null;
                reactionNote?: string | null;
                idea?: { id: string; title?: string | null; content: string };
              }) => (
                <div
                  key={pub.id}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {PLATFORM_LABELS[pub.platform] ?? pub.platform}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        {formatDate(pub.publishedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pub.url && (
                        <a
                          href={pub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button onClick={() => handleDelete(pub.id)}>
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {pub.idea?.title ??
                      truncate(pub.idea?.content ?? "", 80)}
                  </p>
                  {pub.reactionNote && (
                    <p className="mt-1 text-sm text-gray-500">
                      {pub.reactionNote}
                    </p>
                  )}
                </div>
              )
            )}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                前へ
              </Button>
              <span className="text-sm text-gray-500">
                {data.page} / {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                次へ
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
