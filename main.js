// Main Application Logic
const gameManager = new GameDataManager();
const frameworkFilter = new FrameworkFilter();
let currentPage = 'home';
let displayedGames = 0;
const gamesPerPage = 50;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
    setupEventListeners();
    loadSettings();
});

async function initializeApp() {
    // Show loading screen
    const loadingScreen = document.getElementById('loading-screen');
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Discover games
    await gameManager.discoverGames();
    
    // Hide loading screen
    loadingScreen.classList.add('hidden');
    
    // Setup framework filter
    const filterContainer = document.getElementById('framework-filter-container');
    if (filterContainer) {
        frameworkFilter.createFilterUI(filterContainer);
        window.addEventListener('frameworkFilterChanged', () => {
            loadGames();
        });
    }
    
    // Load initial games
    loadGames();
    loadCategories();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            switchPage(page);
        });
    });

    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Incognito search
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

    // Settings
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsClose = document.getElementById('settings-close');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('active');
        });
    }
    
    if (settingsClose) {
        settingsClose.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });
    }
    
    settingsModal?.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });

    // Profile dropdown
    const profileBtn = document.getElementById('profile-btn');
    const profileMenu = document.getElementById('profile-menu');
    
    if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', () => {
            profileMenu.classList.remove('active');
        });
    }

    // Settings toggles
    const soundEffects = document.getElementById('sound-effects');
    const bgMusic = document.getElementById('bg-music');
    const musicVolume = document.getElementById('music-volume');
    const musicVolumeValue = document.getElementById('music-volume-value');
    const noClose = document.getElementById('no-close');
    const bgAnimation = document.getElementById('bg-animation');
    const bgPattern = document.getElementById('bg-pattern');
    const bgColor = document.getElementById('bg-color');
    const bgColorText = document.getElementById('bg-color-text');
    const accentColor = document.getElementById('accent-color');
    const accentColorText = document.getElementById('accent-color-text');
    const animationSpeed = document.getElementById('animation-speed');
    const speedValue = document.getElementById('speed-value');
    const themeSelect = document.getElementById('theme-select');
    const languageSelect = document.getElementById('language-select');
    const openMethod = document.getElementById('open-method');
    const showOpenBtn = document.getElementById('show-open-btn');
    
    if (soundEffects) {
        soundEffects.addEventListener('change', (e) => {
            localStorage.setItem('soundEffects', e.target.checked);
        });
    }
    
    if (bgAnimation) {
        bgAnimation.addEventListener('change', (e) => {
            localStorage.setItem('bgAnimation', e.target.checked);
            window.dispatchEvent(new CustomEvent('bgAnimationToggle', {
                detail: { enabled: e.target.checked }
            }));
        });
    }
    
    if (bgPattern) {
        bgPattern.addEventListener('change', (e) => {
            localStorage.setItem('bgPattern', e.target.value);
            window.dispatchEvent(new CustomEvent('bgPatternChanged', {
                detail: { pattern: e.target.value }
            }));
        });
    }
    
    if (bgColor && bgColorText) {
        bgColor.addEventListener('input', (e) => {
            const color = e.target.value;
            bgColorText.value = color;
            localStorage.setItem('bgColor', color);
            document.documentElement.style.setProperty('--bg-primary', color);
            window.dispatchEvent(new CustomEvent('bgColorChanged', {
                detail: { color: color }
            }));
        });
        
        bgColorText.addEventListener('input', (e) => {
            const color = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                bgColor.value = color;
                localStorage.setItem('bgColor', color);
                document.documentElement.style.setProperty('--bg-primary', color);
            }
        });
    }
    
    if (accentColor && accentColorText) {
        accentColor.addEventListener('input', (e) => {
            const color = e.target.value;
            accentColorText.value = color;
            localStorage.setItem('accentColor', color);
            document.documentElement.style.setProperty('--neon-blue', color);
            window.dispatchEvent(new CustomEvent('accentColorChanged', {
                detail: { color: color }
            }));
        });
        
        accentColorText.addEventListener('input', (e) => {
            const color = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                accentColor.value = color;
                localStorage.setItem('accentColor', color);
                document.documentElement.style.setProperty('--neon-blue', color);
            }
        });
    }
    
    if (animationSpeed && speedValue) {
        animationSpeed.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            speedValue.textContent = speed.toFixed(1) + 'x';
            localStorage.setItem('animationSpeed', speed);
            window.dispatchEvent(new CustomEvent('animationSpeedChanged', {
                detail: { speed: speed }
            }));
        });
    }
    
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            document.documentElement.setAttribute('data-theme', e.target.value);
            localStorage.setItem('theme', e.target.value);
        });
    }
    
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            localStorage.setItem('language', e.target.value);
        });
    }
    
    if (openMethod) {
        openMethod.addEventListener('change', (e) => {
            localStorage.setItem('openMethod', e.target.value);
        });
    }
    
    if (showOpenBtn) {
        showOpenBtn.addEventListener('change', (e) => {
            localStorage.setItem('showOpenBtn', e.target.checked);
        });
    }
    
    if (bgMusic) {
        bgMusic.addEventListener('change', (e) => {
            localStorage.setItem('bgMusic', e.target.checked);
            window.dispatchEvent(new CustomEvent('bgMusicToggle', {
                detail: { enabled: e.target.checked }
            }));
        });
    }
    
    if (musicVolume && musicVolumeValue) {
        musicVolume.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            musicVolumeValue.textContent = volume + '%';
            localStorage.setItem('musicVolume', volume);
            window.dispatchEvent(new CustomEvent('musicVolumeChanged', {
                detail: { volume: volume }
            }));
        });
    }
    
    if (noClose) {
        noClose.addEventListener('change', (e) => {
            localStorage.setItem('noClose', e.target.checked);
            setupNoClose(e.target.checked);
        });
    }

    // Load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreGames);
    }

    // Logo click
    const logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', () => {
            switchPage('home');
        });
    }

    // Navigation history buttons
    setupNavigationButtons();
}

