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

export function buildWebGameRepairPrompt(params: {
  gameDescription: string;
  squareSize: number;
  previousHtml: string;
  errorSummary: string[];
  iteration: number;
}): string {
  const errors = params.errorSummary.length
    ? params.errorSummary.map((error, index) => `${index + 1}. ${error}`).join("\n")
    : "No explicit runtime errors captured, but execution still failed.";

  return `You are fixing a broken HTML5 webgame.
Current iteration: ${params.iteration}
Original game description: ${params.gameDescription}

Constraints that must stay true:
- Single self-contained HTML file
- No external dependencies
- HTML5 Canvas game
- Canvas must be exactly ${params.squareSize}x${params.squareSize} pixels
- Immediate browser execution

Observed runtime errors:
${errors}

Previous HTML:
\`\`\`html
${params.previousHtml}
\`\`\`

Fix the code so runtime console/page errors are resolved.
Return ONLY valid HTML code with no additional text.`;
}

