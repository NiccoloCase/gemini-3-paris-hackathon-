import express, { Request, Response } from "express";
import { createServer } from "node:http";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { logError, logInfo } from "./core/logger.js";
import { createRootRoutes } from "./routes.js";
import { initSocket } from "./socket.js";

dotenv.config();

const app = express();
app.use(cors());
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

app.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "Backend is running" });
});

app.use(createRootRoutes({ apiKey: GEMINI_API_KEY }));

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    logInfo("mongodb_connected");

    const httpServer = createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      logInfo("server_started", { port: PORT });
    });
  } catch (error) {
    logError("startup_error", error);
    process.exit(1);
  }
}

start();
