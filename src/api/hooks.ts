import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./index";
import type { TradeCreate } from "./types";

export function useTrades(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["trades", params],
    queryFn: () => api.getTrades(params),
  });
}

export function useTradeStats() {
  return useQuery({
    queryKey: ["trade-stats"],
    queryFn: api.getTradeStats,
  });
}

export function useStrategies() {
  return useQuery({
    queryKey: ["strategies"],
    queryFn: api.getStrategies,
  });
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: api.getTags,
  });
}

export function useCreateTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TradeCreate) => api.createTrade(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trades"] });
      qc.invalidateQueries({ queryKey: ["trade-stats"] });
    },
  });
}

export function useUpdateTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TradeCreate> }) =>
      api.updateTrade(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trades"] });
      qc.invalidateQueries({ queryKey: ["trade-stats"] });
    },
  });
}

export function useDeleteTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteTrade(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trades"] });
      qc.invalidateQueries({ queryKey: ["trade-stats"] });
    },
  });
}

export function useCreateStrategy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      api.createStrategy(name, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["strategies"] }),
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.createTag(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });
}
