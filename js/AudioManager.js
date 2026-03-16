/**
 * Audio Manager - handles Web Audio API for sound effects
 */
const AudioManager = (() => {
    let context = null;

    const init = async () => {
        if (!context) {
            context = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (context.state === 'suspended') {
            await context.resume();
        }
    };

    const play = (frequency, duration, type = 'triangle', volume = 0.1) => {
        if (!context || StatsManager.getSettings().isMuted) return;
        
        if (context.state === 'suspended') {
            context.resume();
        }

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        
        gainNode.gain.setValueAtTime(volume, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start();
        oscillator.stop(context.currentTime + duration);
    };

    const playTone = (frequency, duration = 0.1, type = 'triangle') => {
        play(frequency, duration, type, 0.1);
    };

    const playSuccess = () => {
        play(523, 0.1);
    };

    const playError = () => {
        play(110, 0.5, 'sawtooth', 0.2);
    };

    const playMerge = () => {
        play(659, 0.1);
    };

    const playClick = (index = 0) => {
        play(300 + index * 100, 0.2);
    };

    const toggleMute = () => {
        const settings = StatsManager.getSettings();
        const newMutedState = !settings.isMuted;
        StatsManager.updateSettings({ isMuted: newMutedState });
        
        const unmutedIcon = document.getElementById('nav-icon-unmuted');
        const mutedIcon = document.getElementById('nav-icon-muted');
        
        if (unmutedIcon && mutedIcon) {
            unmutedIcon.classList.toggle('hidden', newMutedState);
            mutedIcon.classList.toggle('hidden', !newMutedState);
        }
        
        return newMutedState;
    };

    const isMuted = () => StatsManager.getSettings().isMuted;

    return {
        init,
        play,
        playTone,
        playSuccess,
        playError,
        playMerge,
        playClick,
        toggleMute,
        isMuted
    };
})();
