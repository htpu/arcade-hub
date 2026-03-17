/**
 * UI Manager - handles DOM updates and UI rendering
 */
const UIManager = (() => {
    const renderGameGrid = () => {
        const grid = document.getElementById('game-grid');
        if (!grid) return;

        const gData = StatsManager.get().games;
        grid.innerHTML = '';

        Object.keys(CATEGORIES).forEach(catId => {
            const nav = document.getElementById('nav-' + catId);
            if (nav) {
                nav.innerHTML = '';
            }

            CATEGORIES[catId].forEach(id => {
                const game = gData[id];
                if (!game) return;

                if (nav) {
                    nav.innerHTML += `
                        <div onclick="switchScreen('${id}')" id="nav-item-${id}" class="nav-item group">
                            <svg class="w-5 h-5 flex-shrink-0" fill="${game.color}" viewBox="0 0 24 24">
                                <path d="${game.icon}"></path>
                            </svg>
                            <span class="nav-text text-xs font-bold uppercase tracking-widest" style="color: ${game.color}">${game.name}</span>
                        </div>
                    `;
                }

                grid.innerHTML += `
                    <div onclick="switchScreen('${id}')" class="cyber-card group" style="--card-glow: 0 0 20px ${game.color}40; --card-accent: ${game.color}; border-color: ${game.color}30">
                        <div class="card-icon" style="background: ${game.color}15; border-color: ${game.color}30">
                            <svg class="w-6 h-6" fill="${game.color}" viewBox="0 0 24 24">
                                <path d="${game.icon}"></path>
                            </svg>
                        </div>
                        <h3 class="card-title" style="color: ${game.color}">${game.name}</h3>
                        <span class="card-highscore">HS: ${game.hs}</span>
                    </div>
                `;
            });
        });
    };

    const renderGuide = () => {
        const container = document.getElementById('guide-content');
        if (!container) return;

        container.innerHTML = MANUAL_DATA.map(category => `
            <div class="guide-category">
                <p class="guide-category-label">${category.cat}</p>
                <div class="guide-items">
                    ${category.items.map(item => `
                        <div class="guide-item">
                            <h3>${item.name}</h3>
                            <p>${item.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    };

    const showOverlay = (type) => {
        const overlayContent = document.getElementById('overlay-content');
        const overlay = document.getElementById('overlay');
        
        if (!overlayContent || !overlay) return;

        let html = '';

        if (type === 'pause') {
            html = `
                <h2 class="overlay-title paused">Suspended</h2>
                <button onclick="togglePause()" class="overlay-btn pause-resume">Resume [Enter]</button>
            `;
        } else if (type === 'start') {
            html = `
                <h2 class="overlay-title">Initialize Link</h2>
                <p class="overlay-subtitle">Establish neural connection to proceed</p>
                <button onclick="startGame()" class="overlay-btn">Engage [Enter]</button>
            `;
        } else if (type === 'end') {
            html = `
                <h2 class="overlay-title">Connection Lost</h2>
                <p class="overlay-subtitle">Neural link terminated. Score: ${document.getElementById('current-score')?.innerText || '00'}</p>
                <button onclick="startGame()" class="overlay-btn">Retry [Enter]</button>
            `;
        }

        overlayContent.innerHTML = html;
        overlay.classList.remove('hidden');
        
        // Hide mobile controls when overlay is shown
        const controls = document.getElementById('mobile-controls');
        if (controls) controls.classList.add('hidden');
    };

    const hideOverlay = () => {
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        
        const mode = GameState.mode;
        const needsControls = ['snake', 'tetris', 'racer', 'runner', 'piano', 'c2048', 'core', 'breakout'].includes(mode);
        const controls = document.getElementById('mobile-controls');
        
        if (controls && needsControls) {
            controls.classList.remove('hidden');
            
            // Context-sensitive visibility
            const rotateBtn = controls.querySelector('[data-action="rotate"]');
            const pianoKeys = controls.querySelector('.piano-controls');
            
            if (rotateBtn) {
                rotateBtn.classList.toggle('hidden', mode !== 'tetris');
            }
            
            if (pianoKeys) {
                pianoKeys.classList.toggle('hidden', mode !== 'piano');
            }
        }
    };

    const updateScore = (score) => {
        const scoreEl = document.getElementById('current-score');
        if (scoreEl) {
            scoreEl.innerText = Utils.formatScore(score);
        }
    };

    const updateGameTitle = (title) => {
        const titleEl = document.getElementById('game-title');
        if (titleEl) {
            titleEl.innerText = title;
        }
    };

    const updateTime = () => {
        const timeEl = document.getElementById('system-time');
        if (timeEl) {
            const now = new Date();
            timeEl.innerText = now.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
        }
    };

    const setActiveNavItem = (id) => {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.getElementById('nav-item-' + id);
        if (navItem) {
            navItem.classList.add('active');
        }
    };

    const clearActiveNavItems = () => {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
    };

    const showScreen = (screenId) => {
        document.querySelectorAll('main > section').forEach(s => {
            s.classList.remove('screen-active');
            s.classList.add('screen-hidden');
        });

        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('screen-hidden');
            screen.classList.add('screen-active');
        }
    };

    const hideAllScreens = () => {
        document.querySelectorAll('main > section').forEach(s => {
            s.classList.remove('screen-active');
            s.classList.add('screen-hidden');
        });
    };

    const renderDashboard = () => {
        const stats = StatsManager.get();
        
        const totalTimeEl = document.getElementById('total-time-val');
        const totalRoundsEl = document.getElementById('total-rounds-val');
        const avgScoreEl = document.getElementById('avg-score-val');
        const gameStatsGrid = document.getElementById('game-stats-grid');

        if (totalTimeEl) {
            totalTimeEl.innerText = StatsManager.formatTime(stats.global.totalTime);
        }
        if (totalRoundsEl) {
            totalRoundsEl.innerText = stats.global.totalRounds;
        }
        if (avgScoreEl) {
            const avgScore = Math.round(
                Object.values(stats.games).reduce((a, b) => a + b.totalScore, 0) / 
                (stats.global.totalRounds || 1)
            );
            avgScoreEl.innerText = avgScore;
        }
        if (gameStatsGrid) {
            gameStatsGrid.innerHTML = Object.entries(stats.games).map(([id, s]) => `
                <div class="stat-card">
                    <span class="stat-label ${s.color} mb-2">${s.name}</span>
                    <div class="flex justify-between text-xs mb-1">
                        <span>Record</span>
                        <span class="text-white">${s.hs}</span>
                    </div>
                    <div class="flex justify-between text-xs">
                        <span>Rounds</span>
                        <span class="text-white">${s.rounds}</span>
                    </div>
                </div>
            `).join('');
        }
    };

    const refreshHighScores = () => {
        const stats = StatsManager.get();
        Object.keys(stats.games).forEach(id => {
            const card = document.querySelector(`.cyber-card[onclick="switchScreen('${id}')"]`);
            if (card) {
                const hsEl = card.querySelector('.card-highscore');
                if (hsEl) {
                    hsEl.innerText = `HS: ${stats.games[id].hs}`;
                }
            }
        });
    };

    const updateMuteUI = () => {
        const isMuted = StatsManager.getSettings().isMuted;
        const unmutedIcon = document.getElementById('nav-icon-unmuted');
        const mutedIcon = document.getElementById('nav-icon-muted');

        if (unmutedIcon && mutedIcon) {
            unmutedIcon.classList.toggle('hidden', isMuted);
            mutedIcon.classList.toggle('hidden', !isMuted);
        }
    };

    const init = () => {
        renderGameGrid();
        renderGuide();
        updateMuteUI();
    };

    return {
        init,
        renderGameGrid,
        renderGuide,
        showOverlay,
        hideOverlay,
        updateScore,
        updateGameTitle,
        updateTime,
        setActiveNavItem,
        clearActiveNavItems,
        showScreen,
        hideAllScreens,
        renderDashboard,
        refreshHighScores,
        updateMuteUI
    };
})();
