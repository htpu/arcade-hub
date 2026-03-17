/**
 * Main Application Entry Point
 */

// Game state
const GameState = {
    mode: 'none',
    active: false,
    paused: false,
    score: 0,
    speed: 100,
    startTime: 0,
    loop: null
};

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('expanded');
    }
}

// DOM Elements
const scoreEl = document.getElementById('current-score');
const pauseBtn = document.getElementById('pauseBtn');

// Get canvas lazily to ensure it's available
function getCanvas() {
    return document.getElementById('gameCanvas');
}

function getCtx() {
    const c = getCanvas();
    return c ? c.getContext('2d') : null;
}

// Games registry
const Games = {
    snake: SnakeGame,
    tetris: TetrisGame,
    racer: RacerGame,
    runner: RunnerGame,
    c2048: C2048Game,
    core: CoreGame,
    breakout: BreakoutGame,
    memory: MemoryGame,
    piano: PianoGame
};

// Screen switching
async function switchScreen(mode, updateHistory = true) {
    try {
        await AudioManager.init();
    } catch (e) {}

    // Close sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('expanded');
    }

    GameState.paused = false;
    TouchController.reset();
    if (pauseBtn) {
        pauseBtn.classList.add('hidden');
    }

    UIManager.hideAllScreens();
    UIManager.clearActiveNavItems();

    if (mode === 'home') {
        GameState.active = false;
        clearInterval(GameState.loop);
        hideMobileControls();
        UIManager.showScreen('home-screen');
        UIManager.refreshHighScores();
        if (updateHistory) history.pushState({ screen: 'home' }, '', '#');
    } else if (mode === 'dashboard') {
        GameState.active = false;
        clearInterval(GameState.loop);
        hideMobileControls();
        UIManager.renderDashboard();
        UIManager.showScreen('dashboard-screen');
        if (updateHistory) history.pushState({ screen: 'dashboard' }, '', '#dashboard');
    } else if (mode === 'guide') {
        GameState.active = false;
        clearInterval(GameState.loop);
        hideMobileControls();
        UIManager.showScreen('guide-screen');
        if (updateHistory) history.pushState({ screen: 'guide' }, '', '#guide');
    } else if (mode === 'about') {
        GameState.active = false;
        clearInterval(GameState.loop);
        hideMobileControls();
        UIManager.showScreen('about-screen');
        if (updateHistory) history.pushState({ screen: 'about' }, '', '#about');
    } else if (Games[mode]) {
        GameState.mode = mode;
        UIManager.showScreen('game-container');
        UIManager.updateGameTitle(`INTERFACE.${mode.toUpperCase()}`);
        UIManager.setActiveNavItem(mode);

        // Hide mobile controls initially, UIManager.showOverlay will also ensure they are hidden
        hideMobileControls();

        const pianoControls = document.querySelector('.piano-controls');
        if (pianoControls) {
            pianoControls.style.display = mode === 'piano' ? 'flex' : 'none';
        }
        
        resetGame();
        UIManager.showOverlay('start');
        if (updateHistory) history.pushState({ screen: mode }, '', `#${mode}`);
    }
}

function resetGame() {
    GameState.score = 0;
    if (scoreEl) {
        scoreEl.innerText = '00';
    }
    
    try {
        if (Games[GameState.mode]) {
            GameState.speed = Games[GameState.mode].init();
        }
        
        const ctx = getCtx();
        if (ctx && Games[GameState.mode]) {
            GameState.speed = Games[GameState.mode].init();
        }
        
        if (ctx && Games[GameState.mode]) {
            Games[GameState.mode].run(ctx, false, false);
        }
    } catch (e) {
        console.error('Game reset error:', e);
    }
}

function startGame() {
    if (!GameState.active) {
        resetGame();
    }
    
    UIManager.hideOverlay();
    GameState.active = true;
    GameState.paused = false;
    
    if (pauseBtn) {
        pauseBtn.classList.remove('hidden');
    }
    
    GameState.startTime = Date.now();
    
    if (GameState.loop) {
        clearInterval(GameState.loop);
    }
    
    GameState.loop = setInterval(() => {
        runGameLoop();
    }, GameState.speed);
}

function togglePause() {
    if (!GameState.active) return;
    
    GameState.paused = !GameState.paused;
    
    if (GameState.paused) {
        UIManager.showOverlay('pause');
    } else {
        UIManager.hideOverlay();
    }
}

function endGame() {
    GameState.active = false;
    GameState.paused = false;
    
    if (pauseBtn) {
        pauseBtn.classList.add('hidden');
    }
    
    clearInterval(GameState.loop);
    AudioManager.playError();
    
    StatsManager.record(
        GameState.mode,
        GameState.score,
        (Date.now() - GameState.startTime) / 1000
    );
    
    UIManager.showOverlay('end');
}

