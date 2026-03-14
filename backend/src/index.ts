import express, { Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createRootRoutes } from "./routes.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;

function mustEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name} in .env`);
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
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

start();
