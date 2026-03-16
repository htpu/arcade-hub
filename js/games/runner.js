/**
 * Runner Game
 */
const RunnerGame = (() => {
    let obstacles = [];
    let px = 0;
    let tick = 0;

    const init = () => {
        obstacles = [];
        px = 0;
        tick = 0;
        return 16;
    };

    const run = (ctx, active, paused) => {
        Utils.clearCanvas(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        tick++;
        
        if (tick % 20 === 0) {
            obstacles.push({
                x: Utils.randomInt(-2, 2),
                y: -1
            });
        }

        ctx.fillStyle = '#3b82f6';
        obstacles.forEach(o => {
            o.y += 0.25;
            
            ctx.beginPath();
            ctx.roundRect(o.x * 80 + 360, o.y * 25, 70, 20, 4);
            ctx.fill();
            
            if (active && !paused && Math.abs(o.y - 18) < 0.8 && o.x === px) {
                return 'gameover';
            }
        });

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.roundRect(px * 80 + 360, 450, 70, 20, 4);
        ctx.fill();

        return 'continue';
    };

    const move = (direction) => {
        if (direction === 'left' && px > -2) {
            px--;
        } else if (direction === 'right' && px < 2) {
            px++;
        }
    };

    const getSpeed = (currentSpeed) => currentSpeed;

    return {
        init,
        run,
        move,
        getSpeed
    };
})();