function runGameLoop() {
    if (!GameState.active || GameState.paused) return;
    const ctx = getCtx();
    if (!ctx || !Games[GameState.mode]) return;

    const game = Games[GameState.mode];
    const result = game.run(ctx, GameState.active, GameState.paused);

    if (result === 'gameover') {
        endGame();
        return;
    }

    if (result === 'score') {
        GameState.score += 10;
        UIManager.updateScore(GameState.score);
    }

    if (result === 'score' || GameState.mode === 'snake' || GameState.mode === 'racer') {
        const newSpeed = game.getSpeed(GameState.speed);
        if (newSpeed !== GameState.speed) {
            GameState.speed = newSpeed;
            clearInterval(GameState.loop);
            GameState.loop = setInterval(runGameLoop, GameState.speed);
        }
    }
}

// Keyboard input handler
function handleKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ' ') && !document.getElementById('overlay')?.classList.contains('hidden')) {
        e.preventDefault();
        if (GameState.active && GameState.paused) {
            togglePause();
        } else {
            startGame();
        }
        return;
    }

    // Pause toggle
    if (e.key.toLowerCase() === 'p') {
        togglePause();
        return;
    }

    // Exit to home
    if (e.key === 'Escape') {
        switchScreen('home');
        return;
    }

    // Game controls
    if (!GameState.active || GameState.paused) return;

    const key = e.key;

    // Snake
    if (GameState.mode === 'snake') {
        if (key === 'ArrowUp' && Games.snake.getDirection().y === 0) {
            Games.snake.setDirection({ x: 0, y: -1 });
        }
        if (key === 'ArrowDown' && Games.snake.getDirection().y === 0) {
            Games.snake.setDirection({ x: 0, y: 1 });
        }
        if (key === 'ArrowLeft' && Games.snake.getDirection().x === 0) {
            Games.snake.setDirection({ x: -1, y: 0 });
        }
        if (key === 'ArrowRight' && Games.snake.getDirection().x === 0) {
            Games.snake.setDirection({ x: 1, y: 0 });
        }
    }

    // Runner / Racer
    if (GameState.mode === 'runner' || GameState.mode === 'racer') {
        if (key === 'ArrowLeft') {
            const game = Games[GameState.mode];
            if (game.moveLane) game.moveLane('left');
            else if (game.move) game.move('left');
        }
        if (key === 'ArrowRight') {
            const game = Games[GameState.mode];
            if (game.moveLane) game.moveLane('right');
            else if (game.move) game.move('right');
        }
    }

    // Piano
    if (GameState.mode === 'piano') {
        const keys = { 's': 0, 'd': 1, 'j': 2, 'k': 3 };
        if (keys[key.toLowerCase()] !== undefined) {
            const result = Games.piano.playKey(keys[key.toLowerCase()]);
            if (result === 'score') {
                GameState.score += 10;
                UIManager.updateScore(GameState.score);
            } else if (result === 'miss') {
                GameState.score = Math.max(0, GameState.score - 2);
                UIManager.updateScore(GameState.score);
            }
        }
    }

    // Tetris
    if (GameState.mode === 'tetris') {
        if (key === 'ArrowLeft') Games.tetris.move(-1, 0);
        if (key === 'ArrowRight') Games.tetris.move(1, 0);
        if (key === 'ArrowDown') Games.tetris.move(0, 1);
        if (key === 'ArrowUp') Games.tetris.rotate();
    }

    // Core
    if (GameState.mode === 'core') {
        if (key === 'ArrowLeft') Games.core.rotate('left');
        if (key === 'ArrowRight') Games.core.rotate('right');
    }

    // 2048
    if (GameState.mode === 'c2048') {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) {
            const result = Games.c2048.move(key);
            if (result.moved) {
                GameState.score += result.scoreGain;
                UIManager.updateScore(GameState.score);
            }
        }
    }
}

// Mouse/touch handlers
function handleCanvasClick(e) {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    if (!GameState.active && !document.getElementById('overlay')?.classList.contains('hidden')) {
        startGame();
        return;
    }

    if (GameState.mode === 'memory' && GameState.active && !GameState.paused) {
        const coords = Utils.getCanvasCoords(canvas, e.clientX, e.clientY);
        const x = coords.x;
        const y = coords.y;

        for (let i = 0; i < 4; i++) {
            const bx = 220 + (i % 2) * 200;
            const by = 100 + Math.floor(i / 2) * 160;
            if (x > bx && x < bx + 160 && y > by && y < by + 140) {
                const result = Games.memory.click(i);
                if (result === 'score') {
                    GameState.score += 10;
                    UIManager.updateScore(GameState.score);
                    setTimeout(() => {}, 600);
                } else if (result === 'gameover') {
                    endGame();
                }
            }
        }
    }
}

