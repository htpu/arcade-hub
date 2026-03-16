/**
 * Stats Manager - handles game statistics and localStorage persistence
 */
const StatsManager = (() => {
    let stats = { ...INITIAL_DATA };

    const load = () => {
        const stored = Utils.safeGetFromStorage(CONFIG.STORAGE_KEY);
        if (stored) {
            stats = { ...INITIAL_DATA, ...stored };
        }
    };

    const save = () => {
        Utils.safeSetToStorage(CONFIG.STORAGE_KEY, stats);
    };

    const record = (gameId, score, duration) => {
        const game = stats.games[gameId];
        if (!game) return;

        game.rounds++;
        game.time += duration;
        game.totalScore += score;

        if (score > game.hs) {
            game.hs = score;
        }

        stats.global.totalRounds++;
        stats.global.totalTime += duration;
        save();
    };

    const get = () => stats;

    const getSettings = () => stats.settings;

    const updateSettings = (newSettings) => {
        stats.settings = { ...stats.settings, ...newSettings };
        save();
    };

    const resetAll = () => {
        if (confirm("Format Core?")) {
            try {
                localStorage.removeItem(CONFIG.STORAGE_KEY);
            } catch (e) {}
            location.reload();
        }
    };

    return {
        load,
        save,
        record,
        get,
        getSettings,
        updateSettings,
        resetAll,
        formatTime: Utils.formatTime
    };
})();
