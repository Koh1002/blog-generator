"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useCreateIdea, useOrganizeIdea } from "@/lib/hooks/use-ideas";

export function QuickInput() {
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const createIdea = useCreateIdea();
  const organizeIdea = useOrganizeIdea();

  const handleSave = useCallback(
    async (andOrganize: boolean) => {
      if (!content.trim()) return;

      try {
        const idea = await createIdea.mutateAsync({ content: content.trim() });
        setContent("");

        if (andOrganize) {
          toast("保存しました。AI整理中...", "info");
          await organizeIdea.mutateAsync(idea.id);
          toast("AI整理が完了しました", "success");
        } else {
          toast("インボックスに保存しました", "success");
        }
      } catch {
        toast("保存に失敗しました", "error");
      }
    },
    [content, createIdea, organizeIdea, toast]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave(false);
    }
  };

  const isLoading = createIdea.isPending || organizeIdea.isPending;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="思いついたこと、気づき、メモをここに..."
        rows={3}
        className="mb-3 resize-none"
        disabled={isLoading}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Cmd+Enter で保存
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={!content.trim() || isLoading}
          >
            保存
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave(true)}
            disabled={!content.trim() || isLoading}
          >
            {organizeIdea.isPending ? "整理中..." : "保存 & AI整理"}
          </Button>
        </div>
      </div>
    </div>
  );
}
