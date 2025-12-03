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
    setupAmbientSoundSettings();
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

// Setup ambient sound settings handlers
function setupAmbientSoundSettings() {
    const ambientSoundscape = document.getElementById('ambient-soundscape');
    const ambientVolume = document.getElementById('ambient-volume');
    const ambientVolumeValue = document.getElementById('ambient-volume-value');
    const ambientBtn = document.getElementById('ambient-btn');

    // Load saved settings
    if (ambientSoundscape) {
        const savedSoundscape = localStorage.getItem('ambientSoundscape') || 'none';
        ambientSoundscape.value = savedSoundscape;

        ambientSoundscape.addEventListener('change', (e) => {
            const soundscape = e.target.value;
            if (window.ambientSound) {
                if (soundscape === 'none') {
                    window.ambientSound.disable();
                    if (ambientBtn) ambientBtn.classList.remove('active');
                } else {
                    window.ambientSound.play(soundscape);
                    if (ambientBtn) ambientBtn.classList.add('active');
                }
            }
        });
    }

    if (ambientVolume && ambientVolumeValue) {
        const savedVolume = parseFloat(localStorage.getItem('ambientVolume') || '0.3');
        ambientVolume.value = savedVolume;
        ambientVolumeValue.textContent = Math.round(savedVolume * 100) + '%';

        ambientVolume.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            ambientVolumeValue.textContent = Math.round(volume * 100) + '%';
            if (window.ambientSound) {
                window.ambientSound.setVolume(volume);
            }
        });
    }

    // Setup ambient button toggle
    if (ambientBtn) {
        // Set initial state
        const enabled = localStorage.getItem('ambientEnabled') === 'true';
        const savedSoundscape = localStorage.getItem('ambientSoundscape');
        if (enabled && savedSoundscape && savedSoundscape !== 'none') {
            ambientBtn.classList.add('active');
        }

        ambientBtn.addEventListener('click', () => {
            if (window.ambientSound) {
                const isPlaying = window.ambientSound.toggle();
                ambientBtn.classList.toggle('active', isPlaying);

                // Update select if present
                if (ambientSoundscape) {
                    if (isPlaying) {
                        const currentSoundscape = window.ambientSound.currentSoundscape || 'lofi';
                        ambientSoundscape.value = currentSoundscape;
                    } else {
                        ambientSoundscape.value = 'none';
                    }
                }
            }
        });
    }
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

    overlay.appendChild(title);
    overlay.appendChild(category);
    frame.appendChild(thumbnail);
    frame.appendChild(overlay);

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

