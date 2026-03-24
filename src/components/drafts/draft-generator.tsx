"use client";

import { useState } from "react";
import { useIdea } from "@/lib/hooks/use-ideas";
import { useGenerateDraft, useDrafts } from "@/lib/hooks/use-drafts";
import { DraftCard } from "./draft-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { PLATFORMS, PLATFORM_LABELS, TONES, TONE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface DraftGeneratorProps {
  ideaId: string;
}

export function DraftGenerator({ ideaId }: DraftGeneratorProps) {
  const { data: idea, isLoading: ideaLoading } = useIdea(ideaId);
  const { data: drafts } = useDrafts({ ideaId });
  const generateDraft = useGenerateDraft();
  const { toast } = useToast();

  const [platform, setPlatform] = useState<string>("note");
  const [tone, setTone] = useState<string>("casual");
  const [variantCount, setVariantCount] = useState(1);
  const [additionalContext, setAdditionalContext] = useState("");

  if (ideaLoading) {
    return <div className="py-12 text-center text-gray-400">読み込み中...</div>;
  }

  if (!idea) {
    return <div className="py-12 text-center text-gray-400">見つかりません</div>;
  }

  const handleGenerate = async () => {
    try {
      toast("生成中...", "info");
      await generateDraft.mutateAsync({
        ideaId,
        platform,
        tone,
        variantCount,
        additionalContext: additionalContext || undefined,
      });
      toast("投稿案を生成しました", "success");
    } catch {
      toast("生成に失敗しました。APIキーを確認してください。", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Original idea */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-medium text-gray-500">元のネタ</h3>
        {idea.title && (
          <h4 className="mb-1 font-medium text-gray-900">{idea.title}</h4>
        )}
        <p className="whitespace-pre-wrap text-gray-700">{idea.content}</p>
      </div>

      {/* Generation form */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            媒体
          </label>
          <div className="flex gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  platform === p
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            トーン
          </label>
          <div className="flex gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  tone === t
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {TONE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            バリアント数
          </label>
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setVariantCount(n)}
                className={cn(
                  "h-10 w-10 rounded-md text-sm font-medium transition-colors",
                  variantCount === n
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            追加コンテキスト（任意）
          </label>
          <Textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="特に強調したいポイントや、ターゲット読者など..."
            rows={2}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generateDraft.isPending}
          className="w-full"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {generateDraft.isPending ? "生成中..." : "投稿案を生成"}
        </Button>
      </div>

      {/* Existing drafts */}
      {drafts && drafts.length > 0 && (
        <div>
          <h3 className="mb-3 font-medium text-gray-700">生成された投稿案</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {drafts.map(
              (draft: {
                id: string;
                ideaId: string;
                platform: string;
                tone: string;
                content: string;
                variant: number;
              }) => (
                <DraftCard key={draft.id} draft={draft} />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
