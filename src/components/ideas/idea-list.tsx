"use client";

import { useState } from "react";
import { useIdeas, type IdeaFilters } from "@/lib/hooks/use-ideas";
import { IdeaCard } from "./idea-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IDEA_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { Search } from "lucide-react";

export function IdeaList() {
  const [filters, setFilters] = useState<IdeaFilters>({
    page: 1,
    limit: 20,
    sort: "createdAt",
    order: "desc",
  });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useIdeas(filters);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="検索..."
            className="pl-9"
          />
        </div>
        <Select
          value={filters.status ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              status: e.target.value || undefined,
              page: 1,
            }))
          }
          className="w-40"
        >
          <option value="">すべて</option>
          {IDEA_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select
          value={`${filters.sort ?? "createdAt"}_${filters.order ?? "desc"}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split("_");
            setFilters((prev) => ({ ...prev, sort, order }));
          }}
          className="w-40"
        >
          <option value="createdAt_desc">新しい順</option>
          <option value="createdAt_asc">古い順</option>
          <option value="importance_desc">重要度高い順</option>
          <option value="importance_asc">重要度低い順</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-400">読み込み中...</div>
      ) : !data?.ideas?.length ? (
        <div className="py-12 text-center text-gray-400">
          まだネタがありません。インボックスからメモを追加しましょう。
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {data.ideas.map((idea: Record<string, unknown>) => (
              <IdeaCard key={idea.id as string} idea={idea as IdeaCardProps["idea"]} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === 1}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))
                }
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
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))
                }
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

// Type helper
type IdeaCardProps = React.ComponentProps<typeof IdeaCard>;
