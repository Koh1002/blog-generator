"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ideaKeys } from "./use-ideas";

export const draftKeys = {
  all: ["drafts"] as const,
  list: (filters?: { ideaId?: string; platform?: string }) =>
    [...draftKeys.all, "list", filters] as const,
  detail: (id: string) => [...draftKeys.all, "detail", id] as const,
};

async function fetchDrafts(filters?: { ideaId?: string; platform?: string }) {
  const params = new URLSearchParams();
  if (filters?.ideaId) params.set("ideaId", filters.ideaId);
  if (filters?.platform) params.set("platform", filters.platform);

  const res = await fetch(`/api/drafts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch drafts");
  return res.json();
}

async function deleteDraft(id: string) {
  const res = await fetch(`/api/drafts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete draft");
  return res.json();
}

async function generateDraft(data: {
  ideaId: string;
  platform: string;
  tone: string;
  additionalContext?: string;
  variantCount?: number;
}) {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to generate draft");
  return res.json();
}

export function useDrafts(filters?: { ideaId?: string; platform?: string }) {
  return useQuery({
    queryKey: draftKeys.list(filters),
    queryFn: () => fetchDrafts(filters),
  });
}

export function useDeleteDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: draftKeys.all });
    },
  });
}

export function useGenerateDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateDraft,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: draftKeys.list({ ideaId: variables.ideaId }) });
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(variables.ideaId) });
    },
  });
}
