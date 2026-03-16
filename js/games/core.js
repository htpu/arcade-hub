/**
 * Core Defender Game
 */
const CoreGame = (() => {
    let angle = 0;
    let enemies = [];
    let tick = 0;

    const init = () => {
        angle = 0;
        enemies = [];
        tick = 0;
        return 16;
    };

    const run = (ctx, active, paused) => {
        Utils.clearCanvas(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        tick++;
        
        if (tick % 40 === 0) {
            const a = Math.random() * Math.PI * 2;
            enemies.push({
                x: 400 + Math.cos(a) * 400,
                y: 250 + Math.sin(a) * 400,
                a: a
            });
        }

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(400, 250, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(400, 250, 60, angle - 0.5, angle + 0.5);
        ctx.stroke();

        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            const dx = 400 - e.x;
            const dy = 250 - e.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            e.x += (dx / dist) * 3;
            e.y += (dy / dist) * 3;

            ctx.fillStyle = '#fb7185';
            ctx.beginPath();
            ctx.arc(e.x, e.y, 6, 0, Math.PI * 2);
            ctx.fill();

            if (dist < 70) {
                const enemyAngle = Math.atan2(dy, dx) + Math.PI;
                const diff = Math.abs(((enemyAngle - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
                
                if (diff < 0.6) {
                    enemies.splice(i, 1);
                    AudioManager.playTone(440, 0.05);
                    return 'score';
                } else if (dist < 25) {
                    return 'gameover';
                }
            }
        }

        return 'continue';
    };

    const rotate = (direction) => {
        if (direction === 'left') {
            angle -= 0.2;
        } else if (direction === 'right') {
            angle += 0.2;
        }
    };

    const setAngle = (newAngle) => {
        angle = newAngle;
    };

    const getSpeed = (currentSpeed) => currentSpeed;

    return {
        init,
        run,
        rotate,
        setAngle,
        getSpeed
    };
})();
