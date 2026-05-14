import { useState } from "react";

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = async (fn: () => Promise<T>): Promise<T | null> => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const result = await fn();
      setState({ data: result, isLoading: false, error: null });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setState({ data: null, isLoading: false, error: message });
      return null;
    }
  };

  return { ...state, execute };
}
