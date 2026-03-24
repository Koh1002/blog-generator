"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useDeleteDraft } from "@/lib/hooks/use-drafts";
import { useCreatePublication } from "@/lib/hooks/use-publications";
import { PLATFORM_LABELS, TONE_LABELS } from "@/lib/constants";
import { Copy, Trash2, Send } from "lucide-react";

interface DraftCardProps {
  draft: {
    id: string;
    ideaId: string;
    platform: string;
    tone: string;
    content: string;
    variant: number;
    platformNotes?: string;
  };
}

export function DraftCard({ draft }: DraftCardProps) {
  const { toast } = useToast();
  const deleteDraft = useDeleteDraft();
  const createPublication = useCreatePublication();
  const [showPublish, setShowPublish] = useState(false);
  const [publishUrl, setPublishUrl] = useState("");
  const [publishNote, setPublishNote] = useState("");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft.content);
    toast("コピーしました", "success");
  };

  const handlePublish = async () => {
    try {
      await createPublication.mutateAsync({
        ideaId: draft.ideaId,
        draftId: draft.id,
        platform: draft.platform,
        url: publishUrl || undefined,
        reactionNote: publishNote || undefined,
      });
      toast("公開記録を追加しました", "success");
      setShowPublish(false);
    } catch {
      toast("記録に失敗しました", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("この下書きを削除しますか？")) return;
    try {
      await deleteDraft.mutateAsync(draft.id);
      toast("削除しました", "success");
    } catch {
      toast("削除に失敗しました", "error");
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {PLATFORM_LABELS[draft.platform] ?? draft.platform}
          </Badge>
          <Badge variant="secondary">
            {TONE_LABELS[draft.tone] ?? draft.tone}
          </Badge>
          <span className="text-xs text-gray-400">
            バリアント {draft.variant}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {draft.content.length} 文字
        </span>
      </div>

      <div className="mb-3 whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm text-gray-800">
        {draft.content}
      </div>

      {draft.platformNotes && (
        <p className="mb-3 text-xs text-gray-500">
          {draft.platformNotes}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="mr-1 h-3 w-3" />
          コピー
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPublish(!showPublish)}
        >
          <Send className="mr-1 h-3 w-3" />
          公開済みにする
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 className="h-3 w-3 text-red-500" />
        </Button>
      </div>

      {showPublish && (
        <div className="mt-3 space-y-2 rounded border border-gray-100 bg-gray-50 p-3">
          <Input
            value={publishUrl}
            onChange={(e) => setPublishUrl(e.target.value)}
            placeholder="公開URL（任意）"
          />
          <Textarea
            value={publishNote}
            onChange={(e) => setPublishNote(e.target.value)}
            placeholder="反応メモ（任意）"
            rows={2}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handlePublish}>
              記録する
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPublish(false)}
            >
              キャンセル
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
