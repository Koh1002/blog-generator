"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface IdeaFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}

export const ideaKeys = {
  all: ["ideas"] as const,
  lists: () => [...ideaKeys.all, "list"] as const,
  list: (filters: IdeaFilters) => [...ideaKeys.lists(), filters] as const,
  details: () => [...ideaKeys.all, "detail"] as const,
  detail: (id: string) => [...ideaKeys.details(), id] as const,
};

async function fetchIdeas(filters: IdeaFilters) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);

  const res = await fetch(`/api/ideas?${params}`);
  if (!res.ok) throw new Error("Failed to fetch ideas");
  return res.json();
}

async function fetchIdea(id: string) {
  const res = await fetch(`/api/ideas/${id}`);
  if (!res.ok) throw new Error("Failed to fetch idea");
  return res.json();
}

async function createIdea(data: { content: string; title?: string }) {
  const res = await fetch("/api/ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create idea");
  return res.json();
}

async function updateIdea({ id, ...data }: { id: string; [key: string]: unknown }) {
  const res = await fetch(`/api/ideas/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update idea");
  return res.json();
}

async function deleteIdea(id: string) {
  const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete idea");
  return res.json();
}

async function organizeIdea(id: string) {
  const res = await fetch(`/api/ideas/${id}/organize`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to organize idea");
  return res.json();
}

export function useIdeas(filters: IdeaFilters) {
  return useQuery({
    queryKey: ideaKeys.list(filters),
    queryFn: () => fetchIdeas(filters),
  });
}

export function useIdea(id: string) {
  return useQuery({
    queryKey: ideaKeys.detail(id),
    queryFn: () => fetchIdea(id),
    enabled: !!id,
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() });
    },
  });
}

export function useUpdateIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateIdea,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() });
    },
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() });
    },
  });
}

export function useOrganizeIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: organizeIdea,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ideaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ideaKeys.lists() });
    },
  });
}