function setupNavigationButtons() {
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
            
            // Can go back if history length > 1 AND not first load
            const canGoBack = window.history.length > 1 && !isFirstLoad;
            backBtn.disabled = !canGoBack;
        }
        
        // Forward button state
        if (forwardBtn) {
            forwardBtn.disabled = !window.historyState.canGoForward;
        }
    }
    
    // Initial state
    updateButtonStates();
    
    // Track navigation events
    window.addEventListener('popstate', (e) => {
        // When going back, we can go forward
        window.historyState.canGoForward = true;
        window.historyState.canGoBack = window.history.length > 1;
        updateButtonStates();
    });
    
    // Override pushState to track forward state
    const originalPushState = history.pushState;
    history.pushState = function() {
        originalPushState.apply(history, arguments);
        window.historyState.canGoBack = true;
        window.historyState.canGoForward = false;
        updateButtonStates();
    };
    
    // Override replaceState
    const originalReplaceState = history.replaceState;
    history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
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
    
    // Update on page visibility change
    document.addEventListener('visibilitychange', updateButtonStates);
    
    // Update periodically to catch state changes
    setInterval(updateButtonStates, 500);
}

// No-Close Feature - Prevents accidental tab closing
function setupNoClose(enabled) {
    if (!enabled) {
        // Remove event listener if disabled
        window.removeEventListener('beforeunload', preventClose);
        return;
    }
    
    // Add event listener to prevent closing
    window.addEventListener('beforeunload', preventClose);
}

function preventClose(e) {
    // Modern browsers require returnValue to be set
    e.preventDefault();
    e.returnValue = 'Are you sure you want to leave? Your progress may be lost.';
    return e.returnValue;
}

function switchPage(page) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    // Hide all pages
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected page
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
        currentPage = page;

        // Load page-specific content
        switch(page) {
            case 'home':
                loadGames();
                break;
            case 'categories':
                loadCategories();
                break;
            case 'new':
                loadNewGames();
                break;
            case 'trending':
                loadTrendingGames();
                break;
            case 'favorites':
                loadFavorites();
                break;
        }
    }
}

function loadGames(filteredGames = null) {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    let games = filteredGames || gameManager.games;
    
    // Apply framework filter
    games = frameworkFilter.filterGames(games);
    
    displayedGames = 0;
    grid.innerHTML = '';
    
    displayGames(games.slice(0, gamesPerPage));
    displayedGames = Math.min(gamesPerPage, games.length);

    // Show/hide load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = displayedGames < games.length ? 'block' : 'none';
    }
}

