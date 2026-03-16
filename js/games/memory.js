/**
 * Memory Game
 */
const MemoryGame = (() => {
    let sequence = [];
    let userSequence = [];
    let activeIdx = -1;
    let gameState = 'watch';
    const COLORS = ['#22c55e', '#3b82f6', '#fbbf24', '#a855f7'];

    const init = () => {
        sequence = [];
        userSequence = [];
        activeIdx = -1;
        nextRound();
        return 500;
    };

    const nextRound = () => {
        sequence.push(Utils.randomInt(0, 3));
        userSequence = [];
        gameState = 'watch';
        showSequence();
    };

    const showSequence = async () => {
        for (let i = 0; i < sequence.length; i++) {
            activeIdx = sequence[i];
            AudioManager.playClick(activeIdx);
            await new Promise(r => setTimeout(r, 400));
            activeIdx = -1;
            await new Promise(r => setTimeout(r, 100));
        }
        gameState = 'play';
    };

    const run = (ctx) => {
        Utils.clearCanvas(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        for (let i = 0; i < 4; i++) {
            ctx.globalAlpha = (activeIdx === i) ? 1 : 0.2;
            ctx.fillStyle = COLORS[i];
            ctx.beginPath();
            ctx.roundRect(220 + (i % 2) * 200, 100 + Math.floor(i / 2) * 160, 160, 140, 20);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;

        return 'continue';
    };

    const click = (idx) => {
        if (gameState !== 'play') return;

        activeIdx = idx;
        setTimeout(() => { activeIdx = -1; }, 200);

        if (idx === sequence[userSequence.length]) {
            userSequence.push(idx);
            AudioManager.playClick(idx);

            if (userSequence.length === sequence.length) {
                return 'score';
            }
        } else {
            return 'gameover';
        }
        
        return 'continue';
    };

    const getSpeed = (currentSpeed) => currentSpeed;

    const getState = () => gameState;

    return {
        init,
        run,
        click,
        getSpeed,
        getState
    };
})();
