import { BrowserExecutionResult } from "./types.js";

export function normalizeExecutionErrors(
  execution: BrowserExecutionResult,
  maxItems: number = 12,
): string[] {
  const grouped = [
    ...execution.pageErrors.map((value) => `pageerror: ${value}`),
    ...execution.consoleErrors.map((value) => `console.error: ${value}`),
    ...execution.externalRequests.map((value) => `external_request: ${value}`),
  ];

  const unique = Array.from(
    new Set(
      grouped
        .map((value) => value.replace(/\s+/g, " ").trim())
        .filter((value) => value.length > 0),
    ),
  );

  return unique.slice(0, maxItems);
}

