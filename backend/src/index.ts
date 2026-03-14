import express, { Request, Response } from "express";
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { logError, logInfo } from "./core/logger.js";
import { createRootRoutes } from "./routes.js";
import { initSocket } from "./socket.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    logInfo("http_request", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
  next();
});

const PORT = Number(process.env.PORT) || 3000;
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
const hasFrontendBuild = existsSync(frontendDistPath);

function mustEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    logError("missing_env", new Error(`Missing ${name} in .env`), { env: name });
    process.exit(1);
  }
  return value;
}

const MONGODB_URI = mustEnv("MONGODB_URI");
const GEMINI_API_KEY = mustEnv("GEMINI_API_KEY");

app.use(createRootRoutes({ apiKey: GEMINI_API_KEY }));

if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));
  app.get("/{*path}", (req, res, next) => {
    if (req.path.startsWith("/ai")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (_req: Request, res: Response) => {
    res.json({ ok: true, message: "Backend is running" });
  });
}

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    logInfo("mongodb_connected");

    const httpServer = createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      logInfo("server_started", { port: PORT, hasFrontendBuild, frontendDistPath });
    });
  } catch (error) {
    logError("startup_error", error);
    process.exit(1);
  }
}

start();
