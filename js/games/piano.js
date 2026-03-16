/**
 * Piano Game
 */
const PianoGame = (() => {
    let notes = [];
    let tick = 0;

    const init = () => {
        notes = [];
        tick = 0;
        return 16;
    };

    const run = (ctx, active, paused) => {
        Utils.clearCanvas(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        tick++;
        
        if (tick % 25 === 0) {
            notes.push({
                lane: Utils.randomInt(0, 3),
                y: -30
            });
        }

        notes.forEach((n, i) => {
            n.y += 5;
            
            ctx.fillStyle = '#22d3ee';
            ctx.beginPath();
            ctx.roundRect(n.lane * 160 + 80, n.y, 140, 20, 4);
            ctx.fill();
            
            if (n.y > 450) {
                notes.splice(i, 1);
                return 'miss';
            }
        });

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 160 + 80, 0);
            ctx.lineTo(i * 160 + 80, 500);
            ctx.stroke();
        }

        return 'continue';
    };

    const playKey = (lane) => {
        const baseFreq = 261;
        AudioManager.playTone(baseFreq + lane * 30, 0.3, 'sine', 0.15);
        
        let hit = false;
        for (let n of notes) {
            if (n.lane === lane && n.y > 400 && n.y < 480) {
                hit = true;
                n.y = 1000;
                return 'score';
            }
        }
        
        if (!hit) {
            return 'miss';
        }
        
        return 'continue';
    };

    const getSpeed = (currentSpeed) => currentSpeed;

    return {
        init,
        run,
        playKey,
        getSpeed
    };
})();
