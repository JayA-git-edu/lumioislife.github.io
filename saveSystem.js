// Save System for Lumio Gaming Platform
class SaveSystem {
    constructor() {
        this.storageKey = 'lumio_game_saves';
        this.saves = this.loadSaves();
    }

    // Load all saves from localStorage
    loadSaves() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Error loading saves:', e);
            return {};
        }
    }

    // Save all data to localStorage
    persistSaves() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.saves));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    // Get save data for a specific game
    getGameSave(gameId) {
        return this.saves[gameId] || this.createDefaultSave(gameId);
    }

    // Create default save structure for a game
    createDefaultSave(gameId) {
        return {
            gameId: gameId,
            playCount: 0,
            totalPlayTime: 0, // in seconds
            lastPlayed: null,
            firstPlayed: null,
            isFavorite: false,
            highScore: null,
            customData: {},
            settings: {
                volume: 1.0,
                muted: false
            }
        };
    }

    // Record that a game was started
    startGame(gameId) {
        if (!this.saves[gameId]) {
            this.saves[gameId] = this.createDefaultSave(gameId);
            this.saves[gameId].firstPlayed = Date.now();
        }

        const save = this.saves[gameId];
        save.playCount++;
        save.lastPlayed = Date.now();
        save._sessionStart = Date.now();

        this.persistSaves();
        return save;
    }

    // Record that a game was stopped/closed
    endGame(gameId) {
        const save = this.saves[gameId];
        if (save && save._sessionStart) {
            const sessionTime = Math.floor((Date.now() - save._sessionStart) / 1000);
            save.totalPlayTime += sessionTime;
            delete save._sessionStart;
            this.persistSaves();
        }
    }

    // Update play time for active session
    updatePlayTime(gameId) {
        const save = this.saves[gameId];
        if (save && save._sessionStart) {
            const sessionTime = Math.floor((Date.now() - save._sessionStart) / 1000);
            return save.totalPlayTime + sessionTime;
        }
        return save ? save.totalPlayTime : 0;
    }

    // Set a high score for a game
    setHighScore(gameId, score) {
        if (!this.saves[gameId]) {
            this.saves[gameId] = this.createDefaultSave(gameId);
        }

        const save = this.saves[gameId];
        if (save.highScore === null || score > save.highScore) {
            save.highScore = score;
            this.persistSaves();
            return true; // New high score!
        }
        return false;
    }

    // Save custom game data (for games that support it)
    saveCustomData(gameId, key, value) {
        if (!this.saves[gameId]) {
            this.saves[gameId] = this.createDefaultSave(gameId);
        }

        this.saves[gameId].customData[key] = value;
        this.persistSaves();
    }

    // Get custom game data
    getCustomData(gameId, key) {
        const save = this.saves[gameId];
        return save ? save.customData[key] : undefined;
    }

    // Toggle favorite status
    toggleFavorite(gameId) {
        if (!this.saves[gameId]) {
            this.saves[gameId] = this.createDefaultSave(gameId);
        }

        this.saves[gameId].isFavorite = !this.saves[gameId].isFavorite;
        this.persistSaves();
        return this.saves[gameId].isFavorite;
    }

    // Get all favorite games
    getFavorites() {
        return Object.keys(this.saves).filter(id => this.saves[id].isFavorite);
    }

    // Get recently played games (sorted by last played)
    getRecentlyPlayed(limit = 10) {
        return Object.values(this.saves)
            .filter(save => save.lastPlayed)
            .sort((a, b) => b.lastPlayed - a.lastPlayed)
            .slice(0, limit);
    }

    // Get most played games (sorted by play count)
    getMostPlayed(limit = 10) {
        return Object.values(this.saves)
            .filter(save => save.playCount > 0)
            .sort((a, b) => b.playCount - a.playCount)
            .slice(0, limit);
    }

    // Format play time for display
    formatPlayTime(seconds) {
        if (seconds < 60) {
            return `${seconds}s`;
        } else if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            return `${mins}m`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${mins}m`;
        }
    }

    // Format last played for display
    formatLastPlayed(timestamp) {
        if (!timestamp) return 'Never';

        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else if (days < 7) {
            return `${days}d ago`;
        } else {
            return new Date(timestamp).toLocaleDateString();
        }
    }

    // Get total stats across all games
    getTotalStats() {
        const saves = Object.values(this.saves);
        return {
            totalGamesPlayed: saves.filter(s => s.playCount > 0).length,
            totalPlayCount: saves.reduce((sum, s) => sum + s.playCount, 0),
            totalPlayTime: saves.reduce((sum, s) => sum + s.totalPlayTime, 0),
            totalFavorites: saves.filter(s => s.isFavorite).length
        };
    }

    // Export all save data (for backup)
    exportSaves() {
        return JSON.stringify(this.saves, null, 2);
    }

    // Import save data (for restore)
    importSaves(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.saves = { ...this.saves, ...data };
            this.persistSaves();
            return true;
        } catch (e) {
            console.error('Error importing saves:', e);
            return false;
        }
    }

    // Clear all saves
    clearAllSaves() {
        this.saves = {};
        this.persistSaves();
    }

    // Clear save for specific game
    clearGameSave(gameId) {
        delete this.saves[gameId];
        this.persistSaves();
    }
}

// Create global instance
window.saveSystem = new SaveSystem();

// Export for use in other scripts
window.SaveSystem = SaveSystem;
