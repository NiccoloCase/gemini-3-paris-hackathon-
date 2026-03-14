// Mock data for the ARCADIA prototype

export const MOCK_USERS = [
  { id: '1', username: 'NeonKnight', avatar: '🤖', status: 'Playing' as const, game: 'Pixel Temple Breakout', genre: 'Action', vibe: 'Neon Sci-fi', x: 25, y: 35 },
  { id: '2', username: 'MythicMina', avatar: '🧝', status: 'Idle' as const, game: 'Shadow Labyrinth', genre: 'Puzzle', vibe: 'Fantasy', x: 55, y: 45 },
  { id: '3', username: 'ByteRunner', avatar: '👾', status: 'In Match' as const, game: 'Neon Dash', genre: 'Racing', vibe: 'Cyberpunk', x: 70, y: 25 },
  { id: '4', username: 'PixelWitch', avatar: '🧙', status: 'Generating Game' as const, game: null, genre: 'Horror', vibe: 'Dark Fantasy', x: 40, y: 60 },
  { id: '5', username: 'CosmicLeo', avatar: '🦁', status: 'Playing' as const, game: 'Star Serpent', genre: 'Arcade', vibe: 'Cosmic', x: 15, y: 55 },
  { id: '6', username: 'GlitchGirl', avatar: '💀', status: 'Idle' as const, game: 'Void Breaker', genre: 'Shooter', vibe: 'Glitchcore', x: 80, y: 50 },
  { id: '7', username: 'ArcadeKing', avatar: '👑', status: 'In Match' as const, game: 'Retro Rivals', genre: 'Fighting', vibe: 'Retro', x: 35, y: 20 },
  { id: '8', username: 'ZenCoder', avatar: '🧘', status: 'Idle' as const, game: 'Calm Circuit', genre: 'Chill', vibe: 'Cozy', x: 60, y: 70 },
];

export const MOCK_FRIENDS = [
  { id: '1', username: 'NeonKnight', avatar: '🤖', online: true, status: 'Playing Pixel Temple Breakout', genre: 'Action', vibe: 'Neon Sci-fi' },
  { id: '2', username: 'MythicMina', avatar: '🧝', online: true, status: 'In Lobby', genre: 'Puzzle', vibe: 'Fantasy' },
  { id: '3', username: 'ByteRunner', avatar: '👾', online: true, status: 'In Match — Neon Dash', genre: 'Racing', vibe: 'Cyberpunk' },
  { id: '5', username: 'CosmicLeo', avatar: '🦁', online: false, status: 'Last seen 2h ago', genre: 'Arcade', vibe: 'Cosmic' },
  { id: '6', username: 'GlitchGirl', avatar: '💀', online: false, status: 'Last seen 5h ago', genre: 'Shooter', vibe: 'Glitchcore' },
];

export const MOCK_PENDING_INVITES = [
  { id: '9', username: 'VoidWalker', avatar: '🌀', genre: 'Exploration', vibe: 'Ethereal' },
  { id: '10', username: 'PixelPunk', avatar: '🎸', genre: 'Rhythm', vibe: 'Punk' },
];

export const MOCK_SUGGESTED = [
  { id: '11', username: 'NightOwl', avatar: '🦉', genre: 'Horror', vibe: 'Dark Sci-fi', similarity: 87 },
  { id: '12', username: 'ThunderBolt', avatar: '⚡', genre: 'Action', vibe: 'Neon', similarity: 82 },
  { id: '13', username: 'DreamWeaver', avatar: '🌙', genre: 'Puzzle', vibe: 'Mythic', similarity: 76 },
];

export const MOCK_ACTIVITY_FEED = [
  { id: '1', text: 'CosmicLeo just generated a horror-themed Snake clone', time: '2m ago', icon: '🎮' },
  { id: '2', text: 'MythicMina started playing Pixel Temple Breakout', time: '5m ago', icon: '🕹️' },
  { id: '3', text: 'You unlocked your first arcade room', time: '12m ago', icon: '🏆' },
  { id: '4', text: 'ByteRunner set a new high score in Neon Dash', time: '18m ago', icon: '🔥' },
  { id: '5', text: 'GlitchGirl regenerated her game with a glitchcore theme', time: '25m ago', icon: '✨' },
  { id: '6', text: 'ArcadeKing challenged NeonKnight to a match', time: '31m ago', icon: '⚔️' },
];

