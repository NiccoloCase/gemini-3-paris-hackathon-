export type GenEngineRuntimeConfig = {
  maxIterations: number;
  runTimeoutMs: number;
  totalTimeoutMs: number;
};

export function getGenEngineRuntimeConfig(): GenEngineRuntimeConfig {
  return {
    maxIterations: intFromEnv("GEN_ENGINE_MAX_ITERATIONS", 5, 1, 10),
    runTimeoutMs: intFromEnv("GEN_ENGINE_RUN_TIMEOUT_MS", 4000, 1000, 20000),
    totalTimeoutMs: intFromEnv("GEN_ENGINE_TOTAL_TIMEOUT_MS", 180000, 5000, 300000),
  };
}

function intFromEnv(
  envName: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = process.env[envName];
  if (!raw) return fallback;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return fallback;
  if (parsed < min || parsed > max) return fallback;
  return parsed;
}
