// Animated Background Canvas
const canvas = document.getElementById('background-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    let waves = [];
    let currentPattern = 'particles';
    let animationSpeed = 1.0;
    let gridSize = 50;
    let dots = [];
    let spirals = [];
    let matrixChars = [];
    let auroraWaves = [];
    let nebulaParticles = [];
    let hexagons = [];
    let ripples = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Initialize based on current pattern
        switch(currentPattern) {
            case 'particles':
                initParticles();
                break;
            case 'waves':
                initWaves();
                break;
            case 'dots':
                initDots();
                break;
            case 'stars':
                initStars();
                break;
            case 'grid':
            case 'circuit':
            case 'spiral':
                initSpirals();
                break;
            case 'matrix':
                initMatrix();
                break;
            case 'aurora':
                initAurora();
                break;
            case 'nebula':
                initNebula();
                break;
            case 'hexagons':
                initHexagons();
                break;
            case 'ripples':
                initRipples();
                break;
            case 'none':
                // No initialization needed
                break;
            default:
                initParticles();
        }
    }

    function initParticles() {
        particles = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim() || '#00d4ff';
        const accentColor2 = getComputedStyle(document.documentElement).getPropertyValue('--neon-purple').trim() || '#b026ff';
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.5 * animationSpeed,
                speedY: (Math.random() - 0.5) * 0.5 * animationSpeed,
                opacity: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.5 ? accentColor : accentColor2
            });
        }
    }
    
    function initDots() {
        dots = [];
        const dotCount = Math.floor((canvas.width * canvas.height) / 8000);
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim() || '#00d4ff';
        
        for (let i = 0; i < dotCount; i++) {
            dots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.3 + 0.1,
                color: accentColor
            });
        }
    }
    
    function initStars() {
        dots = [];
        const starCount = Math.floor((canvas.width * canvas.height) / 5000);
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim() || '#00d4ff';
        
        for (let i = 0; i < starCount; i++) {
            dots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                color: accentColor,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }

    function initWaves() {
        waves = [];
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim() || '#00d4ff';
        const accentColor2 = getComputedStyle(document.documentElement).getPropertyValue('--neon-purple').trim() || '#b026ff';
        const accentColor3 = getComputedStyle(document.documentElement).getPropertyValue('--neon-pink').trim() || '#ff00e5';
        
        for (let i = 0; i < 3; i++) {
            waves.push({
                y: canvas.height / 2 + (i - 1) * 200,
                amplitude: 50 + Math.random() * 50,
                frequency: 0.01 + Math.random() * 0.01,
                speed: (0.02 + Math.random() * 0.02) * animationSpeed,
                offset: Math.random() * Math.PI * 2,
                color: i === 0 ? accentColor.replace('#', 'rgba(').replace(/(..)(..)(..)/, (m, r, g, b) => 
                    `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, 0.1)`) :
                    i === 1 ? accentColor2.replace('#', 'rgba(').replace(/(..)(..)(..)/, (m, r, g, b) => 
                    `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, 0.1)`) :
                    accentColor3.replace('#', 'rgba(').replace(/(..)(..)(..)/, (m, r, g, b) => 
                    `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, 0.1)`)
            });
        }
    }

    function drawParticles() {
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Update position
            particle.x += particle.speedX * animationSpeed;
            particle.y += particle.speedY * animationSpeed;

            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
        });
    }
    
    function drawDots() {
        dots.forEach(dot => {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            ctx.fillStyle = dot.color;
            ctx.globalAlpha = dot.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    }
    
    function drawStars() {
        dots.forEach(star => {
            star.twinkle += 0.02 * animationSpeed;
            const twinkleOpacity = (Math.sin(star.twinkle) + 1) / 2;
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.opacity * (0.5 + twinkleOpacity * 0.5);
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    }
    
    function drawGrid() {
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim() || '#00d4ff';
        ctx.strokeStyle = accentColor;
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 1;
        
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }
    
    function drawCircuit() {
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim() || '#00d4ff';
        ctx.strokeStyle = accentColor;
        ctx.globalAlpha = 0.15;
        ctx.lineWidth = 2;
        
        // Draw circuit-like paths
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const startX = Math.random() * canvas.width;
            const startY = Math.random() * canvas.height;
            ctx.moveTo(startX, startY);
            
            for (let j = 0; j < 10; j++) {
                const x = startX + (j * 100) + Math.sin(j) * 50;
                const y = startY + Math.cos(j) * 30;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }

    function drawWaves() {
        waves.forEach((wave, index) => {
            ctx.beginPath();
            ctx.moveTo(0, wave.y);

            for (let x = 0; x < canvas.width; x += 2) {
                const y = wave.y + Math.sin(x * wave.frequency + wave.offset) * wave.amplitude;
                ctx.lineTo(x, y);
            }

            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Update wave offset
            wave.offset += wave.speed * animationSpeed;
        });
    }

    function animate() {
        if (document.body.classList.contains('no-bg-animation')) {
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw gradient background
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || '#0a0e27';
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, bgColor + '80');
        gradient.addColorStop(0.5, bgColor + '60');
        gradient.addColorStop(1, bgColor + '80');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw based on current pattern
        switch(currentPattern) {
            case 'particles':
                drawParticles();
                break;
            case 'waves':
                drawWaves();
                break;
            case 'grid':
                drawGrid();
                break;
            case 'dots':
                drawDots();
                break;
            case 'stars':
                drawStars();
                break;
            case 'circuit':
                drawCircuit();
                break;
            case 'spiral':
                drawSpirals();
                break;
            case 'matrix':
                drawMatrix();
                break;
            case 'aurora':
                drawAurora();
                break;
            case 'nebula':
                drawNebula();
                break;
            case 'hexagons':
                drawHexagons();
                break;
            case 'ripples':
                drawRipples();
                break;
            case 'none':
                // No pattern
                break;
            default:
                drawParticles();
        }

        animationId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (!document.body.classList.contains('no-bg-animation')) {
            resizeCanvas();
            animate();
        }
    }

    // Initialize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Check settings
    const bgAnimationEnabled = localStorage.getItem('bgAnimation') !== 'false';
    currentPattern = localStorage.getItem('bgPattern') || 'particles';
    animationSpeed = parseFloat(localStorage.getItem('animationSpeed')) || 1.0;
    
    if (bgAnimationEnabled) {
        startAnimation();
    } else {
        document.body.classList.add('no-bg-animation');
    }

    // Listen for settings changes
    window.addEventListener('bgAnimationToggle', (e) => {
        if (e.detail.enabled) {
            document.body.classList.remove('no-bg-animation');
            startAnimation();
        } else {
            document.body.classList.add('no-bg-animation');
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        }
    });
    
    window.addEventListener('bgPatternChanged', (e) => {
        currentPattern = e.detail.pattern;
        resizeCanvas(); // Reinitialize pattern
    });
    
    window.addEventListener('animationSpeedChanged', (e) => {
        animationSpeed = e.detail.speed;
    });
    
    window.addEventListener('accentColorChanged', () => {
        resizeCanvas(); // Reinitialize with new colors
    });
    
    // New pattern initialization functions
    function initSpirals() {
        spirals = [];
        const spiralCount = 3;
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim() || '#00d4ff';
        const accentColor2 = getComputedStyle(document.documentElement).getPropertyValue('--neon-purple').trim() || '#b026ff';
        
        for (let i = 0; i < spiralCount; i++) {
            spirals.push({
                x: (canvas.width / (spiralCount + 1)) * (i + 1),
                y: canvas.height / 2,
                angle: Math.random() * Math.PI * 2,
                radius: 0,
                maxRadius: Math.min(canvas.width, canvas.height) / 2,
                speed: 0.02 + Math.random() * 0.02,
                color: i % 2 === 0 ? accentColor : accentColor2,
                thickness: 2
            });
        }
    }
    
    function initMatrix() {
        matrixChars = [];
        const columns = Math.floor(canvas.width / 20);
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim() || '#00d4ff';
        
        for (let i = 0; i < columns; i++) {
            matrixChars.push({
                x: i * 20,
                y: Math.random() * canvas.height,
                speed: 0.5 + Math.random() * 2,
                chars: '01',
                charIndex: Math.floor(Math.random() * 2),
                color: accentColor,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }
    
    function initAurora() {
        auroraWaves = [];
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim() || '#00d4ff';
        const accentColor2 = getComputedStyle(document.documentElement).getPropertyValue('--neon-purple').trim() || '#b026ff';
        const accentColor3 = getComputedStyle(document.documentElement).getPropertyValue('--neon-pink').trim() || '#ff00e5';
        
        for (let i = 0; i < 5; i++) {
            auroraWaves.push({
                y: (canvas.height / 6) * (i + 1),
                amplitude: 30 + Math.random() * 40,
                frequency: 0.005 + Math.random() * 0.005,
                speed: (0.01 + Math.random() * 0.01) * animationSpeed,
                offset: Math.random() * Math.PI * 2,
                color: i % 3 === 0 ? accentColor : i % 3 === 1 ? accentColor2 : accentColor3,
                opacity: 0.2 + Math.random() * 0.3
            });
        }
    }
    
    function initNebula() {
        nebulaParticles = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / 8000);
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim() || '#00d4ff';
        const accentColor2 = getComputedStyle(document.documentElement).getPropertyValue('--neon-purple').trim() || '#b026ff';
        const accentColor3 = getComputedStyle(document.documentElement).getPropertyValue('--neon-pink').trim() || '#ff00e5';
        
        for (let i = 0; i < particleCount; i++) {
            nebulaParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.3 * animationSpeed,
                speedY: (Math.random() - 0.5) * 0.3 * animationSpeed,
                opacity: Math.random() * 0.6 + 0.2,
                color: [accentColor, accentColor2, accentColor3][Math.floor(Math.random() * 3)]
            });
        }
    }
    
    function initHexagons() {
        hexagons = [];
        const hexSize = 40;
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim() || '#00d4ff';
        
        for (let y = -hexSize; y < canvas.height + hexSize; y += hexSize * 1.5) {
            for (let x = -hexSize; x < canvas.width + hexSize; x += hexSize * Math.sqrt(3)) {
                hexagons.push({
                    x: x + (y % (hexSize * 3) === 0 ? 0 : hexSize * Math.sqrt(3) / 2),
                    y: y,
                    size: hexSize,
                    opacity: 0.1 + Math.random() * 0.2,
                    color: accentColor
                });
            }
        }
    }
    
    function initRipples() {
        ripples = [];
        const rippleCount = 5;
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim() || '#00d4ff';
        
        for (let i = 0; i < rippleCount; i++) {
            ripples.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: 0,
                maxRadius: Math.max(canvas.width, canvas.height) * 0.8,
                speed: 1 + Math.random() * 2,
                opacity: 0.3,
                color: accentColor
            });
        }
    }
    
    // New pattern drawing functions
    function drawSpirals() {
        spirals.forEach(spiral => {
            ctx.beginPath();
            ctx.strokeStyle = spiral.color;
            ctx.lineWidth = spiral.thickness;
            ctx.globalAlpha = 0.6;
            
            for (let i = 0; i < 100; i++) {
                const angle = spiral.angle + i * 0.1;
                const radius = spiral.radius + i * 2;
                const x = spiral.x + Math.cos(angle) * radius;
                const y = spiral.y + Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            ctx.globalAlpha = 1;
            
            spiral.angle += spiral.speed * animationSpeed;
            spiral.radius = (spiral.radius + 1) % spiral.maxRadius;
        });
    }
    
    function drawMatrix() {
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        
        matrixChars.forEach(char => {
            ctx.fillStyle = char.color;
            ctx.globalAlpha = char.opacity;
            ctx.fillText(char.chars[char.charIndex], char.x, char.y);
            ctx.globalAlpha = 1;
            
            char.y += char.speed * animationSpeed;
            if (char.y > canvas.height) {
                char.y = -20;
                char.charIndex = Math.floor(Math.random() * char.chars.length);
            }
        });
    }
    
    function drawAurora() {
        auroraWaves.forEach(wave => {
            ctx.beginPath();
            ctx.moveTo(0, wave.y);
            
            for (let x = 0; x < canvas.width; x += 2) {
                const y = wave.y + Math.sin(x * wave.frequency + wave.offset) * wave.amplitude;
                ctx.lineTo(x, y);
            }
            
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = wave.opacity;
            ctx.stroke();
            ctx.globalAlpha = 1;
            
            wave.offset += wave.speed * animationSpeed;
        });
    }
    
    function drawNebula() {
        nebulaParticles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
            
            particle.x += particle.speedX * animationSpeed;
            particle.y += particle.speedY * animationSpeed;
            
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
        });
    }
    
    function drawHexagons() {
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--neon-blue').trim() || '#00d4ff';
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1;
        
        hexagons.forEach(hex => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const x = hex.x + hex.size * Math.cos(angle);
                const y = hex.y + hex.size * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.globalAlpha = hex.opacity;
            ctx.stroke();
            ctx.globalAlpha = 1;
        });
    }
    
    function drawRipples() {
        ripples.forEach(ripple => {
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.strokeStyle = ripple.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = ripple.opacity * (1 - ripple.radius / ripple.maxRadius);
            ctx.stroke();
            ctx.globalAlpha = 1;
            
            ripple.radius += ripple.speed * animationSpeed;
            if (ripple.radius > ripple.maxRadius) {
                ripple.radius = 0;
                ripple.x = Math.random() * canvas.width;
                ripple.y = Math.random() * canvas.height;
            }
        });
    }
}

