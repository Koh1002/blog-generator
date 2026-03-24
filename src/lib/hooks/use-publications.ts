"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ideaKeys } from "./use-ideas";

export const publicationKeys = {
  all: ["publications"] as const,
  list: (filters?: { platform?: string; page?: number }) =>
    [...publicationKeys.all, "list", filters] as const,
};

async function fetchPublications(filters?: { platform?: string; page?: number }) {
  const params = new URLSearchParams();
  if (filters?.platform) params.set("platform", filters.platform);
  if (filters?.page) params.set("page", String(filters.page));

  const res = await fetch(`/api/publications?${params}`);
  if (!res.ok) throw new Error("Failed to fetch publications");
  return res.json();
}

async function createPublication(data: {
  ideaId: string;
  draftId?: string;
  platform: string;
  url?: string;
  reactionNote?: string;
}) {
  const res = await fetch("/api/publications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create publication");
  return res.json();
}

async function updatePublication({
  id,
  ...data
}: {
  id: string;
  url?: string;
  reactionNote?: string;
}) {
  const res = await fetch(`/api/publications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update publication");
  return res.json();
}

async function deletePublication(id: string) {
  const res = await fetch(`/api/publications/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete publication");
  return res.json();
}

export function usePublications(filters?: { platform?: string; page?: number }) {
  return useQuery({
    queryKey: publicationKeys.list(filters),
    queryFn: () => fetchPublications(filters),
  });
}

export function useCreatePublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPublication,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: publicationKeys.all });
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(variables.ideaId) });
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() });
    },
  });
}

export function useUpdatePublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePublication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: publicationKeys.all });
    },
  });
}

export function useDeletePublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePublication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: publicationKeys.all });
    },
  });
}
