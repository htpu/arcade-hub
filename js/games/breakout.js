/**
 * Breakout Game
 */
const BreakoutGame = (() => {
    let paddle = { x: 400, w: 120 };
    let ball = { x: 400, y: 400, dx: 4.5, dy: -4.5 };
    let bricks = [];
    const BRICK_COLORS = ['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#10b981'];

    const init = () => {
        paddle = { x: 400, w: 120 };
        ball = { x: 400, y: 400, dx: 4.5, dy: -4.5 };
        
        bricks = [];
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 14; c++) {
                bricks.push({
                    x: c * 55 + 15,
                    y: r * 22 + 50,
                    w: 50,
                    h: 18,
                    active: true,
                    c: BRICK_COLORS[r]
                });
            }
        }
        
        return 16;
    };

    const run = (ctx, active, paused) => {
        Utils.clearCanvas(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        bricks.forEach(b => {
            if (b.active) {
                ctx.fillStyle = b.c;
                ctx.beginPath();
                ctx.roundRect(b.x, b.y, b.w, b.h, 3);
                ctx.fill();
            }
        });

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.roundRect(paddle.x - paddle.w / 2, 480, paddle.w, 12, 6);
        ctx.fill();

        if (!active || paused) {
            return 'continue';
        }

        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x < 7 || ball.x > 793) {
            ball.dx *= -1;
        }
        
        if (ball.y < 7) {
            ball.dy *= -1;
        }

        if (ball.y > 473 && ball.x > paddle.x - paddle.w / 2 && ball.x < paddle.x + paddle.w / 2) {
            ball.dy = -Math.abs(ball.dy);
            ball.dx = (ball.x - paddle.x) / 10;
            AudioManager.playTone(440, 0.05);
        }

        bricks.forEach(brick => {
            if (brick.active && 
                ball.x > brick.x && 
                ball.x < brick.x + brick.w && 
                ball.y > brick.y && 
                ball.y < brick.y + brick.h) {
                
                brick.active = false;
                ball.dy *= -1;
                AudioManager.playTone(440, 0.05);
                return 'score';
            }
        });

        if (ball.y > 500) {
            return 'gameover';
        }

        return 'continue';
    };

    const setPaddleX = (x) => {
        paddle.x = x;
    };

    const getSpeed = (currentSpeed) => currentSpeed;

    return {
        init,
        run,
        setPaddleX,
        getSpeed
    };
})();
