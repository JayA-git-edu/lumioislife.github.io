// Background Music System
class BackgroundMusic {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.volume = 0.3; // Default 30%
        this.musicEnabled = false;
        this.init();
    }

    init() {
        // Create audio element with meditation/relaxation sound
        // Using a free meditation sound URL - you can replace this with your own
        this.audio = new Audio();
        
        // Use a free meditation/relaxation sound
        // You can replace this with your own meditation sound file
        // Options:
        // 1. Use a local file: this.audio.src = 'meditation.mp3';
        // 2. Use a CDN URL with a free meditation sound
        // 3. Use Web Audio API to generate a calming tone (fallback)
        
        // Try to load from a free source, or use fallback
        // Note: Replace this URL with your own meditation sound file
        // You can download free meditation sounds from:
        // - freesound.org
        // - pixabay.com
        // - zapsplat.com
        this.audio.src = ''; // Empty by default - will use fallback
        
        this.audio.loop = true;
        this.audio.volume = this.volume;
        this.audio.preload = 'auto';
        
        // Load saved settings
        this.loadSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // If no audio source, use fallback immediately
        if (!this.audio.src) {
            this.createFallbackMusic();
        }
    }

    loadSettings() {
        const savedMusicEnabled = localStorage.getItem('bgMusic') === 'true';
        const savedVolume = parseFloat(localStorage.getItem('musicVolume')) || 30;
        
        this.musicEnabled = savedMusicEnabled;
        this.volume = savedVolume / 100;
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        
        if (this.musicEnabled) {
            // Small delay to ensure audio context is ready
            setTimeout(() => {
                if (this.audio && this.audio.src) {
                    this.play();
                } else if (this.fallbackOscillators) {
                    this.fallbackOscillators.forEach(({ oscillator }) => {
                        try {
                            oscillator.start();
                        } catch (e) {
                            // Already started
                        }
                    });
                }
            }, 100);
        }
    }

    setupEventListeners() {
        // Listen for settings changes
        window.addEventListener('bgMusicToggle', (e) => {
            this.musicEnabled = e.detail.enabled;
            if (this.musicEnabled) {
                this.play();
            } else {
                this.pause();
            }
        });
        
        window.addEventListener('musicVolumeChanged', (e) => {
            this.volume = e.detail.volume / 100;
            this.audio.volume = this.volume;
        });
        
        // Handle audio errors
        this.audio.addEventListener('error', (e) => {
            console.warn('Background music failed to load. Using fallback.');
            // Fallback: create a simple tone generator
            this.createFallbackMusic();
        });
        
        // Auto-play when user interacts (required by browsers)
        document.addEventListener('click', () => {
            if (this.musicEnabled && this.audio.paused) {
                this.audio.play().catch(e => console.log('Auto-play prevented:', e));
            }
        }, { once: true });
    }

    play() {
        // If we have fallback music, use it
        if (this.fallbackOscillators) {
            if (!this.fallbackStarted) {
                this.fallbackOscillators.forEach(({ oscillator }) => {
                    try {
                        oscillator.start();
                        this.fallbackStarted = true;
                        this.isPlaying = true;
                    } catch (e) {
                        // Already started or failed
                    }
                });
            } else {
                this.isPlaying = true;
            }
            return;
        }
        
        // Otherwise try to play audio file
        if (this.audio && this.audio.src) {
            this.audio.play().then(() => {
                this.isPlaying = true;
            }).catch(e => {
                console.log('Music play failed:', e);
                // Try fallback if audio file fails
                if (!this.fallbackOscillators) {
                    this.createFallbackMusic();
                }
            });
        } else if (!this.fallbackOscillators) {
            // No audio source and no fallback, create fallback
            this.createFallbackMusic();
        }
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
            this.isPlaying = false;
        }
        this.stopFallback();
    }

    setVolume(volume) {
        this.volume = volume / 100;
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        // Update fallback volume if active
        if (this.fallbackOscillators) {
            this.fallbackOscillators.forEach(({ gainNode }, index) => {
                gainNode.gain.value = (this.volume * 0.05) / (index + 1);
            });
        }
    }

    createFallbackMusic() {
        // Create a simple meditation tone using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create multiple oscillators for a richer, more calming sound
            const oscillators = [];
            const frequencies = [220, 330, 440]; // Harmonic frequencies
            
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.value = freq;
                gainNode.gain.value = (this.volume * 0.05) / (index + 1); // Quieter for higher frequencies
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillators.push({ oscillator, gainNode });
            });
            
            // Store for cleanup
            this.fallbackOscillators = oscillators;
            this.fallbackContext = audioContext;
            this.fallbackStarted = false;
            
            if (this.musicEnabled) {
                oscillators.forEach(({ oscillator }) => {
                    try {
                        oscillator.start();
                        this.fallbackStarted = true;
                    } catch (e) {
                        // Already started
                    }
                });
            }
        } catch (e) {
            console.log('Fallback music creation failed:', e);
        }
    }

    stopFallback() {
        if (this.fallbackOscillators) {
            this.fallbackOscillators.forEach(({ oscillator }) => {
                try {
                    oscillator.stop();
                } catch (e) {
                    // Already stopped
                }
            });
            this.fallbackOscillators = null;
            this.fallbackStarted = false;
        }
    }
}

// Initialize background music
let backgroundMusic = null;
document.addEventListener('DOMContentLoaded', () => {
    backgroundMusic = new BackgroundMusic();
});

window.BackgroundMusic = BackgroundMusic;

