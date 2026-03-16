/**
 * 2048 Game
 */
const C2048Game = (() => {
    let grid = [];

    const init = () => {
        grid = Array(4).fill().map(() => Array(4).fill(0));
        addTile();
        addTile();
        return 100;
    };

    const addTile = () => {
        const emptyCells = [];
        grid.forEach((row, ri) => {
            row.forEach((value, ci) => {
                if (value === 0) {
                    emptyCells.push({ r: ri, c: ci });
                }
            });
        });

        if (emptyCells.length > 0) {
            const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            grid[cell.r][cell.c] = Math.random() < 0.9 ? 2 : 4;
        }
    };

    const rotateGrid = (matrix) => {
        return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
    };

    const move = (direction) => {
        let rotated = JSON.parse(JSON.stringify(grid));
        let rotations = { 'ArrowLeft': 0, 'ArrowDown': 1, 'ArrowRight': 2, 'ArrowUp': 3 }[direction];
        
        for (let i = 0; i < rotations; i++) {
            rotated = rotateGrid(rotated);
        }

        let moved = false;
        let scoreGain = 0;

        for (let r = 0; r < 4; r++) {
            let row = rotated[r].filter(v => v !== 0);
            
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) {
                    row[i] *= 2;
                    scoreGain += row[i];
                    row.splice(i + 1, 1);
                    moved = true;
                    AudioManager.playMerge();
                }
            }
            
            while (row.length < 4) {
                row.push(0);
            }
            
            if (JSON.stringify(rotated[r]) !== JSON.stringify(row)) {
                moved = true;
            }
            rotated[r] = row;
        }

        for (let i = 0; i < (4 - rotations) % 4; i++) {
            rotated = rotateGrid(rotated);
        }

        grid = rotated;

        if (moved) {
            AudioManager.playTone(150, 0.05, 'sine', 0.05);
            addTile();
        }

        return { moved, scoreGain };
    };

    const run = (ctx) => {
        Utils.clearCanvas(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        grid.forEach((row, ri) => {
            row.forEach((value, ci) => {
                const x = ci * 100 + 205;
                const y = ri * 100 + 55;

                ctx.fillStyle = '#0f172a';
                ctx.beginPath();
                ctx.roundRect(x, y, 90, 90, 12);
                ctx.fill();

                if (value > 0) {
                    ctx.fillStyle = '#3b82f6';
                    ctx.beginPath();
                    ctx.roundRect(x, y, 90, 90, 12);
                    ctx.fill();

                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 28px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText(value, x + 45, y + 55);
                }
            });
        });

        return 'continue';
    };

    const isGameOver = () => {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (grid[r][c] === 0) return false;
                if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
                if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
            }
        }
        return true;
    };

    const getSpeed = (currentSpeed) => currentSpeed;

    return {
        init,
        run,
        move,
        isGameOver,
        getSpeed
    };
})();
