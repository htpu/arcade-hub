/**
 * Racer Game
 */
const RacerGame = (() => {
    let obstacles = [];
    let lane = 0;
    let nextLane = 0;
    let currentSpd = 8;
    let tick = 0;

    const LANE_WIDTH = 150;
    const ROAD_LEFT = 175;
    const ROAD_RIGHT = 625;

    const init = () => {
        obstacles = [];
        lane = 0;
        nextLane = 0;
        currentSpd = 8;
        tick = 0;
        return 16;
    };

    const run = (ctx, active, paused) => {
        Utils.clearCanvas(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        tick++;
        currentSpd += 0.002;

        if (tick % 25 === 0) {
            const type = Math.random() > 0.15 ? 'virus' : 'coolant';
            obstacles.push({
                l: Utils.randomInt(-1, 1),
                y: -100,
                type: type
            });
        }

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ROAD_LEFT, 0, 450, 500);

        ctx.setLineDash([20, 40]);
        ctx.lineDashOffset = -tick * 10;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        
        [325, 475].forEach(lx => {
            ctx.beginPath();
            ctx.moveTo(lx, 0);
            ctx.lineTo(lx, 500);
            ctx.stroke();
        });
        
        ctx.setLineDash([]);

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(ROAD_LEFT, 0);
        ctx.lineTo(ROAD_LEFT, 500);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(ROAD_RIGHT, 0);
        ctx.lineTo(ROAD_RIGHT, 500);
        ctx.stroke();

        lane = Utils.lerp(lane, nextLane, 0.2);

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const o = obstacles[i];
            o.y += currentSpd;
            
            const x = 400 + o.l * LANE_WIDTH;
            
            if (o.type === 'virus') {
                ctx.fillStyle = '#fb7185';
                ctx.beginPath();
                ctx.roundRect(x - 40, o.y, 80, 40, 8);
                ctx.fill();
                
                if (o.y > 400 && o.y < 460 && Math.abs(o.l - lane) < 0.45) {
                    return 'gameover';
                }
            } else {
                ctx.fillStyle = '#06b6d4';
                ctx.beginPath();
                ctx.arc(x, o.y + 20, 15, 0, Math.PI * 2);
                ctx.fill();
                
                if (o.y > 400 && o.y < 460 && Math.abs(o.l - lane) < 0.45) {
                    currentSpd = Math.max(6, currentSpd - 2.5);
                    AudioManager.playMerge();
                    obstacles.splice(i, 1);
                    continue;
                }
            }
            
            if (o.y > 550) {
                obstacles.splice(i, 1);
            }
        }

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.roundRect(400 + lane * LANE_WIDTH - 30, 420, 60, 30, 6);
        ctx.fill();

        return 'continue';
    };

    const moveLane = (direction) => {
        if (direction === 'left' && nextLane > -1) {
            nextLane--;
        } else if (direction === 'right' && nextLane < 1) {
            nextLane++;
        }
    };

    const getSpeed = (currentSpeed) => currentSpeed;

    return {
        init,
        run,
        moveLane,
        getSpeed
    };
})();
