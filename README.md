# ARCADIA

**A.R.C.A.D.I.A. = Adaptive Real-time Co-Created Arcade with Dynamic Intelligence Adaptation.**

Arcadia is an AI arcade where each session generates a playable mini-game in real time from player context and intent.

## Pitch (Current)

- Classic arcades were discovery-driven: you did not know what game you would find until you played.
- Today discovery is weak: trailers and gameplay videos reveal most mechanics before play.
- Arcadia restores surprise with on-demand, AI-generated games tailored to the player.

## Tech Stack

- Frontend: React 18 + TypeScript + Vite, Tailwind CSS + Radix UI, Framer Motion
- Backend: Node.js + Express 5 + TypeScript
- AI layer: LangChain + `@langchain/google-genai` (Gemini 3)
- Realtime: Socket.IO
- Data: MongoDB + Mongoose
- Tooling: Playwright, Vitest, ESLint
- Data ingestion/retrieval helpers: Python (`google-genai`, `pandas`, `pymongo`, `moviepy`)

## Architecture

- `frontend/`: onboarding, generation flow, play view, app state
- `backend/`: REST AI endpoints (`/ai/*`), game/story generation services, realtime socket server
- `helper/`: optional ingestion and retrieval pipeline for content/video processing

## Run Locally

1. Create backend env:
   - `cp backend/.env.example backend/.env`
   - Set `MONGODB_URI` and `GEMINI_API_KEY`
2. Install deps:
   - `npm install` in `backend/`
   - `npm install` in `frontend/`
3. Start services:
   - Backend: `npm run dev` (port `3000`)
   - Frontend: `npm run dev` (port `8080`, proxies `/ai` to backend)

## Deploy On Railway (Single Service)

Railway can deploy both frontend and backend from this repository as one service:

1. Create Railway service from this repo root.
2. Set backend env vars in Railway:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
3. Railway uses `railway.toml`:
   - Build: installs backend + frontend deps, builds frontend then backend
   - Start: runs backend in production mode

In production, the backend serves `frontend/dist` and keeps `/ai/*` routes on the same domain, so no separate frontend deployment is needed.
