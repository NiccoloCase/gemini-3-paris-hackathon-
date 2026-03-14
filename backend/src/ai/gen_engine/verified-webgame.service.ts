import { logError, logInfo } from "../../core/logger.js";
import { GEMINI_FIXED_MODEL } from "../core/model.js";
import { PlaywrightBrowserRunner, BrowserRunner } from "./browser-runner.js";
import { getGenEngineRuntimeConfig } from "./config.js";
import { GenEngineService } from "./service.js";
import { runAutoFixWorkflow } from "./workflow.js";

type VerifiedWebGameServiceOptions = {
  genEngineService: GenEngineService;
  runner?: BrowserRunner;
};

type GenerateVerifiedWebGameInput = {
  gameDescription: string;
  size: number;
  traceId?: string;
};

export type GenerateVerifiedWebGameResult = {
  model: string;
  size: number;
  html: string;
  attempts: number;
};

export class WebGameGenerationValidationError extends Error {
  readonly attempts: number;
  readonly errorSummary: string[];

  constructor(message: string, attempts: number, errorSummary: string[]) {
    super(message);
    this.name = "WebGameGenerationValidationError";
    this.attempts = attempts;
    this.errorSummary = errorSummary;
  }
}

export class VerifiedWebGameService {
  private readonly genEngineService: GenEngineService;
  private readonly runner: BrowserRunner;

  constructor(options: VerifiedWebGameServiceOptions) {
    this.genEngineService = options.genEngineService;
    this.runner = options.runner ?? new PlaywrightBrowserRunner();
  }

  async generateVerifiedWebGame(
    input: GenerateVerifiedWebGameInput,
  ): Promise<GenerateVerifiedWebGameResult> {
    const config = getGenEngineRuntimeConfig();
    let currentPhase = "init";
    let currentIteration = 0;
    let currentPromptType: "generate" | "repair" = "generate";

    const updatePhase = (phase: string, payload: Record<string, unknown> = {}) => {
      currentPhase = phase;
      logInfo("webgame_validation_phase", {
        traceId: input.traceId,
        phase,
        iteration: currentIteration,
        ...payload,
      });
    };

    logInfo("webgame_validation_started", {
      traceId: input.traceId,
      size: input.size,
      maxIterations: config.maxIterations,
    });

    const heartbeat = setInterval(() => {
      logInfo("webgame_validation_heartbeat", {
        traceId: input.traceId,
        phase: currentPhase,
        iteration: currentIteration,
      });
    }, 10_000);

    try {
      const workflowResult = await runAutoFixWorkflow({
        maxIterations: config.maxIterations,
        generateInitialHtml: async () => {
          currentIteration = 1;
          currentPromptType = "generate";
          updatePhase("generation_started", { promptType: "generate" });
          const generated = await this.genEngineService.generateWebGameHtml(
            input.gameDescription,
            input.size,
          );
          updatePhase("generation_completed", {
            promptType: "generate",
            htmlLength: generated.html.length,
          });
          return generated.html;
        },
        generateRepairedHtml: async ({
          previousHtml,
          errorSummary,
          iteration,
        }) => {
          currentIteration = iteration;
          currentPromptType = "repair";
          updatePhase("generation_started", {
            promptType: "repair",
            previousErrorCount: errorSummary.length,
          });
          const repaired = await this.genEngineService.repairWebGameHtml({
            gameDescription: input.gameDescription,
            squareSize: input.size,
            previousHtml,
            errorSummary,
            iteration,
          });
          updatePhase("generation_completed", {
            promptType: "repair",
            htmlLength: repaired.html.length,
          });
          return repaired.html;
        },
        executeHtml: async (html) => {
          updatePhase("runtime_check_started", {
            timeoutMs: config.runTimeoutMs,
            htmlLength: html.length,
          });
          const result = await this.runner.run(html, config.runTimeoutMs, {
            traceId: input.traceId,
            iteration: currentIteration,
            promptType: currentPromptType,
          });
          updatePhase("runtime_check_completed", {
            durationMs: result.durationMs,
            pageErrorCount: result.pageErrors.length,
            consoleErrorCount: result.consoleErrors.length,
            externalRequestCount: result.externalRequests.length,
          });
          return result;
        },
        onAttempt: async (attempt) => {
          currentIteration = attempt.iteration;
          updatePhase("attempt_completed", {
            promptType: attempt.promptType,
            passed: attempt.passed,
            durationMs: attempt.runtime.durationMs,
            errorCount: attempt.errorSummary.length,
            errors: attempt.errorSummary,
          });
        },
      });

      if (workflowResult.status === "succeeded") {
        logInfo("webgame_validation_succeeded", {
          traceId: input.traceId,
          attempts: workflowResult.attempts.length,
        });

        return {
          model: GEMINI_FIXED_MODEL,
          size: input.size,
          html: workflowResult.finalHtml,
          attempts: workflowResult.attempts.length,
        };
      }

      const latestErrors =
        workflowResult.attempts[workflowResult.attempts.length - 1]?.errorSummary ?? [];

      logError(
        "webgame_validation_failed",
        new Error(workflowResult.finalError),
        {
          traceId: input.traceId,
          attempts: workflowResult.attempts.length,
          errors: latestErrors,
        },
      );

      throw new WebGameGenerationValidationError(
        workflowResult.finalError,
        workflowResult.attempts.length,
        latestErrors,
      );
    } finally {
      clearInterval(heartbeat);
    }
  }
}