export const ONBOARDING_QUESTIONS = [
  {
    question: "What kind of games get you hooked?",
    options: ["Classic Arcade", "Puzzle & Strategy", "Fast-paced Action", "Exploration & Story"],
    aiMessage: "Nice pick! Let's dig deeper into your style...",
  },
  {
    question: "What mood do you want your arcade world to have?",
    options: ["Neon Cyberpunk", "Dark Fantasy", "Cozy & Chill", "Cosmic Sci-fi"],
    aiMessage: "Love the vibe! One more thing...",
  },
  {
    question: "How do you like your challenge level?",
    options: ["Chaotic & Intense", "Strategic & Thoughtful", "Balanced Flow", "Chill & Relaxing"],
    aiMessage: "Getting a clear picture of your playstyle...",
  },
  {
    question: "Pick your aesthetic — what looks speak to you?",
    options: ["Glowing Neon Grids", "Ancient Mythic Ruins", "Pixel Art Paradise", "Sleek Minimalist"],
    aiMessage: "Perfect. I know exactly what to build for you.",
  },
];

export const GENERATION_STEPS = [
  { text: "Matching your arcade profile…", duration: 1200 },
  { text: "Analyzing your style…", duration: 1000 },
  { text: "Selecting a classic gameplay base…", duration: 1500 },
  { text: "Reimagining mechanics and visuals…", duration: 1800 },
  { text: "Building your personalized arcade world…", duration: 2000 },
];

export const MOCK_GENERATED_GAME = {
  title: "Neon Maze Runner",
  inspiration: "Pac-Man",
  theme: "Cyber-mythology",
  twist: "Enemies adapt to your movement style",
  difficulty: "Dynamic",
  mechanic: "Classic maze-chase with evolving AI pursuers that learn your patterns. Collect glowing runes to unlock mythic power-ups.",
};

export const MOCK_PROFILE = {
  username: "Player_One",
  avatar: "🎮",
  bio: "Arcade soul, neon heart. Building worlds one game at a time.",
  genres: ["Action", "Arcade", "Sci-fi"],
  vibes: ["Fast-paced", "Neon", "Competitive", "Chaos-friendly"],
  stats: {
    gamesGenerated: 7,
    highScore: 42850,
    friendsAdded: 12,
    timePlayed: "14h 32m",
    favoriteMechanic: "Maze-chase",
    currentVibe: "Cyber-mythic",
  },
  achievements: [
    { name: "First Generation", icon: "🎮", desc: "Generated your first game" },
    { name: "Social Butterfly", icon: "🦋", desc: "Added 10 friends" },
    { name: "High Scorer", icon: "🏆", desc: "Broke 40,000 points" },
    { name: "Vibe Curator", icon: "🎨", desc: "Tried 5 different themes" },
    { name: "Arcade Veteran", icon: "⭐", desc: "Played for 10+ hours" },
  ],
  gameHistory: [
    { title: "Neon Maze Runner", theme: "Cyber-mythology", score: 42850 },
    { title: "Shadow Serpent", theme: "Dark Fantasy", score: 31200 },
    { title: "Pixel Blitz", theme: "Retro Neon", score: 28400 },
    { title: "Void Breaker", theme: "Glitchcore", score: 19800 },
  ],
};

export type UserStatus = 'Playing' | 'Idle' | 'In Match' | 'Generating Game';

export const STATUS_COLORS: Record<UserStatus, string> = {
  'Playing': 'bg-neon-green',
  'Idle': 'bg-muted-foreground',
  'In Match': 'bg-neon-cyan',
  'Generating Game': 'bg-neon-magenta',
};
