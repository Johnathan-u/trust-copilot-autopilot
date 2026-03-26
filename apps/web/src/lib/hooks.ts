import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";

export function useApiQuery<T>(
  key: string[],
  path: string,
  options?: Omit<UseQueryOptions<T, ApiError>, "queryKey" | "queryFn">
) {
  return useQuery<T, ApiError>({
    queryKey: key,
    queryFn: () => api.get<T>(path),
    ...options,
  });
}

export function useApiMutation<TData, TVariables>(
  method: "post" | "put" | "patch" | "delete",
  path: string | ((vars: TVariables) => string),
  options?: {
    invalidateKeys?: string[][];
    onSuccess?: (data: TData) => void;
  }
) {
  const qc = useQueryClient();
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: (vars: TVariables) => {
      const url = typeof path === "function" ? path(vars) : path;
      if (method === "delete") return api.delete<TData>(url);
      return api[method]<TData>(url, vars);
    },
    onSuccess: (data) => {
      options?.invalidateKeys?.forEach((key) => qc.invalidateQueries({ queryKey: key }));
      options?.onSuccess?.(data);
    },
  });
}
