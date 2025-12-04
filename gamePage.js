// Game Detail Page Logic
let currentGameInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
    
    // Try to get game from session storage first
    let game = null;
    const storedGame = sessionStorage.getItem('currentGame');
    if (storedGame) {
        game = JSON.parse(storedGame);
        displayGame(game);
    } else {
        // Fallback: create game manager and find game
        const gameManager = new GameDataManager();
        await gameManager.discoverGames();
        game = gameManager.games.find(g => g.id === gameId);
        if (game) {
            displayGame(game);
        } else {
            // If game not found, redirect to home
            window.location.href = 'index.html';
        }
    }

    setupGamePageListeners();
});

function displayGame(game) {
    const wrapper = document.getElementById('game-detail-wrapper');
    if (!wrapper) return;

    // Update page title
    document.getElementById('game-title').textContent = `${game.name} - Lumio`;

    wrapper.innerHTML = `
        <img src="${game.thumbnail}" alt="${game.name}" class="game-banner" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'800\\' height=\\'400\\'%3E%3Crect fill=\\'%23141b3d\\' width=\\'800\\' height=\\'400\\'/%3E%3Ctext fill=\\'%2300d4ff\\' font-family=\\'Arial\\' font-size=\\'40\\' x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\'%3E${encodeURIComponent(game.name)}%3C/text%3E%3C/svg%3E'">
        
        <div class="game-header">
            <div class="game-info">
                <h1 class="game-title-large">${game.name}</h1>
                <div class="game-meta">
                    ${game.framework ? `<span class="game-tag" style="background: rgba(176, 38, 255, 0.2); border-color: var(--neon-purple);">${game.framework.name}</span>` : ''}
                    ${game.tags.map(tag => `<span class="game-tag">${tag}</span>`).join('')}
                </div>
                <p class="game-description">${game.description}</p>
            </div>
        </div>

        <div class="play-section">
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1rem;">
                <button class="play-btn" id="play-btn">Play Now</button>
                <button class="open-new-tab-btn" id="open-new-tab-btn" style="display: none;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 20px; height: 20px; margin-right: 0.5rem;">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"></path>
                    </svg>
                    Open in New Tab
                </button>
                <button class="open-about-blank-btn" id="open-about-blank-btn" style="display: none;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 20px; height: 20px; margin-right: 0.5rem;">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <path d="M9 9h6v6H9z"></path>
                    </svg>
                    Open in About:Blank
                </button>
            </div>
            <div class="framework-info" style="text-align: center; margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                <span class="framework-badge" style="background: rgba(0, 212, 255, 0.2); padding: 0.25rem 0.75rem; border-radius: 12px; border: 1px solid var(--neon-blue);">
                    ${game.framework ? game.framework.name : 'HTML5'} Game
                </span>
            </div>
            <div id="game-controls" style="display: none;">
                <button class="game-nav-btn" id="game-back-btn" title="Back">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 18px; height: 18px;">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                </button>
                <button class="game-nav-btn" id="game-reload-btn" title="Reload">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 18px; height: 18px;">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 3v5h5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M21 21v-5h-5"/>
                    </svg>
                </button>
                <button class="game-nav-btn" id="game-forward-btn" title="Forward">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width: 18px; height: 18px;">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </button>
            </div>
            <div id="game-container" class="game-container" style="display: none; width: 100%; height: 600px; margin-top: 2rem; border-radius: var(--border-radius); overflow: hidden; background: #000; position: relative;"></div>
            <iframe id="game-iframe" class="game-iframe" src="" allowfullscreen style="display: none;"></iframe>
        </div>

        <div class="controls-section">
            <h2 class="section-title">Controls</h2>
            <ul class="controls-list">
                <li><strong>Mouse:</strong> Click to interact with game elements</li>
                <li><strong>Keyboard:</strong> Use arrow keys or WASD for movement</li>
                <li><strong>Space:</strong> Jump or perform actions</li>
                <li><strong>ESC:</strong> Pause or exit fullscreen</li>
            </ul>
        </div>

        <div class="tutorial-section">
            <h2 class="section-title">How to Play</h2>
            <ul class="tutorial-list">
                <li>Click the "Play Now" button above to start the game</li>
                <li>Use your mouse and keyboard to control the game</li>
                <li>Follow the on-screen instructions for specific controls</li>
                <li>Have fun and challenge yourself to beat your high score!</li>
            </ul>
        </div>

        <div class="recommended-section">
            <h2 class="recommended-title">Recommended Games</h2>
            <div class="recommended-grid" id="recommended-grid">
                <!-- Recommended games will be loaded here -->
            </div>
        </div>
    `;

    // Setup play button
    const playBtn = document.getElementById('play-btn');
    const openNewTabBtn = document.getElementById('open-new-tab-btn');
    const openAboutBlankBtn = document.getElementById('open-about-blank-btn');
    const gameContainer = document.getElementById('game-container');
    const gameIframe = document.getElementById('game-iframe');
    
    // Check if show open button is enabled
    const showOpenBtn = localStorage.getItem('showOpenBtn') !== 'false';
    if (showOpenBtn && openNewTabBtn) {
        openNewTabBtn.style.display = 'inline-flex';
    }
    if (showOpenBtn && openAboutBlankBtn) {
        openAboutBlankBtn.style.display = 'inline-flex';
    }
    
    if (playBtn) {
        playBtn.addEventListener('click', async () => {
            const openMethod = localStorage.getItem('openMethod') || 'embed';
            
            if (openMethod === 'newtab') {
                window.open(game.path, '_blank');
                return;
            } else if (openMethod === 'aboutblank') {
                const newWindow = window.open('about:blank', '_blank');
                if (newWindow) {
                    newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>${game.name} - Lumio</title>
                            <style>
                                body { margin: 0; padding: 0; overflow: hidden; }
                                iframe { width: 100vw; height: 100vh; border: none; }
                            </style>
                        </head>
                        <body>
                            <iframe src="${game.path}" allowfullscreen></iframe>
                        </body>
                        </html>
                    `);
                    newWindow.document.close();
                }
                return;
            }
            
            // Default: embed in page
            playBtn.style.display = 'none';
            if (openNewTabBtn) openNewTabBtn.style.display = 'none';
            if (openAboutBlankBtn) openAboutBlankBtn.style.display = 'none';
            
            // Show game controls
            const gameControls = document.getElementById('game-controls');
            if (gameControls) gameControls.style.display = 'flex';
            
            // Load game based on framework
            await loadGameByFramework(game, gameContainer, gameIframe);
        });
    }
    
    // Setup game navigation buttons
    const gameBackBtn = document.getElementById('game-back-btn');
    const gameReloadBtn = document.getElementById('game-reload-btn');
    const gameForwardBtn = document.getElementById('game-forward-btn');
    const gameControls = document.getElementById('game-controls');
    
    if (gameBackBtn && gameIframe) {
        gameBackBtn.addEventListener('click', () => {
            try {
                gameIframe.contentWindow.history.back();
            } catch (e) {
                console.log('Cannot navigate back (cross-origin):', e);
            }
        });
    }
    
    if (gameReloadBtn && gameIframe) {
        gameReloadBtn.addEventListener('click', () => {
            if (gameIframe.src) {
                gameIframe.src = gameIframe.src;
            }
        });
    }
    
    if (gameForwardBtn && gameIframe) {
        gameForwardBtn.addEventListener('click', () => {
            try {
                gameIframe.contentWindow.history.forward();
            } catch (e) {
                console.log('Cannot navigate forward (cross-origin):', e);
            }
        });
    }
    
    if (openNewTabBtn) {
        openNewTabBtn.addEventListener('click', () => {
            window.open(game.path, '_blank');
        });
    }
    
    if (openAboutBlankBtn) {
        openAboutBlankBtn.addEventListener('click', () => {
            // Open game in about:blank using a new window
            const newWindow = window.open('about:blank', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${game.name} - Lumio</title>
                        <style>
                            body { margin: 0; padding: 0; overflow: hidden; }
                            iframe { width: 100vw; height: 100vh; border: none; }
                        </style>
                    </head>
                    <body>
                        <iframe src="${game.path}" allowfullscreen></iframe>
                    </body>
                    </html>
                `);
                newWindow.document.close();
            }
        });
    }

    // Load recommended games
    loadRecommendedGames(game);
}

