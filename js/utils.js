/**
 * Constants
 */
const CONFIG = {
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

/**
 * Utility Functions
 */
const Utils = {
    formatTime(sec) {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    formatScore(score) {
        return score.toString().padStart(2, '0');
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    getRandomEmptyCell(grid, occupiedCells = []) {
        const cells = [];
        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                if (grid[r][c] === 0) {
                    const isOccupied = occupiedCells.some(cell => cell.r === r && cell.c === c);
                    if (!isOccupied) {
                        cells.push({ r, c });
                    }
                }
            }
        }
        if (cells.length === 0) return null;
        return cells[Math.floor(Math.random() * cells.length)];
    },

    isCollidingWithRect(x, y, w, h, rx, ry, rw, rh) {
        return x < rx + rw && x + w > rx && y < ry + rh && y + h > ry;
    },

    isCollidingWithCircle(x, y, r, cx, cy, cr) {
        const dx = x - cx;
        const dy = y - cy;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < r + cr;
    },

    createStars(count, width, height) {
        return Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            opacity: Math.random()
        }));
    },

    updateStars(stars) {
        stars.forEach(star => {
            star.opacity += (Math.random() - 0.5) * 0.1;
            star.opacity = Math.max(0.1, Math.min(1, star.opacity));
        });
    },

    drawStars(ctx, stars) {
        stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    clearCanvas(ctx, width, height, color = CONFIG.COLORS.BG) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
    },

    safeJSONParse(str, fallback = null) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return fallback;
        }
    },

    safeGetFromStorage(key, fallback = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch (e) {
            return fallback;
        }
    },

    safeSetToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('Storage quota exceeded or unavailable');
            return false;
        }
    },

    getCanvasCoords(canvas, clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left) * (CONFIG.CANVAS_WIDTH / rect.width),
            y: (clientY - rect.top) * (CONFIG.CANVAS_HEIGHT / rect.height)
        };
    }
};

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
    snake: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Neon Snake', color: 'text-green-500', icon: 'M12 21a9 9 0 110-18 9 9 0 010 18z M9 9l6 6' },
    runner: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Grid Runner', color: 'text-blue-500', icon: 'M8 9l4-4 4 4m0 6l-4 4-4-4' },
    piano: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Cyber Piano', color: 'text-cyan-500', icon: 'M9 18V5l12-2v13' },
    c2048: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Cyber 2048', color: 'text-orange-500', icon: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zm0 9h7v7h-7v-7zm-9 0h7v7H4v-7z' },
    breakout: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Breakout', color: 'text-yellow-500', icon: 'M19 11H5' },
    tetris: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Cyber Tetris', color: 'text-purple-500', icon: 'M10 4h4v12h4v4h-8V4z' },
    racer: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Pulse Racer', color: 'text-rose-500', icon: 'M13 5l7 7-7 7' },
    memory: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Neural Memory', color: 'text-amber-500', icon: 'M9.5 14.5a2.5 2.5 0 100-5 M14.5 14.5a2.5 2.5 0 100-5' },
    core: { hs: 0, rounds: 0, time: 0, totalScore: 0, name: 'Core Defender', color: 'text-emerald-500', icon: 'M12 15l-3-3m0 0l3-3' }
};

const INITIAL_DATA = {
    settings: { isMuted: false },
    global: { totalTime: 0, totalRounds: 0 },
    games: GAME_STATS_TEMPLATE
};
