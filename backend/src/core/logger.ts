import { inspect } from "node:util";

type LogPayload = Record<string, unknown>;
type LogLevel = "INFO" | "ERROR";

const ANSI = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
} as const;

const MAX_VALUE_LEN = 300;

export function logInfo(event: string, payload: LogPayload = {}): void {
  writeLog("INFO", event, payload);
}

export function logError(
  event: string,
  error: unknown,
  payload: LogPayload = {},
): void {
  const errorPayload: LogPayload = {
    ...payload,
    error: error instanceof Error ? error.message : String(error),
  };

  if (error instanceof Error && error.stack) {
    errorPayload.stack = error.stack.split("\n").slice(0, 2).join(" | ");
  }

  writeLog("ERROR", event, errorPayload);
}

function writeLog(level: LogLevel, event: string, payload: LogPayload): void {
  const useColor = isColorEnabled();
  const levelColor = level === "ERROR" ? ANSI.red : ANSI.green;
  const stream = level === "ERROR" ? console.error : console.log;

  const timestamp = color(`[${new Date().toISOString()}]`, ANSI.dim, useColor);
  const levelText = color(level.padEnd(5, " "), levelColor, useColor);
  const eventText = color(event, ANSI.blue, useColor);
  const payloadText = formatPayload(payload, useColor);

  const line = payloadText
    ? `${timestamp} ${levelText} ${eventText} ${payloadText}`
    : `${timestamp} ${levelText} ${eventText}`;

  stream(line);
}

function formatPayload(payload: LogPayload, useColor: boolean): string {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return "";

  return entries
    .map(([key, value]) => {
      const keyText = color(key, ANSI.cyan, useColor);
      const valueText = color(formatValue(value), ANSI.yellow, useColor);
      return `${keyText}=${valueText}`;
    })
    .join(" ");
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return quoteAndTrim(value);
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  return trim(
    inspect(value, {
      depth: 4,
      breakLength: 120,
      colors: false,
      compact: true,
    }),
  );
}

function quoteAndTrim(value: string): string {
  return `"${trim(value)}"`;
}

function trim(value: string): string {
  if (value.length <= MAX_VALUE_LEN) return value;
  return `${value.slice(0, MAX_VALUE_LEN)}...`;
}

function color(value: string, colorCode: string, useColor: boolean): string {
  if (!useColor) return value;
  return `${colorCode}${value}${ANSI.reset}`;
}

function isColorEnabled(): boolean {
  if (process.env.NO_COLOR) return false;
  return Boolean(process.stdout.isTTY);
}