function loadMoreGames() {
    const games = gameManager.games;
    const grid = document.getElementById('games-grid');
    
    const nextBatch = games.slice(displayedGames, displayedGames + gamesPerPage);
    displayGames(nextBatch, displayedGames);
    displayedGames += nextBatch.length;

    // Hide load more if all games shown
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = displayedGames < games.length ? 'block' : 'none';
    }
}

function displayGames(games, startIndex = 0) {
    // Find the appropriate grid based on current page
    let grid = document.getElementById('games-grid');
    if (currentPage === 'new') {
        grid = document.getElementById('new-games-grid');
    } else if (currentPage === 'trending') {
        grid = document.getElementById('trending-games-grid');
    } else if (currentPage === 'favorites') {
        grid = document.getElementById('favorites-grid');
    }
    
    if (!grid) return;

    games.forEach((game, index) => {
        const frame = createGameFrame(game, startIndex + index);
        grid.appendChild(frame);
    });
}

function createGameFrame(game, index) {
    const frame = document.createElement('div');
    frame.className = 'game-frame';
    frame.style.animationDelay = `${index * 0.02}s`;
    frame.dataset.gameId = game.id;
    frame.dataset.gamePath = game.path;

    const thumbnail = document.createElement('img');
    thumbnail.className = 'game-thumbnail';
    thumbnail.src = game.thumbnail;
    thumbnail.alt = game.name;
    thumbnail.loading = 'lazy';
    
    // Handle image load error
    thumbnail.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23141b3d" width="200" height="200"/%3E%3Ctext fill="%2300d4ff" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + encodeURIComponent(game.name) + '%3C/text%3E%3C/svg%3E';
    };
    
    thumbnail.onload = function() {
        frame.classList.add('loaded');
    };

    const overlay = document.createElement('div');
    overlay.className = 'game-overlay';
    
    const title = document.createElement('div');
    title.className = 'game-title';
    title.textContent = game.name;
    
    const category = document.createElement('div');
    category.className = 'game-category';
    category.textContent = game.category;
    
    // Add favorite button
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'favorite-btn';
    favoriteBtn.innerHTML = gameManager.isFavorite(game.id) ? '❤️' : '🤍';
    favoriteBtn.style.cssText = 'position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0, 0, 0, 0.6); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 1.2rem; z-index: 10; transition: all 0.2s;';
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isFavorite = gameManager.toggleFavorite(game.id);
        favoriteBtn.innerHTML = isFavorite ? '❤️' : '🤍';
    });

    overlay.appendChild(title);
    overlay.appendChild(category);
    frame.appendChild(thumbnail);
    frame.appendChild(overlay);
    frame.appendChild(favoriteBtn);

    frame.addEventListener('click', () => {
        openGamePage(game);
    });

    return frame;
}

function openGamePage(game) {
    // Store game data for game page
    sessionStorage.setItem('currentGame', JSON.stringify(game));
    
    // Navigate to game page
    window.location.href = `game.html?id=${game.id}`;
}

function handleSearch(e) {
    const query = e.target.value.trim();
    if (query.length === 0) {
        loadGames();
        return;
    }

    const results = gameManager.searchGames(query);
    loadGames(results);
}