async function loadRecommendedGames(currentGame) {
    const grid = document.getElementById('recommended-grid');
    if (!grid) return;

    const gameManager = new GameDataManager();
    await gameManager.discoverGames();
    
    // Get games from same category, excluding current game
    let recommended = gameManager.getGamesByCategory(currentGame.category)
        .filter(g => g.id !== currentGame.id)
        .slice(0, 6);
    
    // If not enough games in same category, add random games
    if (recommended.length < 6) {
        const allGames = gameManager.games.filter(g => g.id !== currentGame.id);
        const randomGames = allGames.sort(() => 0.5 - Math.random()).slice(0, 6 - recommended.length);
        recommended = [...recommended, ...randomGames];
    }

    recommended.forEach(game => {
        const frame = createRecommendedFrame(game);
        grid.appendChild(frame);
    });
}

function createRecommendedFrame(game) {
    const frame = document.createElement('div');
    frame.className = 'game-frame';
    frame.dataset.gameId = game.id;

    const thumbnail = document.createElement('img');
    thumbnail.className = 'game-thumbnail';
    thumbnail.src = game.thumbnail;
    thumbnail.alt = game.name;
    thumbnail.loading = 'lazy';
    
    thumbnail.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23141b3d" width="200" height="200"/%3E%3Ctext fill="%2300d4ff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + encodeURIComponent(game.name) + '%3C/text%3E%3C/svg%3E';
    };

    const overlay = document.createElement('div');
    overlay.className = 'game-overlay';
    
    const title = document.createElement('div');
    title.className = 'game-title';
    title.textContent = game.name;
    
    overlay.appendChild(title);
    frame.appendChild(thumbnail);
    frame.appendChild(overlay);

    frame.addEventListener('click', () => {
        sessionStorage.setItem('currentGame', JSON.stringify(game));
        window.location.href = `game.html?id=${game.id}`;
    });

    return frame;
}

