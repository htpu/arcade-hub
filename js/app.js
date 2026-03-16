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
async function switchScreen(mode) {
    try {
        await AudioManager.init();
    } catch (e) {}

    // Close sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('expanded');
    }

    GameState.paused = false;
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
    } else if (mode === 'dashboard') {
        GameState.active = false;
        clearInterval(GameState.loop);
        hideMobileControls();
        UIManager.renderDashboard();
        UIManager.showScreen('dashboard-screen');
    } else if (mode === 'guide') {
        GameState.active = false;
        clearInterval(GameState.loop);
        hideMobileControls();
        UIManager.showScreen('guide-screen');
    } else if (mode === 'about') {
        GameState.active = false;
        clearInterval(GameState.loop);
        hideMobileControls();
        UIManager.showScreen('about-screen');
    } else if (Games[mode]) {
        GameState.mode = mode;
        UIManager.showScreen('game-container');
        UIManager.updateGameTitle(`INTERFACE.${mode.toUpperCase()}`);
        UIManager.setActiveNavItem(mode);
        
        // Show mobile controls for appropriate games
        const needsControls = ['snake', 'tetris', 'racer', 'runner', 'piano', 'c2048', 'core'].includes(mode);
        if (needsControls) {
            showMobileControls();
        } else {
            hideMobileControls();
        }
        
        // Update piano controls visibility
        const pianoControls = document.querySelector('.piano-controls');
        if (pianoControls) {
            pianoControls.style.display = mode === 'piano' ? 'flex' : 'none';
        }
        
        resetGame();
        UIManager.showOverlay('start');
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
    // Start/resume game
    if ((e.key === 'Enter' || e.key === ' ') && !document.getElementById('overlay')?.classList.contains('hidden')) {
        e.preventDefault();
        if (GameState.paused) {
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
            Games[GameState.mode].move('left');
        }
        if (key === 'ArrowRight') {
            Games[GameState.mode].move('right');
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
    if (GameState.paused) return;

    if (GameState.mode === 'breakout' && GameState.active) {
        const coords = Utils.getCanvasCoords(canvas, e.clientX, e.clientY);
        Games.breakout.setPaddleX(coords.x);
    }

    if (GameState.mode === 'core' && GameState.active) {
        const coords = Utils.getCanvasCoords(canvas, e.clientX, e.clientY);
        const x = coords.x - 400 - 64;
        const y = coords.y - 250;
        Games.core.setAngle(Math.atan2(y, x));
    }
}

// Mobile controls
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 30;

function showMobileControls() {
    const controls = document.getElementById('mobile-controls');
    if (controls) {
        controls.classList.remove('hidden');
    }
}

function hideMobileControls() {
    const controls = document.getElementById('mobile-controls');
    if (controls) {
        controls.classList.add('hidden');
    }
}

function setupMobileControls() {
    const controls = document.getElementById('mobile-controls');
    if (!controls) return;

    // Button handlers
    controls.querySelectorAll('.control-btn').forEach(btn => {
        const handleAction = (e) => {
            e.preventDefault();
            if (!GameState.active || GameState.paused) return;
            
            const action = btn.dataset.action;
            const key = btn.dataset.key;
            
            if (key !== undefined) {
                // Piano key
                const result = Games.piano.playKey(parseInt(key));
                handlePianoResult(result);
                return;
            }
            
            switch(action) {
                case 'left':
                    if (GameState.mode === 'snake') Games.snake.setDirection({x: -1, y: 0});
                    if (GameState.mode === 'racer' || GameState.mode === 'runner') Games[GameState.mode].move('left');
                    if (GameState.mode === 'tetris') Games.tetris.move(-1, 0);
                    if (GameState.mode === 'core') Games.core.rotate('left');
                    if (GameState.mode === 'c2048') { const r = Games.c2048.move('ArrowLeft'); GameState.score += r.scoreGain || 0; }
                    break;
                case 'right':
                    if (GameState.mode === 'snake') Games.snake.setDirection({x: 1, y: 0});
                    if (GameState.mode === 'racer' || GameState.mode === 'runner') Games[GameState.mode].move('right');
                    if (GameState.mode === 'tetris') Games.tetris.move(1, 0);
                    if (GameState.mode === 'core') Games.core.rotate('right');
                    if (GameState.mode === 'c2048') { const r = Games.c2048.move('ArrowRight'); GameState.score += r.scoreGain || 0; }
                    break;
                case 'up':
                    if (GameState.mode === 'snake') Games.snake.setDirection({x: 0, y: -1});
                    if (GameState.mode === 'tetris') Games.tetris.rotate();
                    if (GameState.mode === 'c2048') { const r = Games.c2048.move('ArrowUp'); GameState.score += r.scoreGain || 0; }
                    break;
                case 'down':
                    if (GameState.mode === 'snake') Games.snake.setDirection({x: 0, y: 1});
                    if (GameState.mode === 'tetris') Games.tetris.move(0, 1);
                    if (GameState.mode === 'c2048') { const r = Games.c2048.move('ArrowDown'); GameState.score += r.scoreGain || 0; }
                    break;
                case 'rotate':
                    if (GameState.mode === 'tetris') Games.tetris.rotate();
                    break;
            }
            UIManager.updateScore(GameState.score);
        };

        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.classList.add('pressed');
            handleAction(e);
        });
        
        btn.addEventListener('touchend', () => {
            btn.classList.remove('pressed');
        });
        
        btn.addEventListener('mousedown', handleAction);
    });
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

// Swipe detection for canvas
function handleTouchStart(e) {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
}

function handleTouchEnd(e) {
    if (!GameState.active || GameState.paused) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Check if it's a swipe
    if (Math.abs(deltaX) < SWIPE_THRESHOLD && Math.abs(deltaY) < SWIPE_THRESHOLD) {
        return;
    }
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
            // Swipe right
            if (GameState.mode === 'racer' || GameState.mode === 'runner') Games[GameState.mode].move('right');
            if (GameState.mode === 'tetris') Games.tetris.move(1, 0);
            if (GameState.mode === 'core') Games.core.rotate('right');
            if (GameState.mode === 'snake' && Games.snake.getDirection().x === 0) Games.snake.setDirection({x: 1, y: 0});
            if (GameState.mode === 'c2048') { const r = Games.c2048.move('ArrowRight'); GameState.score += r.scoreGain || 0; }
        } else {
            // Swipe left
            if (GameState.mode === 'racer' || GameState.mode === 'runner') Games[GameState.mode].move('left');
            if (GameState.mode === 'tetris') Games.tetris.move(-1, 0);
            if (GameState.mode === 'core') Games.core.rotate('left');
            if (GameState.mode === 'snake' && Games.snake.getDirection().x === 0) Games.snake.setDirection({x: -1, y: 0});
            if (GameState.mode === 'c2048') { const r = Games.c2048.move('ArrowLeft'); GameState.score += r.scoreGain || 0; }
        }
    } else {
        // Vertical swipe
        if (deltaY > 0) {
            // Swipe down
            if (GameState.mode === 'tetris') Games.tetris.move(0, 1);
            if (GameState.mode === 'snake' && Games.snake.getDirection().y === 0) Games.snake.setDirection({x: 0, y: 1});
            if (GameState.mode === 'c2048') { const r = Games.c2048.move('ArrowDown'); GameState.score += r.scoreGain || 0; }
        } else {
            // Swipe up
            if (GameState.mode === 'tetris') Games.tetris.rotate();
            if (GameState.mode === 'snake' && Games.snake.getDirection().y === 0) Games.snake.setDirection({x: 0, y: -1});
            if (GameState.mode === 'c2048') { const r = Games.c2048.move('ArrowUp'); GameState.score += r.scoreGain || 0; }
        }
    }
    
    UIManager.updateScore(GameState.score);
}

// Time update
function startTimeUpdater() {
    setInterval(() => {
        UIManager.updateTime();
    }, 1000);
}

// Initialize
function initApp() {
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

    // Set up event listeners
    if (canvas) {
        canvas.addEventListener('mousedown', handleCanvasClick);
        canvas.addEventListener('mousemove', handleCanvasMouseMove);
        canvas.addEventListener('touchstart', handleTouchStart, {passive: false});
        canvas.addEventListener('touchend', handleTouchEnd, {passive: false});
    }

    document.addEventListener('keydown', handleKeyDown);

    // Setup mobile controls
    setupMobileControls();

    const muteNavBtn = document.getElementById('muteNavBtn');
    if (muteNavBtn) {
        muteNavBtn.onclick = AudioManager.toggleMute;
    }

    // Start time updater
    startTimeUpdater();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
