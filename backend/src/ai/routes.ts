import { Router, Request, Response } from "express";
import { GenEngineService } from "./gen_engine/service.js";

type AIRoutesOptions = {
  apiKey: string;
};

const DEFAULT_WEBGAME_SIZE = 640;
const MIN_WEBGAME_SIZE = 128;
const MAX_WEBGAME_SIZE = 2048;

export function createAIRoutes(options: AIRoutesOptions): Router {
  const router = Router();
  const genEngineService = new GenEngineService({ apiKey: options.apiKey });

  router.post("/gen_engine", async (req: Request, res: Response) => {
    try {
      const prompt = req.body?.prompt;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Missing prompt in request body" });
      }

      const result = await genEngineService.generateFromPrompt(prompt);
      return res.json(result);
    } catch (error) {
      console.error("AI gen_engine route error:", error);
      return res.status(500).json({ error: "Failed to generate response" });
    }
  });

  router.post("/gen_engine/webgame", async (req: Request, res: Response) => {
    try {
      const gameDescription = req.body?.gameDescription;
      if (!gameDescription || typeof gameDescription !== "string") {
        return res.status(400).json({
          error: "Missing gameDescription in request body",
        });
      }

      const rawSize = req.body?.size;
      const size =
        rawSize === undefined ? DEFAULT_WEBGAME_SIZE : Number(rawSize);

      if (
        !Number.isInteger(size) ||
        size < MIN_WEBGAME_SIZE ||
        size > MAX_WEBGAME_SIZE
      ) {
        return res.status(400).json({
          error: `Invalid size. Use an integer between ${MIN_WEBGAME_SIZE} and ${MAX_WEBGAME_SIZE}.`,
        });
      }

      const result = await genEngineService.generateWebGameHtml(
        gameDescription,
        size,
      );
      return res.json(result);
    } catch (error) {
      console.error("AI gen_engine webgame route error:", error);
      return res.status(500).json({ error: "Failed to generate webgame HTML" });
    }
  });

  return router;
}
