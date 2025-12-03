// Ambient Sound System for Lumio Gaming Platform
class AmbientSoundSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.currentSoundscape = 'none';
        this.oscillators = [];
        this.noiseNode = null;
        this.volume = parseFloat(localStorage.getItem('ambientVolume') || '0.3');
        this.enabled = localStorage.getItem('ambientEnabled') === 'true';

        // Initialize on user interaction to comply with autoplay policies
        this.initialized = false;
        this.pendingStart = false;

        // Soundscape definitions
        this.soundscapes = {
            'lofi': {
                name: 'Lo-Fi Chill',
                description: 'Warm, relaxing lo-fi vibes',
                icon: '🎵'
            },
            'rain': {
                name: 'Gentle Rain',
                description: 'Soft rain and distant thunder',
                icon: '🌧️'
            },
            'space': {
                name: 'Deep Space',
                description: 'Cosmic ambient drone',
                icon: '🌌'
            },
            'nature': {
                name: 'Forest Calm',
                description: 'Birds and gentle breeze',
                icon: '🌲'
            },
            'ocean': {
                name: 'Ocean Waves',
                description: 'Peaceful ocean sounds',
                icon: '🌊'
            },
            'none': {
                name: 'No Sound',
                description: 'Silence',
                icon: '🔇'
            }
        };
    }

    // Initialize audio context (must be called from user interaction)
    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
            this.initialized = true;

            // If there was a pending start, start now
            if (this.pendingStart) {
                this.pendingStart = false;
                const savedSoundscape = localStorage.getItem('ambientSoundscape') || 'lofi';
                if (this.enabled && savedSoundscape !== 'none') {
                    this.play(savedSoundscape);
                }
            }
        } catch (e) {
            console.error('Failed to initialize audio context:', e);
        }
    }

    // Create pink noise (softer than white noise)
    createPinkNoise() {
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        return noise;
    }

    // Create brown noise (even softer, deeper)
    createBrownNoise() {
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        return noise;
    }

    // Create a simple oscillator with envelope
    createTone(frequency, type = 'sine', volume = 0.1) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = type;
        osc.frequency.value = frequency;
        gain.gain.value = volume;

        osc.connect(gain);
        gain.connect(this.masterGain);

        return { oscillator: osc, gain: gain };
    }

    // Create a low-pass filtered noise
    createFilteredNoise(cutoff = 1000, type = 'pink') {
        const noise = type === 'pink' ? this.createPinkNoise() : this.createBrownNoise();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();

        filter.type = 'lowpass';
        filter.frequency.value = cutoff;
        filter.Q.value = 1;
        gain.gain.value = 0.3;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        return { noise: noise, filter: filter, gain: gain };
    }

    // Lo-Fi Chill soundscape
    playLofi() {
        // Warm pad with gentle movement
        const padFreqs = [130.81, 196, 261.63, 329.63]; // C major chord

        padFreqs.forEach((freq, i) => {
            const { oscillator, gain } = this.createTone(freq, 'sine', 0.03);

            // Add subtle vibrato
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            lfo.frequency.value = 0.5 + Math.random() * 0.5;
            lfoGain.gain.value = 2;
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);

            oscillator.start();
            lfo.start();

            this.oscillators.push({ oscillator, gain, lfo });
        });

        // Add filtered noise for texture
        const { noise, filter, gain } = this.createFilteredNoise(400, 'brown');
        noise.start();
        this.noiseNode = { noise, filter, gain };
    }

    // Rain soundscape
    playRain() {
        // Brown noise for rain
        const { noise, filter, gain } = this.createFilteredNoise(2000, 'brown');
        gain.gain.value = 0.4;
        noise.start();
        this.noiseNode = { noise, filter, gain };

        // Occasional low rumble (thunder)
        const rumble = this.createTone(40, 'sine', 0.02);

        // Modulate the rumble gain randomly
        const rumbleOsc = this.audioContext.createOscillator();
        rumbleOsc.type = 'sine';
        rumbleOsc.frequency.value = 0.1;
        rumbleOsc.connect(rumble.gain.gain);

        rumble.oscillator.start();
        rumbleOsc.start();

        this.oscillators.push({ oscillator: rumble.oscillator, gain: rumble.gain, lfo: rumbleOsc });
    }

    // Space ambient soundscape
    playSpace() {
        // Deep drone
        const droneFreqs = [55, 82.41, 110]; // A1, E2, A2

        droneFreqs.forEach((freq, i) => {
            const { oscillator, gain } = this.createTone(freq, 'sine', 0.04);

            // Slow panning movement via volume modulation
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            lfo.frequency.value = 0.05 + i * 0.02;
            lfoGain.gain.value = 0.01;
            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);

            oscillator.start();
            lfo.start();

            this.oscillators.push({ oscillator, gain, lfo });
        });

        // Subtle high-frequency shimmer
        const shimmer = this.createTone(1200, 'sine', 0.005);
        const shimmerLfo = this.audioContext.createOscillator();
        shimmerLfo.frequency.value = 0.3;
        shimmerLfo.connect(shimmer.gain.gain);
        shimmer.oscillator.start();
        shimmerLfo.start();

        this.oscillators.push({ oscillator: shimmer.oscillator, gain: shimmer.gain, lfo: shimmerLfo });
    }

    // Nature/Forest soundscape
    playNature() {
        // Wind through trees (filtered noise)
        const { noise, filter, gain } = this.createFilteredNoise(800, 'pink');
        gain.gain.value = 0.15;

        // Modulate filter for wind gusts
        const windLfo = this.audioContext.createOscillator();
        const windLfoGain = this.audioContext.createGain();
        windLfo.frequency.value = 0.1;
        windLfoGain.gain.value = 400;
        windLfo.connect(windLfoGain);
        windLfoGain.connect(filter.frequency);
        windLfo.start();

        noise.start();
        this.noiseNode = { noise, filter, gain, lfo: windLfo };

        // Bird-like high tones
        const birdFreqs = [2000, 2500, 3000];
        birdFreqs.forEach((freq, i) => {
            const { oscillator, gain } = this.createTone(freq, 'sine', 0.002);

            const lfo = this.audioContext.createOscillator();
            lfo.frequency.value = 2 + Math.random() * 3;
            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.value = 0.002;
            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);

            oscillator.start();
            lfo.start();

            this.oscillators.push({ oscillator, gain, lfo });
        });
    }

    // Ocean waves soundscape
    playOcean() {
        // Brown noise for ocean base
        const { noise, filter, gain } = this.createFilteredNoise(600, 'brown');
        gain.gain.value = 0.35;

        // Modulate filter for wave rhythm
        const waveLfo = this.audioContext.createOscillator();
        const waveLfoGain = this.audioContext.createGain();
        waveLfo.frequency.value = 0.08; // Slow wave rhythm
        waveLfoGain.gain.value = 300;
        waveLfo.connect(waveLfoGain);
        waveLfoGain.connect(filter.frequency);
        waveLfo.start();

        // Also modulate volume for wave presence
        const volLfo = this.audioContext.createOscillator();
        const volLfoGain = this.audioContext.createGain();
        volLfo.frequency.value = 0.08;
        volLfoGain.gain.value = 0.1;
        volLfo.connect(volLfoGain);
        volLfoGain.connect(gain.gain);
        volLfo.start();

        noise.start();
        this.noiseNode = { noise, filter, gain, lfo: waveLfo, volLfo: volLfo };
    }

    // Play a soundscape
    play(soundscape) {
        if (!this.initialized) {
            this.pendingStart = true;
            this.currentSoundscape = soundscape;
            return;
        }

        // Stop current sounds
        this.stop();

        if (soundscape === 'none') {
            this.currentSoundscape = 'none';
            return;
        }

        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.currentSoundscape = soundscape;
        this.isPlaying = true;

        switch (soundscape) {
            case 'lofi':
                this.playLofi();
                break;
            case 'rain':
                this.playRain();
                break;
            case 'space':
                this.playSpace();
                break;
            case 'nature':
                this.playNature();
                break;
            case 'ocean':
                this.playOcean();
                break;
        }

        // Save preference
        localStorage.setItem('ambientSoundscape', soundscape);
        localStorage.setItem('ambientEnabled', 'true');
        this.enabled = true;
    }

    // Stop all sounds
    stop() {
        this.oscillators.forEach(({ oscillator, lfo }) => {
            try {
                oscillator.stop();
                if (lfo) lfo.stop();
            } catch (e) {
                // Ignore errors from already stopped oscillators
            }
        });
        this.oscillators = [];

        if (this.noiseNode) {
            try {
                this.noiseNode.noise.stop();
                if (this.noiseNode.lfo) this.noiseNode.lfo.stop();
                if (this.noiseNode.volLfo) this.noiseNode.volLfo.stop();
            } catch (e) {
                // Ignore
            }
            this.noiseNode = null;
        }

        this.isPlaying = false;
    }

    // Set volume (0-1)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
        localStorage.setItem('ambientVolume', this.volume.toString());
    }

    // Toggle sound on/off
    toggle() {
        if (this.isPlaying) {
            this.stop();
            this.enabled = false;
            localStorage.setItem('ambientEnabled', 'false');
        } else if (this.currentSoundscape && this.currentSoundscape !== 'none') {
            this.play(this.currentSoundscape);
        } else {
            this.play('lofi'); // Default
        }
        return this.isPlaying;
    }

    // Disable ambient sound
    disable() {
        this.stop();
        this.enabled = false;
        localStorage.setItem('ambientEnabled', 'false');
    }

    // Get current state
    getState() {
        return {
            isPlaying: this.isPlaying,
            currentSoundscape: this.currentSoundscape,
            volume: this.volume,
            enabled: this.enabled
        };
    }

    // Get available soundscapes
    getSoundscapes() {
        return this.soundscapes;
    }
}

// Create global instance
window.ambientSound = new AmbientSoundSystem();

// Initialize on first user interaction
const initAmbientOnInteraction = () => {
    window.ambientSound.init();

    // Auto-start if enabled
    const savedSoundscape = localStorage.getItem('ambientSoundscape');
    const enabled = localStorage.getItem('ambientEnabled') === 'true';

    if (enabled && savedSoundscape && savedSoundscape !== 'none') {
        window.ambientSound.play(savedSoundscape);
    }

    // Remove listeners after first interaction
    document.removeEventListener('click', initAmbientOnInteraction);
    document.removeEventListener('keydown', initAmbientOnInteraction);
    document.removeEventListener('touchstart', initAmbientOnInteraction);
};

document.addEventListener('click', initAmbientOnInteraction);
document.addEventListener('keydown', initAmbientOnInteraction);
document.addEventListener('touchstart', initAmbientOnInteraction);

// Export for use in other scripts
window.AmbientSoundSystem = AmbientSoundSystem;