function handleCanvasMouseMove(e) {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    if (GameState.paused) return;

    if (GameState.mode === 'breakout' && GameState.active) {
        const coords = Utils.getCanvasCoords(canvas, e.clientX, e.clientY);
        Games.breakout.setPaddleX(coords.x);
    }

    if (GameState.mode === 'core' && GameState.active) {
        const coords = Utils.getCanvasCoords(canvas, e.clientX, e.clientY);
        const x = coords.x - 400;
        const y = coords.y - 250;
        Games.core.setAngle(Math.atan2(y, x));
    }
}

function handleCanvasTouchMove(e) {
    if (e.touches.length > 0) {
        e.preventDefault();
        handleCanvasMouseMove(e.touches[0]);
    }
}

// Mobile controls
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 30;

/**
 * Touch Control Management
 */
const TouchController = (() => {
    let joystickBase = null;
    let joystickKnob = null;
    let touchStartPos = null;
    let isMoving = false;
    const JOYSTICK_RADIUS = 60;
    const DEADZONE = 10;
    const TRIGGER_DIST = 30;

    const init = () => {
        joystickBase = document.getElementById('joystick-base');
        joystickKnob = document.getElementById('joystick-knob');
        const touchArea = document.getElementById('touch-zone');
        const controls = document.getElementById('mobile-controls');

        if (touchArea) {
            touchArea.addEventListener('pointerdown', handlePointerDown);
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }

        // Generic button handlers (Menu, Pause, Piano Keys)
        if (controls) {
            controls.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('pointerdown', (e) => {
                    const action = btn.dataset.action;
                    const key = btn.dataset.key;
                    if (action) handleAction(action);
                    if (key !== undefined) {
                        const result = Games.piano.playKey(parseInt(key));
                        handlePianoResult(result);
                    }
                    btn.classList.add('active', 'pressed');
                });
                btn.addEventListener('pointerup', () => btn.classList.remove('active', 'pressed'));
                btn.addEventListener('pointerleave', () => btn.classList.remove('active', 'pressed'));
            });
        }
    };

    const handleAction = (action) => {
        if (action === 'menu') switchScreen('home');
        if (action === 'pause') togglePause();
        if (action === 'start') {
            if (!GameState.active || GameState.paused) startGame();
        }
        if (action === 'rotate' && GameState.active && !GameState.paused) {
            if (GameState.mode === 'tetris') Games.tetris.rotate();
        }
    };

    const handlePointerDown = (e) => {
        // Overlay handling
        if (!document.getElementById('overlay')?.classList.contains('hidden')) {
            startGame();
            return;
        }

        if (!GameState.active || GameState.paused) return;

        touchStartPos = { x: e.clientX, y: e.clientY };
        isMoving = true;

        // Show joystick for 4-direction games
        if (['snake', 'c2048', 'tetris'].includes(GameState.mode)) {
            if (!joystickBase) joystickBase = document.getElementById('joystick-base');
            if (!joystickKnob) joystickKnob = document.getElementById('joystick-knob');
            
            if (joystickBase) {
                joystickBase.classList.remove('hidden');
                joystickBase.style.display = 'flex'; // Force display
                joystickBase.style.left = `${e.clientX}px`;
                joystickBase.style.top = `${e.clientY}px`;
                if (joystickKnob) joystickKnob.style.transform = 'translate(0, 0)';
            }
        }
        
        // Immediate action for Tap Zone games
        if (['racer', 'runner', 'breakout', 'core'].includes(GameState.mode)) {
            const side = e.clientX < window.innerWidth / 2 ? 'left' : 'right';
            executeDirection(side);
        }
    };

    const handlePointerMove = (e) => {
        if (!isMoving || !touchStartPos) return;

        const dx = e.clientX - touchStartPos.x;
        const dy = e.clientY - touchStartPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Update joystick visual
        if (joystickBase && !joystickBase.classList.contains('hidden')) {
            const angle = Math.atan2(dy, dx);
            const moveDist = Math.min(dist, JOYSTICK_RADIUS);
            const kx = Math.cos(angle) * moveDist;
            const ky = Math.sin(angle) * moveDist;
            joystickKnob.style.transform = `translate(${kx}px, ${ky}px)`;

            // Trigger cardinal directions for Snake/2048/Tetris
            if (dist > TRIGGER_DIST) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    executeDirection(dx > 0 ? 'right' : 'left');
                } else {
                    executeDirection(dy > 0 ? 'down' : 'up');
                }
                // Reset start pos to allow multiple moves in one drag for 2048/Tetris
                if (['c2048', 'tetris'].includes(GameState.mode)) {
                    touchStartPos = { x: e.clientX, y: e.clientY };
                }
            }
        }

        // Handle continuous movement for Racer/Runner/Breakout/Core
        if (['racer', 'runner', 'breakout', 'core'].includes(GameState.mode)) {
            const side = e.clientX < window.innerWidth / 2 ? 'left' : 'right';
            executeDirection(side);
        }
    };

    const handlePointerUp = () => {
        isMoving = false;
        touchStartPos = null;
        if (joystickBase) {
            joystickBase.classList.add('hidden');
            joystickBase.style.display = 'none';
        }
    };

    const executeDirection = (dir) => {
        if (!GameState.active || GameState.paused) return;
        const mode = GameState.mode;

        if (mode === 'snake') {
            const cur = Games.snake.getDirection();
            if (dir === 'up' && cur.y === 0) Games.snake.setDirection({ x: 0, y: -1 });
            if (dir === 'down' && cur.y === 0) Games.snake.setDirection({ x: 0, y: 1 });
            if (dir === 'left' && cur.x === 0) Games.snake.setDirection({ x: -1, y: 0 });
            if (dir === 'right' && cur.x === 0) Games.snake.setDirection({ x: 1, y: 0 });
        } else if (mode === 'tetris') {
            if (dir === 'left') Games.tetris.move(-1, 0);
            if (dir === 'right') Games.tetris.move(1, 0);
            if (dir === 'down') Games.tetris.move(0, 1);
            if (dir === 'up') Games.tetris.rotate();
        } else if (mode === 'c2048') {
            const keys = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' };
            const res = Games.c2048.move(keys[dir]);
            if (res && res.moved) {
                GameState.score += res.scoreGain;
                UIManager.updateScore(GameState.score);
            }
        } else if (['racer', 'runner'].includes(mode)) {
            const game = Games[mode];
            if (game.moveLane) game.moveLane(dir);
            else if (game.move) game.move(dir);
        } else if (mode === 'breakout') {
            const curX = Games.breakout.getPaddleX();
            Games.breakout.setPaddleX(dir === 'left' ? curX - 25 : curX + 25);
        } else if (mode === 'core') {
            Games.core.rotate(dir);
        }
    };

    const reset = () => {
        handlePointerUp();
    };

    return { init, reset };
})();

