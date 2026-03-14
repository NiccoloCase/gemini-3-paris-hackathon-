type BuildRetroArcadeStoryPromptInput = {
  userId: string;
  variationSeed: string;
  preferenceSnapshot: Record<string, unknown>;
};

const RETRO_REFERENCE_GAMES = [
  "Pac-Man",
  "Ms. Pac-Man",
  "Space Invaders",
  "Galaga",
  "Asteroids",
  "Centipede",
  "Dig Dug",
  "Frogger",
  "Breakout",
  "Q*bert",
  "Donkey Kong (arcade)",
  "Joust",
  "Tempest",
  "Defender",
  "Robotron: 2084",
  "Marble Madness",
  "Missile Command",
  "Xevious",
  "BurgerTime",
  "Tetris (arcade versions)",
];

export function buildRetroArcadeStoryPrompt(
  input: BuildRetroArcadeStoryPromptInput,
): string {
  const referenceList = RETRO_REFERENCE_GAMES.map((game) => `- ${game}`).join(
    "\n",
  );
  const preferencesJson = JSON.stringify(input.preferenceSnapshot, null, 2);

  return `You are a lead retro arcade game designer.

Task:
- Design ONE game concept for a single-player game only.
- The concept must be based on ONE existing classic game only.
- The concept must preserve a strong retro arcade identity, while adding fresh mechanics.
- Tailor the concept to this user's preferences.

Hard constraints:
- Mode must always be single player.
- References must come from this list:
${referenceList}
- Use exactly one reference game.
- Never merge or combine multiple games.
- Use the variation seed to produce a different result on different runs.
- This must feel deeply personal: the player should instantly feel "this game was made for me".
- Explicitly weave in as many concrete user signals as possible (hobbies, sports, mood, ideal world, aesthetics, challenge style, themes, vibes, game theme ideas, summary, username, and any other useful fields in the profile).
- The nostalgia tone must evoke "old arcade days" strongly, while still feeling fresh and custom-made for this person.

Mechanical feasibility contract (mandatory):
- Focus on a realistic browser-arcade implementation scope.
- 2D only (top-down, side view, or isometric fake-3D). No true 3D.
- Define a concrete player control scheme with at most 4 primary actions.
- Define explicit win condition and lose condition.
- Define score system with concrete scoring events.
- Define game loop phases (early/mid/late escalation).
- Cap complexity:
  - max 12 enemy/projectile archetypes total,
  - max 30 active enemies at once,
  - max 80 active projectiles/effects at once.
- Physics must be lightweight and deterministic:
  - no soft-body simulation,
  - no real fluid simulation,
  - no fully destructible terrain,
  - no mechanics requiring impossible precision timing.
- New mechanics must be implementable in simple rules and collisions.
- If you propose hazards/events, define trigger rules and cooldown/frequency bounds.

Variation seed: ${input.variationSeed}
User id: ${input.userId}
User preference snapshot:
\`\`\`json
${preferencesJson}
\`\`\`

Output format rules:
- Return ONE SINGLE PLAIN-TEXT STRING ONLY.
- No JSON and no Markdown code blocks.
- 320 to 520 words.
- Include an explicit reference sentence near the beginning in this exact style:
  "Reference games: <GAME_A>".
- Split the output in exactly two labeled blocks in this order:
  - "MECHANICS SPEC:"
  - "STYLE SPEC:"
- In MECHANICS SPEC include:
  - core objective,
  - player controls,
  - moment-to-moment loop,
  - win/lose conditions,
  - scoring rules,
  - progression phases,
  - at least 3 new mechanics with concrete trigger/cooldown/limits,
  - explicit feasibility note about why this can run in a browser arcade game.
- In STYLE SPEC include:
  - opening hook that makes the user feel recognized,
  - fantasy and setting,
  - highly specific background/environment design (layers, depth, weather, particles, lighting, landmarks),
  - color palette and visual vibe (retro arcade preserved but premium),
  - UI styling details (HUD, score treatment, transitions, cabinet-era cues),
  - music and audio style,
  - explicit mapping to user preferences.
- Mention at least 8 distinct preference/profile signals from the provided user snapshot.
- Include one sentence that explicitly says why this concept is personalized for this exact user.
- Make it specific enough that a game designer could build from it.`;
}