async function loadGameByFramework(game, container, iframe) {
    const framework = game.framework || { id: 'html5', name: 'HTML5', loader: 'html5' };
    
    try {
        // Show loading indicator
        container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--neon-blue); font-family: Orbitron, sans-serif;"><div style="text-align: center;"><div class="loading-spinner" style="width: 50px; height: 50px; border: 3px solid rgba(0, 212, 255, 0.3); border-top-color: var(--neon-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div><div>Loading ' + (framework.name || "Game") + '...</div></div></div>';
        container.style.display = 'block';
        
        // Add spinner animation
        if (!document.getElementById('spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
        
        // Get the game path - ensure it's correct
        let gamePath = game.path || (game.folder ? game.folder + '/index.html' : '');
        
        if (!gamePath) {
            throw new Error('Game path not found');
        }
        
        // Ensure path doesn't start with / to make it relative
        if (gamePath.startsWith('/')) {
            gamePath = gamePath.substring(1);
        }
        
        console.log('Loading game from path:', gamePath);
        
        // Load based on framework - all games use iframe for simplicity
        // Remove sandbox to allow games to load properly
        iframe.src = gamePath;
        iframe.style.display = 'block';
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('allow', 'fullscreen; autoplay; gamepad; microphone; camera; payment; encrypted-media; xr-spatial-tracking');
        // Don't use sandbox - it prevents many games from working
        // Games need full access to work properly
        container.style.display = 'none';
        
        let loadTimeout;
        let hasLoaded = false;
        
        // Handle iframe load success
        iframe.onload = function() {
            hasLoaded = true;
            if (loadTimeout) clearTimeout(loadTimeout);
            container.style.display = 'none';
            console.log('Game loaded successfully');
        };
        
        // Handle iframe load errors
        iframe.onerror = function() {
            hasLoaded = false;
            if (loadTimeout) clearTimeout(loadTimeout);
            container.style.display = 'block';
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff4444; text-align: center; padding: 2rem;">
                    <div>
                        <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                        <div style="font-family: Orbitron, sans-serif; margin-bottom: 0.5rem;">Failed to load game</div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Path: ${gamePath}</div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary);">The game file could not be found or loaded. Check the browser console for details.</div>
                        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: var(--neon-blue); border: none; border-radius: 8px; color: white; cursor: pointer; font-family: Orbitron, sans-serif;">Retry</button>
                    </div>
                </div>
            `;
        };
        
        // Timeout fallback - show error if game doesn't load in 10 seconds
        loadTimeout = setTimeout(() => {
            if (!hasLoaded && container.style.display !== 'none') {
                // Check if iframe actually loaded (might be cross-origin issue)
                try {
                    if (iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.readyState === 'complete') {
                        container.style.display = 'none';
                        hasLoaded = true;
                        return;
                    }
                } catch (e) {
                    // Cross-origin - can't check, but assume it might be loading
                    console.log('Cross-origin iframe, assuming game is loading...');
                }
                
                // If still showing loading after timeout, might be an issue
                console.warn('Game loading timeout - check if game file exists at:', gamePath);
            }
        }, 10000);
        
    } catch (error) {
        console.error('Error loading game:', error);
        container.style.display = 'block';
        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff4444; text-align: center; padding: 2rem;">
                <div>
                    <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                    <div style="font-family: Orbitron, sans-serif; margin-bottom: 0.5rem;">Failed to load game</div>
                    <div style="font-size: 0.9rem; color: var(--text-secondary);">${error.message || 'Unknown error occurred'}</div>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: var(--neon-blue); border: none; border-radius: 8px; color: white; cursor: pointer; font-family: Orbitron, sans-serif;">Retry</button>
                </div>
            </div>
        `;
    }
}

function setupGamePageListeners() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Clean up game instance if needed
            if (currentGameInstance && currentGameInstance.Quit) {
                try {
                    currentGameInstance.Quit();
                } catch (e) {
                    console.log('Game cleanup:', e);
                }
            }
            window.location.href = 'index.html';
        });
    }
    
    // Setup navigation buttons for game page
    setupGamePageNavigationButtons();
    
    // Setup incognito search for game page
    setupIncognitoSearch();
}

