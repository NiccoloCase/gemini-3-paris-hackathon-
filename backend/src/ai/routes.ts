import { Router, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { logError, logInfo } from "../core/logger.js";
import { GenEngineService } from "./gen_engine/service.js";
import {
  VerifiedWebGameService,
  WebGameGenerationValidationError,
  WebGameValidationTimeoutError,
} from "./gen_engine/verified-webgame.service.js";

type AIRoutesOptions = {
  apiKey: string;
  genEngineService?: GenEngineService;
  verifiedWebGameService?: VerifiedWebGameService;
};

const DEFAULT_WEBGAME_SIZE = 640;
const MIN_WEBGAME_SIZE = 128;
const MAX_WEBGAME_SIZE = 2048;

export function createAIRoutes(options: AIRoutesOptions): Router {
  const router = Router();
  const genEngineService =
    options.genEngineService ?? new GenEngineService({ apiKey: options.apiKey });
  const verifiedWebGameService =
    options.verifiedWebGameService ??
    new VerifiedWebGameService({
      genEngineService,
    });

  router.post("/gen_engine", async (req: Request, res: Response) => {
    try {
      const prompt = req.body?.prompt;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Missing prompt in request body" });
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
      return res.status(500).json({ error: "Failed to generate webgame HTML", traceId });
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