function loadCategories() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    const categoryIcons = {
        'Action': '⚡',
        'Puzzle': '🧩',
        'Casual': '🎮',
        'Racing': '🏎️',
        'Sports': '⚽',
        'Adventure': '🗺️',
        'Strategy': '🎯',
        'Arcade': '🎰',
        'Shooter': '🔫',
        'Platformer': '🏃'
    };

    Object.keys(gameManager.categories).forEach(category => {
        const count = gameManager.categories[category].length;
        if (count === 0) return;

        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-icon">${categoryIcons[category] || '🎮'}</div>
            <div class="category-name">${category}</div>
            <div class="category-count">${count} games</div>
        `;

        card.addEventListener('click', () => {
            filterByCategory(category);
        });

        grid.appendChild(card);
    });
}

function filterByCategory(category) {
    const games = gameManager.getGamesByCategory(category);
    switchPage('home');
    setTimeout(() => {
        loadGames(games);
    }, 100);
}

function loadNewGames() {
    const games = gameManager.getNewGames();
    const grid = document.getElementById('new-games-grid');
    if (!grid) return;

    grid.innerHTML = '';
    games.forEach((game, index) => {
        const frame = createGameFrame(game, index);
        grid.appendChild(frame);
    });
}

function loadTrendingGames() {
    const games = gameManager.getTrendingGames();
    const grid = document.getElementById('trending-games-grid');
    if (!grid) return;

    grid.innerHTML = '';
    games.forEach((game, index) => {
        const frame = createGameFrame(game, index);
        grid.appendChild(frame);
    });
}

function loadFavorites() {
    const games = gameManager.getFavoriteGames();
    const grid = document.getElementById('favorites-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    if (games.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1; padding: 2rem;">No favorites yet. Start adding games to your favorites!</p>';
    } else {
        games.forEach((game, index) => {
            const frame = createGameFrame(game, index);
            grid.appendChild(frame);
        });
    }
}

function loadSettings() {
    // Load saved settings
    const soundEffects = localStorage.getItem('soundEffects') === 'true';
    const bgMusic = localStorage.getItem('bgMusic') === 'true';
    const musicVolume = parseInt(localStorage.getItem('musicVolume')) || 30;
    const noClose = localStorage.getItem('noClose') === 'true';
    const bgAnimation = localStorage.getItem('bgAnimation') !== 'false';
    const bgPattern = localStorage.getItem('bgPattern') || 'particles';
    const bgColor = localStorage.getItem('bgColor') || '#0a0e27';
    const accentColor = localStorage.getItem('accentColor') || '#00d4ff';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed')) || 1.0;
    const theme = localStorage.getItem('theme') || 'dark';
    const language = localStorage.getItem('language') || 'en';
    const openMethod = localStorage.getItem('openMethod') || 'embed';
    const showOpenBtn = localStorage.getItem('showOpenBtn') !== 'false';

    const soundEffectsToggle = document.getElementById('sound-effects');
    const bgMusicToggle = document.getElementById('bg-music');
    const musicVolumeSlider = document.getElementById('music-volume');
    const musicVolumeValueDisplay = document.getElementById('music-volume-value');
    const noCloseToggle = document.getElementById('no-close');
    const bgAnimationToggle = document.getElementById('bg-animation');
    const bgPatternSelect = document.getElementById('bg-pattern');
    const bgColorPicker = document.getElementById('bg-color');
    const bgColorTextInput = document.getElementById('bg-color-text');
    const accentColorPicker = document.getElementById('accent-color');
    const accentColorTextInput = document.getElementById('accent-color-text');
    const animationSpeedSlider = document.getElementById('animation-speed');
    const speedValueDisplay = document.getElementById('speed-value');
    const themeSelect = document.getElementById('theme-select');
    const languageSelect = document.getElementById('language-select');
    const openMethodSelect = document.getElementById('open-method');
    const showOpenBtnToggle = document.getElementById('show-open-btn');

    if (soundEffectsToggle) soundEffectsToggle.checked = soundEffects;
    if (bgMusicToggle) bgMusicToggle.checked = bgMusic;
    if (musicVolumeSlider) musicVolumeSlider.value = musicVolume;
    if (musicVolumeValueDisplay) musicVolumeValueDisplay.textContent = musicVolume + '%';
    if (noCloseToggle) noCloseToggle.checked = noClose;
    if (bgAnimationToggle) bgAnimationToggle.checked = bgAnimation;
    if (bgPatternSelect) bgPatternSelect.value = bgPattern;
    if (bgColorPicker) bgColorPicker.value = bgColor;
    if (bgColorTextInput) bgColorTextInput.value = bgColor;
    if (accentColorPicker) accentColorPicker.value = accentColor;
    if (accentColorTextInput) accentColorTextInput.value = accentColor;
    if (animationSpeedSlider) animationSpeedSlider.value = animationSpeed;
    if (speedValueDisplay) speedValueDisplay.textContent = animationSpeed.toFixed(1) + 'x';
    if (themeSelect) themeSelect.value = theme;
    if (languageSelect) languageSelect.value = language;
    if (openMethodSelect) openMethodSelect.value = openMethod;
    if (showOpenBtnToggle) showOpenBtnToggle.checked = showOpenBtn;
    
    // Setup no-close feature
    setupNoClose(noClose);

    // Apply settings
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--bg-primary', bgColor);
    document.documentElement.style.setProperty('--neon-blue', accentColor);
    
    // Dispatch events to update background
    window.dispatchEvent(new CustomEvent('bgPatternChanged', {
        detail: { pattern: bgPattern }
    }));
    window.dispatchEvent(new CustomEvent('animationSpeedChanged', {
        detail: { speed: animationSpeed }
    }));
}

