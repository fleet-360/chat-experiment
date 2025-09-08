import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getExperiment } from "../services/experimentService";
import type { Experiment } from "../types/app";

export type ExperimentContextValue = {
  experimentId: string;
  data: Experiment | null;
  loading: boolean;
  error?: unknown;
  refresh: () => Promise<void>;
};

const ExperimentContext = createContext<ExperimentContextValue | undefined>(undefined);

export function useExperiment() {
  const ctx = useContext(ExperimentContext);
  if (!ctx) throw new Error("useExperiment must be used within ExperimentProvider");
  return ctx;
}

export function ExperimentProvider({
  experimentId ,
  initialData,
  children,
}: {
  experimentId: string;
  initialData?: any | null;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<Experiment | null>(initialData ?? null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<unknown | undefined>(undefined);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const res = await getExperiment(experimentId);
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [experimentId]);

  useEffect(() => {
    if (initialData == null) void refresh();
  }, [initialData, refresh]);

  const value = useMemo<ExperimentContextValue>(
    () => ({ experimentId, data, loading, error, refresh }),
    [experimentId, data, loading, error, refresh]
  );

  return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>;
}


