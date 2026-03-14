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
  const referenceList = RETRO_REFERENCE_GAMES.map((game) => `- ${game}`).join("\n");
  const preferencesJson = JSON.stringify(input.preferenceSnapshot, null, 2);

  return `You are a retro arcade game designer.

Task:
- Create ONE single-player game concept.
- Use exactly ONE reference game from the list below.
- Do NOT merge games.
- Keep the concept simple and feasible in browser 2D.
- Personalize it to the user profile.
- Preserve the core gameplay loop of the chosen reference game.

Reference game list:
${referenceList}

Variation seed: ${input.variationSeed}
User id: ${input.userId}
User preference snapshot:
\`\`\`json
${preferencesJson}
\`\`\`

Personalization rules:
- Personalization must affect more than background art.
- Reflect the user's preferences through at least 4 of these: player role, objective framing, collectibles, hazards, power-up, score theme, HUD wording, setting details, win/lose flavor.
- Add at most ONE light mechanics twist inspired by the user's preferences.
- Do NOT change the core movement/combat structure of the reference game.
- If the user likes things such as mountains, adventure, nature, or fresh air, express that through traversal fantasy, obstacle types, pickups, route tension, and game feedback.

Output format rules:
- Plain text only, no JSON or markdown code blocks.
- 180 to 260 words.
- Start with: "Reference games: <GAME_A>".
- Then include exactly these two sections in order:
  MECHANICS SPEC:
  STYLE SPEC:
- MECHANICS SPEC must include: controls, objective, win condition, lose condition, score rules, and 2-3 simple mechanics.
- At least one of the listed mechanics must visibly reflect the user's preferences without replacing the core loop.
- STYLE SPEC must include: setting, art vibe, HUD style, and personalization cues from the user profile.`;
}