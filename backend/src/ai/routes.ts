import { Router, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { logError, logInfo } from "../core/logger.js";
import { GenEngineService } from "./gen_engine/service.js";
import {
  VerifiedWebGameService,
  WebGameGenerationValidationError,
  WebGameValidationTimeoutError,
} from "./gen_engine/verified-webgame.service.js";
import { GameGenerationWorkflowService } from "./game_generation/service.js";
import {
  StorytellingModelTimeoutError,
  StorytellingEngineService,
  StorytellingUserNotFoundError,
} from "./storytelling_engine/service.js";

type AIRoutesOptions = {
  apiKey: string;
  genEngineService?: GenEngineService;
  verifiedWebGameService?: VerifiedWebGameService;
  storytellingEngineService?: StorytellingEngineService;
  gameGenerationWorkflowService?: GameGenerationWorkflowService;
};

const DEFAULT_WEBGAME_SIZE = 640;
const MIN_WEBGAME_SIZE = 128;
const MAX_WEBGAME_SIZE = 2048;

export function createAIRoutes(options: AIRoutesOptions): Router {
  const router = Router();
  const genEngineService =
    options.genEngineService ??
    new GenEngineService({ apiKey: options.apiKey });
  const verifiedWebGameService =
    options.verifiedWebGameService ??
    new VerifiedWebGameService({
      genEngineService,
    });
  const storytellingEngineService =
    options.storytellingEngineService ??
    new StorytellingEngineService({ apiKey: options.apiKey });
  const gameGenerationWorkflowService =
    options.gameGenerationWorkflowService ??
    new GameGenerationWorkflowService({
      storytellingEngineService,
      verifiedWebGameService,
    });

  router.post("/gen_engine", async (req: Request, res: Response) => {
    try {
      const prompt = req.body?.prompt;
      if (!prompt || typeof prompt !== "string") {
        return res
          .status(400)
          .json({ error: "Missing prompt in request body" });
      }

      const result = await genEngineService.generateFromPrompt(prompt);
      return res.json(result);
    } catch (error) {
      logError("ai_gen_engine_route_error", error);
      return res.status(500).json({ error: "Failed to generate response" });
    }
  });

  router.post("/gen_engine/webgame", async (req: Request, res: Response) => {
    const traceId = randomUUID();
    try {
      const gameDescription = req.body?.gameDescription;
      if (!gameDescription || typeof gameDescription !== "string") {
        return res.status(400).json({
          error: "Missing gameDescription in request body",
          traceId,
        });
      }

      const sizeValidation = parseWebgameSize(req.body?.size);
      if (!sizeValidation.ok) {
        return res.status(400).json({
          error: sizeValidation.error,
          traceId,
        });
      }

      logInfo("ai_gen_engine_webgame_request_received", {
        traceId,
        size: sizeValidation.size,
        gameDescriptionLength: gameDescription.length,
      });

      const result = await verifiedWebGameService.generateVerifiedWebGame({
        gameDescription,
        size: sizeValidation.size,
        traceId,
      });

      return res.json({
        traceId,
        ...result,
      });
    } catch (error) {
      if (error instanceof WebGameGenerationValidationError) {
        return res.status(422).json({
          error: "Generated webgame did not pass runtime validation",
          traceId,
          attempts: error.attempts,
          latestErrorSummary: error.errorSummary,
        });
      }

      if (error instanceof WebGameValidationTimeoutError) {
        return res.status(504).json({
          error: "Webgame validation timed out",
          traceId,
          timeoutMs: error.timeoutMs,
          phase: error.phase,
          hint: "Increase GEN_ENGINE_TOTAL_TIMEOUT_MS for larger generations.",
        });
      }

      logError("ai_gen_engine_webgame_route_error", error, { traceId });
      return res
        .status(500)
        .json({ error: "Failed to generate webgame HTML", traceId });
    }
  });

  router.post(
    "/storytelling_engine/game-concept",
    async (req: Request, res: Response) => {
      const userId = req.body?.userId;
      if (!userId || typeof userId !== "string") {
        return res
          .status(400)
          .json({ error: "Missing userId in request body" });
      }

      try {
        logInfo("ai_storytelling_engine_request_received", { userId });
        const description =
          await storytellingEngineService.generatePersonalizedRetroGameDescription(
            userId,
          );
        return res.type("text/plain").send(description);
      } catch (error) {
        if (error instanceof StorytellingUserNotFoundError) {
          return res.status(404).json({ error: error.message });
        }
        if (error instanceof StorytellingModelTimeoutError) {
          return res.status(504).json({
            error: "Storytelling generation timed out",
            timeoutMs: error.timeoutMs,
            attempt: error.attempt,
          });
        }

        logError("ai_storytelling_engine_route_error", error, { userId });
        return res
          .status(500)
          .json({ error: "Failed to generate personalized game concept" });
      }
    },
  );

  router.post("/game-generation", async (req: Request, res: Response) => {
    const traceId = randomUUID();
    const requestStartedAt = Date.now();
    const userId = req.body?.userId;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        error: "Missing userId in request body",
        traceId,
      });
    }

    const sizeValidation = parseWebgameSize(req.body?.size);
    if (!sizeValidation.ok) {
      return res.status(400).json({
        error: sizeValidation.error,
        traceId,
      });
    }

    try {
      logInfo("ai_game_generation_workflow_request_received", {
        traceId,
        userId,
        size: sizeValidation.size,
      });

      const workflowResult =
        await gameGenerationWorkflowService.generateAndStoreGameForUser({
          userId,
          size: sizeValidation.size,
          traceId,
        });

      logInfo("ai_game_generation_workflow_request_completed", {
        traceId,
        userId,
        gameId: workflowResult.gameId,
        durationMs: Date.now() - requestStartedAt,
      });

      return res.json(workflowResult);
    } catch (error) {
      if (error instanceof StorytellingUserNotFoundError) {
        return res.status(404).json({ error: error.message, traceId });
      }
      if (error instanceof StorytellingModelTimeoutError) {
        return res.status(504).json({
          error: "Storytelling generation timed out",
          traceId,
          timeoutMs: error.timeoutMs,
          attempt: error.attempt,
          phase: "storytelling",
        });
      }

      if (error instanceof WebGameGenerationValidationError) {
        return res.status(422).json({
          error: "Generated webgame did not pass runtime validation",
          traceId,
          attempts: error.attempts,
          latestErrorSummary: error.errorSummary,
        });
      }

      if (error instanceof WebGameValidationTimeoutError) {
        return res.status(504).json({
          error: "Webgame validation timed out",
          traceId,
          timeoutMs: error.timeoutMs,
          phase: error.phase,
          hint: "Increase GEN_ENGINE_TOTAL_TIMEOUT_MS for larger generations.",
        });
      }

      logError("ai_game_generation_workflow_route_error", error, {
        traceId,
        userId,
      });
      return res.status(500).json({
        error: "Failed to generate and store game",
        traceId,
      });
    }
  });

  return router;
}

function parseWebgameSize(
  rawSize: unknown,
): { ok: true; size: number } | { ok: false; error: string } {
  const size = rawSize === undefined ? DEFAULT_WEBGAME_SIZE : Number(rawSize);

  if (
    !Number.isInteger(size) ||
    size < MIN_WEBGAME_SIZE ||
    size > MAX_WEBGAME_SIZE
  ) {
    return {
      ok: false,
      error: `Invalid size. Use an integer between ${MIN_WEBGAME_SIZE} and ${MAX_WEBGAME_SIZE}.`,
    };
  }

  return { ok: true, size };
}
