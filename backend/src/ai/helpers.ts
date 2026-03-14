import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const GEMINI_FIXED_MODEL = "gemini-3.1-pro-preview";

export function createGeminiModel(apiKey: string): ChatGoogleGenerativeAI {
  return new ChatGoogleGenerativeAI({
    apiKey,
    model: GEMINI_FIXED_MODEL,
  });
}

export function buildWebGamePrompt(
  gameDescription: string,
  squareSize: number,
): string {
  return `Create a complete and working JavaScript game inside a single HTML file.
Game description: ${gameDescription}

Mandatory requirements:
- Use HTML5 Canvas
- The game area must be a square of exactly ${squareSize}x${squareSize} pixels
- Keep everything inline (HTML + CSS + JS in one file)
- No external dependencies
- It must run immediately when the file is opened in a browser
- Include keyboard or mouse controls and a win/game-over condition

Return ONLY valid HTML code with no additional text.`;
}

export function extractHtml(rawOutput: string): string {
  const trimmed = rawOutput.trim();
  const fencedMatch = trimmed.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }
  return trimmed;
}

export function responseContentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "text" in item) {
          const text = (item as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .join("\n");
  }
  return "";
}

export function enforceSquareCanvasHtml(html: string, squareSize: number): string {
  const enforcementScript = `<script>
(() => {
  const size = ${squareSize};
  const canvases = document.querySelectorAll("canvas");
  canvases.forEach((canvas) => {
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    canvas.style.display = canvas.style.display || "block";
    canvas.style.margin = canvas.style.margin || "0 auto";
  });
})();
</script>`;

  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${enforcementScript}\n</body>`);
  }
  return `${html}\n${enforcementScript}`;
}
