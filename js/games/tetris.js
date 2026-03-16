/**
 * Tetris Game
 */
const TetrisGame = (() => {
    let grid = [];
    let current = null;
    let tick = 0;
    let particles = [];
    const OFFSET_X = 290;
    const CELL_SIZE = 22;

    const init = () => {
        grid = Array(20).fill().map(() => Array(10).fill(0));
        particles = [];
        spawnPiece();
        return 16;
    };

    const spawnPiece = () => {
        const shape = TETRIS_SHAPES[Utils.randomInt(0, TETRIS_SHAPES.length - 1)];
        current = {
            s: JSON.parse(JSON.stringify(shape.s)),
            c: shape.c,
            x: 3,
            y: 0
        };
        
        if (collide()) {
            return 'gameover';
        }
        return 'continue';
    };

    const collide = () => {
        if (!current) return false;
        return current.s.some((row, dy) => {
            return row.some((value, dx) => {
                if (!value) return false;
                const ny = current.y + dy;
                const nx = current.x + dx;
                return ny >= 20 || nx < 0 || nx >= 10 || (ny >= 0 && grid[ny][nx]);
            });
        });
    };

    const move = (dx, dy) => {
        if (!current) return false;
        
        current.x += dx;
        current.y += dy;
        
        if (collide()) {
            current.x -= dx;
            current.y -= dy;
            
            if (dy > 0) {
                lockPiece();
                return false;
            }
            return false;
        }
        return true;
    };

    const rotate = () => {
        if (!current) return;
        
        const old = current.s;
        current.s = old[0].map((_, i) => old.map(row => row[i]).reverse());
        
        if (collide()) {
            current.s = old;
        }
    };

    const lockPiece = () => {
        if (!current) return;
        
        current.s.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value && current.y + dy >= 0) {
                    grid[current.y + dy][current.x + dx] = current.c;
                }
            });
        });
        
        clearLines();
        const result = spawnPiece();
        return result;
    };

    const clearLines = () => {
        const linesToClear = [];
        
        grid.forEach((row, r) => {
            if (row.every(value => value)) {
                linesToClear.push(r);
            }
        });
        
        if (linesToClear.length > 0) {
            linesToClear.forEach(r => {
                const row = grid[r];
                for (let c = 0; c < 10; c++) {
                    for (let i = 0; i < 8; i++) {
                        particles.push({
                            x: OFFSET_X + c * CELL_SIZE + 11,
                            y: 30 + r * CELL_SIZE + 11,
                            vx: (Math.random() - 0.5) * 8,
                            vy: (Math.random() - 0.5) * 8,
                            life: 1,
                            c: row[c]
                        });
                    }
                }
            });
            
            grid = grid.filter((_, r) => !linesToClear.includes(r));
            while (grid.length < 20) {
                grid.unshift(Array(10).fill(0));
            }
            
            return linesToClear.length * 100;
        }
        return 0;
    };

    const drawParticles = (ctx) => {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.c;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    };

    const run = (ctx, active, paused) => {
        Utils.clearCanvas(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        for (let r = 0; r < 20; r++) {
            for (let c = 0; c < 10; c++) {
                ctx.strokeStyle = '#1e293b';
                ctx.strokeRect(OFFSET_X + c * CELL_SIZE, 30 + r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }

        if (active && !paused) {
            tick += 16;
            if (tick > 800) {
                tick = 0;
                move(0, 1);
            }
        }

        grid.forEach((row, r) => {
            row.forEach((value, c) => {
                if (value) {
                    ctx.fillStyle = value;
                    ctx.beginPath();
                    ctx.roundRect(OFFSET_X + c * CELL_SIZE + 1, 30 + r * CELL_SIZE + 1, 20, 20, 4);
                    ctx.fill();
                }
            });
        });

        if (current) {
            current.s.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        ctx.fillStyle = current.c;
                        ctx.beginPath();
                        ctx.roundRect(
                            OFFSET_X + (current.x + dx) * CELL_SIZE + 1,
                            30 + (current.y + dy) * CELL_SIZE + 1,
                            20, 20, 4
                        );
                        ctx.fill();
                    }
                });
            });
        }

        drawParticles(ctx);

        return 'continue';
    };

    const getSpeed = (currentSpeed) => currentSpeed;

    return {
        init,
        run,
        move,
        rotate,
        getSpeed
    };
})();
