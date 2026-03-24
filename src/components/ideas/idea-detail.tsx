"use client";

import { useState } from "react";
import Link from "next/link";
import { useIdea, useUpdateIdea, useOrganizeIdea, useDeleteIdea } from "@/lib/hooks/use-ideas";
import { IdeaStatusBadge } from "./idea-status-badge";
import { PlatformFitIndicator } from "./platform-fit-indicator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  IDEA_STATUSES,
  STATUS_LABELS,
  IDEA_TYPES,
  IDEA_TYPE_LABELS,
  PLATFORM_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Sparkles, FileText, Trash2, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface IdeaDetailProps {
  ideaId: string;
}

export function IdeaDetail({ ideaId }: IdeaDetailProps) {
  const { data: idea, isLoading } = useIdea(ideaId);
  const updateIdea = useUpdateIdea();
  const organizeIdea = useOrganizeIdea();
  const deleteIdea = useDeleteIdea();
  const { toast } = useToast();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");

  if (isLoading) {
    return <div className="py-12 text-center text-gray-400">読み込み中...</div>;
  }

  if (!idea) {
    return <div className="py-12 text-center text-gray-400">見つかりません</div>;
  }

  const handleStartEdit = () => {
    setEditContent(idea.content);
    setEditTitle(idea.title ?? "");
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateIdea.mutateAsync({
        id: ideaId,
        content: editContent,
        title: editTitle || null,
      });
      setEditing(false);
      toast("更新しました", "success");
    } catch {
      toast("更新に失敗しました", "error");
    }
  };

  const handleOrganize = async () => {
    try {
      toast("AI整理中...", "info");
      await organizeIdea.mutateAsync(ideaId);
      toast("AI整理が完了しました", "success");
    } catch {
      toast("AI整理に失敗しました", "error");
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updateIdea.mutateAsync({ id: ideaId, status });
      toast("ステータスを更新しました", "success");
    } catch {
      toast("更新に失敗しました", "error");
    }
  };

  const handleImportanceChange = async (importance: number) => {
    try {
      await updateIdea.mutateAsync({ id: ideaId, importance });
    } catch {
      toast("更新に失敗しました", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("このネタを削除しますか？")) return;
    try {
      await deleteIdea.mutateAsync(ideaId);
      toast("削除しました", "success");
      router.push("/ideas");
    } catch {
      toast("削除に失敗しました", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <IdeaStatusBadge status={idea.status} />
            {idea.ideaType && (
              <Badge variant="outline">
                {IDEA_TYPE_LABELS[idea.ideaType] ?? idea.ideaType}
              </Badge>
            )}
            <span className="text-sm text-gray-400">
              {formatDate(idea.createdAt)}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {idea.title ?? "無題のネタ"}
          </h2>
          {idea.summary && (
            <p className="mt-1 text-gray-600">{idea.summary}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleOrganize}>
            <Sparkles className="mr-1 h-4 w-4" />
            AI整理
          </Button>
          <Link href={`/ideas/${ideaId}/generate`}>
            <Button size="sm">
              <FileText className="mr-1 h-4 w-4" />
              投稿案生成
            </Button>
          </Link>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">ステータス:</span>
          <Select
            value={idea.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-32"
          >
            {IDEA_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">重要度:</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleImportanceChange(i + 1)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-5 w-5 ${
                    i < idea.importance
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200 hover:text-yellow-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        {idea.ideaType && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">タイプ:</span>
            <Select
              value={idea.ideaType ?? ""}
              onChange={(e) =>
                updateIdea.mutate({
                  id: ideaId,
                  ideaType: e.target.value || null,
                })
              }
              className="w-36"
            >
              <option value="">未分類</option>
              {IDEA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {IDEA_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium text-gray-700">内容</h3>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={handleStartEdit}>
              編集
            </Button>
          )}
        </div>
        {editing ? (
          <div className="space-y-3">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="タイトル（任意）"
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>
                保存
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
              >
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-gray-800">{idea.content}</p>
        )}
      </div>

      {/* Platform Fit */}
      {idea.platformFit && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-3 font-medium text-gray-700">媒体適性</h3>
          <PlatformFitIndicator platformFit={idea.platformFit} />
        </div>
      )}

      {/* Tags */}
      {idea.tags?.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-3 font-medium text-gray-700">タグ</h3>
          <div className="flex flex-wrap gap-2">
            {idea.tags.map((t: { tag: { id: string; name: string } }) => (
              <Badge key={t.tag.id} variant="secondary">
                {t.tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Drafts */}
      {idea.drafts?.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-3 font-medium text-gray-700">下書き</h3>
          <div className="space-y-3">
            {idea.drafts.map(
              (draft: {
                id: string;
                platform: string;
                tone: string;
                content: string;
                createdAt: string;
              }) => (
                <div
                  key={draft.id}
                  className="rounded border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                    <Badge variant="outline">
                      {PLATFORM_LABELS[draft.platform] ?? draft.platform}
                    </Badge>
                    <span>{formatDate(draft.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {draft.content.slice(0, 200)}
                    {draft.content.length > 200 && "..."}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="flex justify-end">
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="mr-1 h-4 w-4" />
          削除
        </Button>
      </div>
    </div>
  );
}
