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

