import { BrowserExecutionResult } from "./types.js";
import type { BrowserType, ConsoleMessage, Route } from "playwright";
import { logError, logInfo } from "../../core/logger.js";

export type BrowserRunner = {
  run(
    html: string,
    timeoutMs: number,
    context?: {
      traceId?: string;
      iteration?: number;
      promptType?: string;
    },
  ): Promise<BrowserExecutionResult>;
};

export class PlaywrightBrowserRunner implements BrowserRunner {
  async run(
    html: string,
    timeoutMs: number,
    runContext?: {
      traceId?: string;
      iteration?: number;
      promptType?: string;
    },
  ): Promise<BrowserExecutionResult> {
    const startedAt = Date.now();
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const externalRequests: string[] = [];

    logInfo("webgame_runtime_runner_started", {
      traceId: runContext?.traceId,
      iteration: runContext?.iteration,
      promptType: runContext?.promptType,
      timeoutMs,
      htmlLength: html.length,
    });

    const { chromium } = await import("playwright");
    const browser = await launchChromium(chromium);

    try {
      const browserContext = await browser.newContext();
      const page = await browserContext.newPage();

      page.on("pageerror", (error: Error) => {
        pageErrors.push(error.message);
        logInfo("webgame_runtime_pageerror_captured", {
          traceId: runContext?.traceId,
          iteration: runContext?.iteration,
          promptType: runContext?.promptType,
          error: error.message,
        });
      });

      page.on("console", (message: ConsoleMessage) => {
        if (message.type() === "error") {
          consoleErrors.push(message.text());
          logInfo("webgame_runtime_console_error_captured", {
            traceId: runContext?.traceId,
            iteration: runContext?.iteration,
            promptType: runContext?.promptType,
            error: message.text(),
          });
        }
      });

      await page.route("**/*", (route: Route) => {
        const requestUrl = route.request().url();
        if (
          requestUrl.startsWith("about:") ||
          requestUrl.startsWith("data:") ||
          requestUrl.startsWith("blob:")
        ) {
          route.continue().catch(() => {
            // no-op
          });
          return;
        }

        externalRequests.push(requestUrl);
        logInfo("webgame_runtime_external_request_blocked", {
          traceId: runContext?.traceId,
          iteration: runContext?.iteration,
          promptType: runContext?.promptType,
          url: requestUrl,
        });
        route.abort().catch(() => {
          // no-op
        });
      });

      await page.setContent(html, { waitUntil: "load" });
      await page.waitForTimeout(timeoutMs);
      await browserContext.close();
    } catch (error) {
      pageErrors.push(
        error instanceof Error ? error.message : "Unknown browser execution error",
      );
      logError("webgame_runtime_runner_exception", error, {
        traceId: runContext?.traceId,
        iteration: runContext?.iteration,
        promptType: runContext?.promptType,
      });
    } finally {
      await browser.close();
    }

    logInfo("webgame_runtime_runner_completed", {
      traceId: runContext?.traceId,
      iteration: runContext?.iteration,
      promptType: runContext?.promptType,
      durationMs: Date.now() - startedAt,
      pageErrorCount: pageErrors.length,
      consoleErrorCount: consoleErrors.length,
      externalRequestCount: externalRequests.length,
    });

    return {
      durationMs: Date.now() - startedAt,
      consoleErrors,
      pageErrors,
      externalRequests,
    };
  }
}

async function launchChromium(
  chromium: BrowserType,
) {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    try {
      return await chromium.launch({ headless: true, channel: "chrome" });
    } catch {
      throw new Error(
        "Unable to launch a browser with Playwright. Install Chromium (`npx playwright install chromium`) or ensure Chrome is available on this machine.",
      );
    }
  }
}
