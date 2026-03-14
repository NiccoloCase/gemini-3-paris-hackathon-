import { Router } from "express";
import { createAIRoutes } from "./ai/routes.js";

type RootRoutesOptions = {
  apiKey: string;
};

export function createRootRoutes(options: RootRoutesOptions): Router {
  const router = Router();
  router.use("/ai", createAIRoutes({ apiKey: options.apiKey }));
  return router;
}
