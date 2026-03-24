"use client";

import { QuickInput } from "@/components/ideas/quick-input";
import { useIdeas } from "@/lib/hooks/use-ideas";
import { IdeaCard } from "@/components/ideas/idea-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Sparkles } from "lucide-react";

export default function InboxPage() {
  const { data, isLoading } = useIdeas({ status: "inbox", limit: 50 });
  const { toast } = useToast();

  const handleBatchOrganize = async () => {
    try {
      toast("一括整理中...", "info");
      const res = await fetch("/api/ai/organize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      const successCount = result.results?.filter(
        (r: { success: boolean }) => r.success
      ).length;
      toast(`${successCount}件のネタを整理しました`, "success");
      window.location.reload();
    } catch {
      toast("一括整理に失敗しました", "error");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">インボックス</h1>
        {data?.ideas?.length > 0 && (
          <Button variant="outline" onClick={handleBatchOrganize}>
            <Sparkles className="mr-1 h-4 w-4" />
            すべてAI整理
          </Button>
        )}
      </div>

      <QuickInput />

      {isLoading ? (
        <div className="py-12 text-center text-gray-400">読み込み中...</div>
      ) : !data?.ideas?.length ? (
        <div className="py-12 text-center text-gray-400">
          インボックスは空です。上のフォームからメモを追加しましょう。
        </div>
      ) : (
        <div className="grid gap-3">
          {data.ideas.map(
            (idea: Parameters<typeof IdeaCard>[0]["idea"]) => (
              <IdeaCard key={idea.id} idea={idea} />
            )
          )}
        </div>
      )}
    </div>
  );
}
