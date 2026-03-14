type BuildRetroArcadeStoryPromptInput = {
  userId: string;
  variationSeed: string;
  preferenceSnapshot: Record<string, unknown>;
};

const RETRO_REFERENCE_GAMES = [
  "Pac-Man",
  "Space Invaders",
  "Galaga",
  "Asteroids",
  "Frogger",
  "Breakout",
  "Donkey Kong (arcade)",
];

export function buildRetroArcadeStoryPrompt(
  input: BuildRetroArcadeStoryPromptInput,
): string {
  const referenceList = RETRO_REFERENCE_GAMES.map((game) => `- ${game}`).join(
    "\n",
  );
  const preferencesJson = JSON.stringify(input.preferenceSnapshot, null, 2);

  return `You are a retro arcade game designer.

Task:
- Create ONE single-player game concept.
- Use exactly ONE reference game from the list below.
- Do NOT merge games.
- Keep the concept simple and feasible in browser 2D.
- Personalize it to the user profile.

Reference game list:
${referenceList}

Variation seed: ${input.variationSeed}
User id: ${input.userId}
User preference snapshot:
\`\`\`json
${preferencesJson}
\`\`\`

Output format rules:
- Plain text only, no JSON or markdown code blocks.
- 180 to 260 words.
- Start with: "Reference games: <GAME_A>".
- Then include exactly these two sections in order:
  MECHANICS SPEC:
  STYLE SPEC:
- MECHANICS SPEC must include: controls, objective, win condition, lose condition, score rules, and 2-3 simple mechanics.
- STYLE SPEC must include: setting, art vibe, HUD style, and personalization cues from the user profile.`;
}
