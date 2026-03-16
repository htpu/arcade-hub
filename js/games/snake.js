/**
 * Snake Game
 */
const SnakeGame = (() => {
    let body = [];
    let food = {};
    let obstacles = [];
    let dir = { x: 0, y: -1 };
    let next = { x: 0, y: -1 };
    let stars = [];

    const GRID_WIDTH = 40;
    const GRID_HEIGHT = 25;
    const CELL_SIZE = 20;

    const init = () => {
        const rx = Utils.randomInt(5, GRID_WIDTH - 6);
        const ry = Utils.randomInt(5, GRID_HEIGHT - 6);
        
        body = [{ x: rx, y: ry }, { x: rx, y: ry + 1 }];
        dir = { x: 0, y: -1 };
        next = { x: 0, y: -1 };
        
        obstacles = [];
        while (obstacles.length < 10) {
            const obs = {
                x: Utils.randomInt(0, GRID_WIDTH - 1),
                y: Utils.randomInt(0, GRID_HEIGHT - 1)
            };
            if (!body.some(p => p.x === obs.x && p.y === obs.y)) {
                obstacles.push(obs);
            }
        }
        
        spawnFood();
        stars = Utils.createStars(120, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        return 100;
    };

    const spawnFood = () => {
        let f;
        while (true) {
            f = {
                x: Utils.randomInt(0, GRID_WIDTH - 1),
                y: Utils.randomInt(0, GRID_HEIGHT - 1)
            };
            const collidesWithBody = body.some(p => p.x === f.x && p.y === f.y);
            const collidesWithObstacle = obstacles.some(o => o.x === f.x && o.y === f.y);
            if (!collidesWithBody && !collidesWithObstacle) break;
        }
        food = f;
    };

    const run = (ctx) => {
        Utils.clearCanvas(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        Utils.updateStars(stars);
        Utils.drawStars(ctx, stars);

        dir = { ...next };
        
        const head = {
            x: body[0].x + dir.x,
            y: body[0].y + dir.y
        };

        const collisionWithBody = body.some(p => p.x === head.x && p.y === head.y);
        const collisionWithWall = head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT;
        const collisionWithObstacle = obstacles.some(o => o.x === head.x && o.y === head.y);

        if (collisionWithWall || collisionWithBody || collisionWithObstacle) {
            return 'gameover';
        }

        body.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            AudioManager.playSuccess();
            spawnFood();
            return 'score';
        } else {
            body.pop();
        }

        ctx.fillStyle = '#a855f7';
        obstacles.forEach(o => {
            ctx.beginPath();
            ctx.roundRect(o.x * CELL_SIZE + 4, o.y * CELL_SIZE + 4, 12, 12, 2);
            ctx.fill();
        });

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(food.x * CELL_SIZE + 10, food.y * CELL_SIZE + 10, 8, 0, Math.PI * 2);
        ctx.fill();

        body.forEach((p, i) => {
            ctx.fillStyle = i === 0 ? '#22c55e' : `rgba(34, 197, 94, ${Math.max(0.2, 1 - i / body.length)})`;
            ctx.beginPath();
            ctx.roundRect(p.x * CELL_SIZE + 2, p.y * CELL_SIZE + 2, 16, 16, 4);
            ctx.fill();
        });

        return 'continue';
    };

    const setDirection = (newDir) => {
        const isOpposite = (d1, d2) => d1.x === -d2.x && d1.y === -d2.y;
        
        if (!isOpposite(dir, newDir)) {
            next = { ...newDir };
        }
    };

    const getDirection = () => ({ ...dir });

    const getSpeed = (currentSpeed) => {
        return Math.max(50, currentSpeed - 2);
    };

    return {
        init,
        run,
        setDirection,
        getDirection,
        getSpeed
    };
})();
