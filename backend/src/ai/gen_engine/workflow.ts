import { normalizeExecutionErrors } from "./errors.js";
import { BrowserExecutionResult, WebGameAttempt } from "./types.js";

type RunAutoFixWorkflowParams = {
  maxIterations: number;
  generateInitialHtml: () => Promise<string>;
  generateRepairedHtml: (params: {
    previousHtml: string;
    errorSummary: string[];
    iteration: number;
  }) => Promise<string>;
  executeHtml: (html: string) => Promise<BrowserExecutionResult>;
  onAttempt?: (attempt: WebGameAttempt) => Promise<void> | void;
};

type RunAutoFixWorkflowResult =
  | {
      status: "succeeded";
      finalHtml: string;
      attempts: WebGameAttempt[];
    }
  | {
      status: "failed";
      finalHtml?: string;
      finalError: string;
      attempts: WebGameAttempt[];
    };

export async function runAutoFixWorkflow(
  params: RunAutoFixWorkflowParams,
): Promise<RunAutoFixWorkflowResult> {
  const attempts: WebGameAttempt[] = [];
  let previousHtml = "";
  let previousErrors: string[] = [];

  for (let iteration = 1; iteration <= params.maxIterations; iteration += 1) {
    const promptType = iteration === 1 ? "generate" : "repair";
    const html =
      iteration === 1
        ? await params.generateInitialHtml()
        : await params.generateRepairedHtml({
            previousHtml,
            errorSummary: previousErrors,
            iteration,
          });

    const execution = await params.executeHtml(html);
    const errorSummary = normalizeExecutionErrors(execution);
    const passed = errorSummary.length === 0;

    const attempt: WebGameAttempt = {
      iteration,
      promptType,
      html,
      passed,
      errorSummary,
      runtime: {
        durationMs: execution.durationMs,
        consoleErrors: execution.consoleErrors,
        pageErrors: execution.pageErrors,
        externalRequests: execution.externalRequests,
      },
      createdAt: new Date(),
    };

    attempts.push(attempt);
    await params.onAttempt?.(attempt);

    if (passed) {
      return {
        status: "succeeded",
        finalHtml: html,
        attempts,
      };
    }

    previousHtml = html;
    previousErrors = errorSummary;
  }

  return {
    status: "failed",
    finalHtml: attempts[attempts.length - 1]?.html,
    finalError: `Runtime errors persisted after ${params.maxIterations} iterations`,
    attempts,
  };
}