function showMobileControls() {
    const controls = document.getElementById('mobile-controls');
    if (controls) controls.classList.remove('hidden');
}

function hideMobileControls() {
    const controls = document.getElementById('mobile-controls');
    if (controls) controls.classList.add('hidden');
}

function handlePianoResult(result) {
    if (result === 'score') {
        GameState.score += 10;
        UIManager.updateScore(GameState.score);
    } else if (result === 'miss') {
        GameState.score = Math.max(0, GameState.score - 2);
        UIManager.updateScore(GameState.score);
    }
}

// Time update
function startTimeUpdater() {
    setInterval(() => {
        UIManager.updateTime();
    }, 1000);
}

// Initialize
function initApp() {
    // Handle initial hash on page load FIRST (before any UI renders)
    const initialHash = window.location.hash.slice(1);
    if (initialHash && Games[initialHash]) {
        // Hide all screens immediately to prevent flash
        UIManager.hideAllScreens();
    }

    // Load stats
    StatsManager.load();

    // Initialize UI
    UIManager.init();

    // Set version
    const versionEls = ['app-version', 'home-version'];
    versionEls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = CONFIG.VERSION;
    });

    const canvas = document.getElementById('gameCanvas');

    // Set up event listeners
    if (canvas) {
        canvas.addEventListener('mousedown', handleCanvasClick);
        canvas.addEventListener('mousemove', handleCanvasMouseMove);
    }

    document.addEventListener('keydown', handleKeyDown);

    // Initialize new Touch Controller
    TouchController.init();

    const muteNavBtn = document.getElementById('muteNavBtn');
    if (muteNavBtn) {
        muteNavBtn.onclick = AudioManager.toggleMute;
    }

    // Start time updater
    startTimeUpdater();

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        const hash = window.location.hash.slice(1);
        if (hash && (Games[hash] || hash === 'dashboard' || hash === 'guide' || hash === 'about')) {
            switchScreen(hash, false);
        } else {
            switchScreen('home', false);
        }
    });

    // Handle initial hash - call switchScreen after everything is ready
    if (initialHash && Games[initialHash]) {
        switchScreen(initialHash, false);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
