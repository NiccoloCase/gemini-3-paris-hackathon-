export function extractHtml(rawOutput: string): string {
  const trimmed = rawOutput.trim();
  const fencedMatch = trimmed.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }
  return trimmed;
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

