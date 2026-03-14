export type WebGameAttempt = {
  iteration: number;
  promptType: "generate" | "repair";
  html: string;
  passed: boolean;
  errorSummary: string[];
  runtime: {
    durationMs: number;
    consoleErrors: string[];
    pageErrors: string[];
    externalRequests: string[];
  };
  createdAt: Date;
};

export type BrowserExecutionResult = {
  durationMs: number;
  consoleErrors: string[];
  pageErrors: string[];
  externalRequests: string[];
};