function setupIncognitoSearch() {
    const incognitoSearchInput = document.getElementById('incognito-search-input');
    const incognitoSearchBtn = document.getElementById('incognito-search-btn');

    if (incognitoSearchInput && incognitoSearchBtn) {
        const performIncognitoSearch = (query) => {
            if (!query.trim()) return;
            
            // Open search in incognito using about:blank trick
            const newWindow = window.open('about:blank', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Search: ${query}</title>
                        <meta http-equiv="refresh" content="0;url=https://www.google.com/search?q=${encodeURIComponent(query)}">
                    </head>
                    <body>
                        <p>Redirecting to search...</p>
                    </body>
                    </html>
                `);
                newWindow.document.close();
            }
        };
        
        incognitoSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performIncognitoSearch(incognitoSearchInput.value);
                incognitoSearchInput.value = '';
            }
        });
        
        incognitoSearchBtn.addEventListener('click', () => {
            performIncognitoSearch(incognitoSearchInput.value);
            incognitoSearchInput.value = '';
        });
    }
}

function setupGamePageNavigationButtons() {
    const backBtn = document.getElementById('nav-back-btn');
    const forwardBtn = document.getElementById('nav-forward-btn');
    const reloadBtn = document.getElementById('nav-reload-btn');
    
    // Initialize history tracking
    if (!window.historyState) {
        window.historyState = {
            canGoBack: false,
            canGoForward: false
        };
    }
    
    function updateButtonStates() {
        // Better detection for back button
        if (backBtn) {
            const nav = performance.getEntriesByType('navigation')[0];
            const isFirstLoad = nav && nav.type === 'navigate';
            
            const canGoBack = window.history.length > 1 && !isFirstLoad;
            backBtn.disabled = !canGoBack;
        }
        
        if (forwardBtn) {
            forwardBtn.disabled = !window.historyState.canGoForward;
        }
    }
    
    // Initial state
    updateButtonStates();
    
    // Track navigation
    window.addEventListener('popstate', () => {
        window.historyState.canGoForward = true;
        window.historyState.canGoBack = window.history.length > 1;
        updateButtonStates();
    });
    
    // Override pushState
    const originalPushState = history.pushState;
    history.pushState = function() {
        originalPushState.apply(history, arguments);
        window.historyState.canGoBack = true;
        window.historyState.canGoForward = false;
        updateButtonStates();
    };
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (!backBtn.disabled) {
                window.historyState.canGoForward = true;
                window.history.back();
            }
        });
    }
    
    if (forwardBtn) {
        forwardBtn.addEventListener('click', () => {
            if (!forwardBtn.disabled) {
                window.historyState.canGoForward = false;
                window.history.forward();
            }
        });
    }
    
    if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }
    
    // Update on visibility change
    document.addEventListener('visibilitychange', updateButtonStates);
    
    // Update periodically
    setInterval(updateButtonStates, 500);
}

