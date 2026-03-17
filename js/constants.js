/**
 * Constants and Configuration
 */
const CONFIG = {
    VERSION: '3.4.6',
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 500,
    STORAGE_KEY: 'cyber_hub_v8_stats',
    COLORS: {
        BG: '#020617',
        NEON_CYAN: '#06b6d4',
        NEON_ROSE: '#f43f5e',
        SLATE: '#0f172a'
    }
};

const CATEGORIES = {
    arcade: ['snake', 'runner', 'racer', 'tetris', 'breakout', 'core'],
    cognitive: ['c2048', 'memory', 'piano']
};

const MANUAL_DATA = [
    {
        cat: "System Protocols",
        items: [
            { name: "Universal Control", desc: "Use ENTER/SPACE to start or resume any active link. P toggles the pause state. ESC disconnects the current module. Touch users swipe to steer in arcade modes." },
            { name: "UI Architecture", desc: "Arena is locked to 16:10 aspect ratio (800x500 px). Retractable Sidebar provides quick access to classified modules." }
        ]
    },
    {
        cat: "Arcade Matrix",
        items: [
            { name: "Neon Snake", desc: "Navigate the deep starfield to collect red data nodes. Avoid purple encrypted firewalls. Velocity increases linearly with consumption." },
            { name: "Pulse Racer", desc: "A triple-lane velocity challenge. Dodge incoming viruses. Collect Cyan nodes to COOL down core speed." },
            { name: "Cyber Tetris", desc: "Structural alignment simulation. Up arrow to rotate. Clearing lines triggers particle discharge." }
        ]
    },
    {
        cat: "Cognitive Layer",
        items: [
            { name: "Neural Memory", desc: "Test your synaptic retention by replicating sequences of illuminated nodes. Precision maintains the link." },
            { name: "Cyber 2048", desc: "Merge identical patterns to reach maximum density. Each slide saves progress to the core database." }
        ]
    }
];

const TETRIS_SHAPES = [
    { s: [[1, 1, 1, 1]], c: '#06b6d4' },
    { s: [[1, 1], [1, 1]], c: '#fbbf24' },
    { s: [[0, 1, 0], [1, 1, 1]], c: '#a855f7' },
    { s: [[1, 0, 0], [1, 1, 1]], c: '#3b82f6' },
    { s: [[0, 0, 1], [1, 1, 1]], c: '#f97316' },
    { s: [[1, 1, 0], [0, 1, 1]], c: '#22c55e' },
    { s: [[0, 1, 1], [1, 1, 0]], c: '#ef4444' }
];

const GAME_STATS_TEMPLATE = {
    snake: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Neon Snake', color: '#22c55e', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30', icon: 'M12 21a9 9 0 110-18 9 9 0 010 18z M9 9l6 6' },
    runner: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Grid Runner', color: '#3b82f6', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30', icon: 'M8 9l4-4 4 4m0 6l-4 4-4-4' },
    piano: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Cyber Piano', color: '#06b6d4', bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-500/30', icon: 'M9 18V5l12-2v13' },
    c2048: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Cyber 2048', color: '#f97316', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30', icon: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zm0 9h7v7h-7v-7zm-9 0h7v7H4v-7z' },
    breakout: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Breakout', color: '#eab308', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30', icon: 'M19 11H5' },
    tetris: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Cyber Tetris', color: '#a855f7', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30', icon: 'M10 4h4v12h4v4h-8V4z' },
    racer: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Pulse Racer', color: '#f43f5e', bgColor: 'bg-rose-500/20', borderColor: 'border-rose-500/30', icon: 'M13 5l7 7-7 7' },
    memory: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Neural Memory', color: '#fbbf24', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30', icon: 'M9.5 14.5a2.5 2.5 0 100-5 M14.5 14.5a2.5 2.5 0 100-5' },
    core: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Core Defender', color: '#10b981', bgColor: 'bg-emerald-500/20', borderColor: 'border-emerald-500/30', icon: 'M12 15l-3-3m0 0l3-3' }
};

const INITIAL_DATA = {
    settings: { isMuted: false },
    global: { totalTime: 0, totalRounds: 0 },
    games: GAME_STATS_TEMPLATE
};
