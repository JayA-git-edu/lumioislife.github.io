// Game Data Discovery and Management
class GameDataManager {
    constructor() {
        this.games = [];
        this.categories = {
            'Action': [],
            'Puzzle': [],
            'Casual': [],
            'Racing': [],
            'Sports': [],
            'Adventure': [],
            'Strategy': [],
            'Arcade': [],
            'Shooter': [],
            'Platformer': []
        };
        try {
            const savedFavorites = localStorage.getItem('lumio_favorites');
            this.favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
        } catch (e) {
            console.error('Failed to load favorites:', e);
            this.favorites = [];
        }
        this.frameworkDetector = new FrameworkDetector();
    }

    // Discover games from folder structure
    async discoverGames() {
        const gameFolders = [
            'among-us', 'idle-breakout', '2048', 'flappy-bird', 'slope', 'temple-run-2',
            'subway-surfers', 'moto-x3m', 'vex3', 'vex4', 'vex5', 'vex6', 'vex7',
            'paperio2', 'smashkarts', 'krunker', 'shellshockers', 'basket-random',
            'basketball-stars', 'soccer-random', 'retro-bowl', 'drift-hunters',
            'madalin-stunt-cars-2', 'madalin-stunt-cars-3', 'crossyroad',
            'cookie-clicker', 'doge2048', 'wordle', 'minesweeper', 'solitaire',
            'fridaynightfunkin', 'baldis-basics', 'there-is-no-game', 'superhot',
            'worlds-hardest-game', 'worlds-hardest-game-2', 'impossiblequiz',
            'chrome-dino', 'google-snake', 'helicopter', 'doodle-jump',
            'jetpack-joyride', 'fruitninja', 'angry-sharks', 'tiny-fishing',
            'idle-shark', 'ducklife1', 'ducklife2', 'ducklife3', 'ducklife4',
            'learntofly', 'learntofly2', 'grindcraft', 'space-company',
            'the-final-earth', 'sort-the-court', 'you-are-bezos', 'bitlife',
            'townscaper', 'sandboxels', 'webgl-fluid-simulation', 'weavesilk',
            'craftmine', 'minecraft-classic', 'minecraft-15', 'minecraft-18',
            'mario', 'sm64', 'supermarioconstruct', 'geodash', 'stickman-hook',
            'stickman-golf', 'stickman-boost', 'stick-duel-battle', 'stick-archers',
            'rabbit-samurai', 'rabbit-samurai2', 'ninja', 'ninjavsevilcorp',
            'tacticalassasin2', 'soldier-legend', 'zombs-royale', 'surviv',
            'starve', 'pixel-gun-survival', 'tank-trouble-2', 'awesometanks2',
            'defend-the-tank', 'canyondefense', 'slime-rush-td', 'hexempire',
            'hextris', 'twitch-tetris', 'flashtetris', '2048-multitask',
            'cupcake2048', 'meme2048', 'doge2048', 'flappy-2048',
            'bloonstd', 'bloonstd2', 'endlesswar3', 'battleforgondor',
            'ages-of-conflict', 'matrixrampage', 'alienhominid', 'boxhead2play',
            'creativekillchamber', 'stormthehouse2', 'escapingtheprison',
            'stealingthediamond', 'theheist', 'breakingthebank', 'thebattle',
            'riddleschool', 'riddleschool2', 'riddleschool3', 'riddleschool4',
            'riddleschool5', 'riddletransfer', 'riddletransfer2', 'adarkroom',
            'there-is-no-game', 'thisistheonlylevel', 'game-inside',
            'the-hotel', 'station-141', 'backrooms', 'fnaw', 'goodnight',
            'sleepingbeauty', 'santy-is-home', 'amidst-the-clouds',
            'fireboywatergirlforesttemple', 'bad-ice-cream', 'bad-ice-cream-2',
            'bad-ice-cream-3', 'papasburgeria', 'papaspizzaria', 'burger-and-frights',
            'kitchen-gun-game', 'doctor-acorn2', 'doctor-acorn2', 'georgeandtheprinter',
            'handshakes', 'eel-slap', 'spinningrat', 'popcat-classic', 'bigredbutton',
            'fake-virus', 'tv-static', 'hackertype', 'chill-radio', 'soundboard',
            'webretro', 'ruffle', 'wolf3d', 'portalflash', 'supermarioconstruct',
            'a-dance-of-fire-and-ice', 'achievementunlocked', 'champion-island',
            'tanuki-sunset', 'synesthesia', 'marvinspectrum', 'yoshifabrication',
            'exo', 'polybranch', 'n-gon', 'circlo', 'om-bounce', 'ovo', 'happy-hop',
            'flippy-fish', 'sushi-unroll', 'push-the-square', 'push-your-luck',
            'core-ball', 'slope-ball', 'stack', 'stack-bump-3d', 'rolly-vortex',
            'cluster-rush', 'merge-round-racers', 'stick-merge', 'align-4',
            'connect3', 'bntts', 'btts', 'cnpingpong', 'gravity-soccer',
            'soccer-skills', 'basketbros-io', 'cannon-basketball-4', 'boxing-random',
            'rooftop-snipers', 'knife-master', 'shotinthedark', 'smokingbarrels',
            'tactical-weapon-pack-2', 'just-one-boss', 'froggys-battle',
            'just-fall', 'drive-mad', 'draw-the-hill', 'go-ball', 'edge-surf',
            'tunnel-rush', 'tube-jumpers', 'death-run-3d', 'noob-steve-parkour',
            'getaway-shootout', 'aquapark-slides', 'sky-car-stunt', 'x-trial-racing',
            'veloce', 'swerve', 'drift-boss', 'motox3m-pool', 'motox3m-spooky',
            'motox3m-winter', 'motox3m2', 'ctr', 'ctr-holiday', 'ctr-tr',
            'adventure-drivers', 'cars-simulator', 'my-rusty-submarine',
            'tiny-islands', 'rolling-forests', 'glass-city', 'waterworks',
            'spacegarden', 'evolution', 'cell-machine', 'sand-game',
            'factoryballs', 'fairsquares', 'doublewires', 'blacholesquare',
            'dragon-vs-bricks', 'idle-breakout', 'particle-clicker',
            'csgo-clicker', 'DogeMiner', 'you-are-bezos', 'deal-or-no-deal',
            'win-the-whitehouse', 'google-feud', 'impossiblequiz',
            'worlds-hardest-game', 'worlds-hardest-game-2', 'thisistheonlylevel',
            'there-is-no-game', 'achievementunlocked', 'game-inside',
            'miniputt', 'stickman-golf', 'gimme-the-airpod', 'tosstheturtle',
            'frying-nemo', 'hungry-lamu', 'ballistic-chickens', 'kittencannon',
            'elasticman', 'interactivebuddy', 'greybox', 'hba', 'ns-shaft',
            'nsresurgence', 'precision-client', 'resent-client', 'xx142-b2exe',
            'webretro', 'ruffle', 'OfflineParadise', 'edgenotfound',
            'fancypantsadventures', 'astray', 'avalanche', 'blackknight',
            'bobtherobber2', 'scrapmetal', 'protektor', 'shuttledeck',
            'papery-planes', 'tanuki-sunset', 'synesthesia'
        ];

        // Generate game data
        for (let i = 0; i < Math.min(400, gameFolders.length * 2); i++) {
            const folderIndex = i % gameFolders.length;
            const folder = gameFolders[folderIndex];
            const gameNumber = Math.floor(i / gameFolders.length);
            const gameName = gameNumber === 0 ? folder : `${folder}-${gameNumber + 1}`;
            
            // Detect framework
            const framework = this.detectGameFramework(folder);
            
            const game = {
                id: `game-${i + 1}`,
                name: this.formatGameName(folder),
                folder: folder,
                path: `${folder}/index.html`,
                thumbnail: this.findThumbnail(folder),
                category: this.categorizeGame(folder),
                description: this.generateDescription(folder),
                tags: this.generateTags(folder),
                framework: framework,
                trending: Math.random() > 0.7,
                new: Math.random() > 0.8
            };

            this.games.push(game);
            this.categories[game.category].push(game);
        }

        return this.games;
    }

    formatGameName(folder) {
        return folder
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    findThumbnail(folder) {
        // Check common thumbnail paths
        const thumbnailPaths = [
            `${folder}/thumbnail.png`,
            `${folder}/thumb.png`,
            `${folder}/img/thumbnail.png`,
            `${folder}/img/thumb.png`,
            `${folder}/assets/thumbnail.png`,
            `${folder}/assets/particles/thumbnail.png`,
            `${folder}/img/cover.png`,
            `${folder}/cover.png`
        ];

        // Return first potential path (actual existence checked when loading)
        return thumbnailPaths[0];
    }

    categorizeGame(folder) {
        const name = folder.toLowerCase();
        
        if (name.includes('shooter') || name.includes('gun') || name.includes('battle') || 
            name.includes('war') || name.includes('tank') || name.includes('krunker') ||
            name.includes('shellshock') || name.includes('zombs')) {
            return 'Shooter';
        }
        if (name.includes('racing') || name.includes('car') || name.includes('drift') ||
            name.includes('moto') || name.includes('ctr') || name.includes('veloce')) {
            return 'Racing';
        }
        if (name.includes('soccer') || name.includes('basket') || name.includes('sport') ||
            name.includes('bowl') || name.includes('archer') || name.includes('golf')) {
            return 'Sports';
        }
        if (name.includes('puzzle') || name.includes('2048') || name.includes('tetris') ||
            name.includes('minesweeper') || name.includes('wordle') || name.includes('connect') ||
            name.includes('align') || name.includes('hextris')) {
            return 'Puzzle';
        }
        if (name.includes('platform') || name.includes('jump') || name.includes('run') ||
            name.includes('stickman') || name.includes('ninja') || name.includes('rabbit') ||
            name.includes('slope') || name.includes('vex') || name.includes('tunnel')) {
            return 'Platformer';
        }
        if (name.includes('idle') || name.includes('clicker') || name.includes('miner') ||
            name.includes('company') || name.includes('earth')) {
            return 'Casual';
        }
        if (name.includes('strategy') || name.includes('defense') || name.includes('td') ||
            name.includes('tower') || name.includes('empire') || name.includes('war')) {
            return 'Strategy';
        }
        if (name.includes('adventure') || name.includes('escape') || name.includes('heist') ||
            name.includes('riddle') || name.includes('school') || name.includes('hotel')) {
            return 'Adventure';
        }
        
        return 'Arcade';
    }

    generateDescription(folder) {
        const name = this.formatGameName(folder);
        return `Experience ${name}, an exciting game that will keep you entertained for hours. Challenge yourself and compete with friends!`;
    }

    generateTags(folder) {
        const name = folder.toLowerCase();
        const tags = [];
        
        if (name.includes('multiplayer') || name.includes('io') || name.includes('royale')) {
            tags.push('Multiplayer');
        }
        if (name.includes('3d')) {
            tags.push('3D');
        }
        if (name.includes('retro') || name.includes('classic')) {
            tags.push('Retro');
        }
        if (name.includes('idle') || name.includes('clicker')) {
            tags.push('Idle');
        }
        
        tags.push('Free', 'Web');
        return tags;
    }

    getGamesByCategory(category) {
        return this.categories[category] || [];
    }

    getTrendingGames() {
        return this.games.filter(game => game.trending);
    }

    getNewGames() {
        return this.games.filter(game => game.new);
    }

    searchGames(query) {
        const lowerQuery = query.toLowerCase();
        return this.games.filter(game => 
            game.name.toLowerCase().includes(lowerQuery) ||
            game.category.toLowerCase().includes(lowerQuery) ||
            game.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    toggleFavorite(gameId) {
        const index = this.favorites.indexOf(gameId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(gameId);
        }
        try {
            localStorage.setItem('lumio_favorites', JSON.stringify(this.favorites));
        } catch (e) {
            console.error('Failed to save favorites:', e);
        }
        return this.favorites.includes(gameId);
    }

    isFavorite(gameId) {
        return this.favorites.includes(gameId);
    }

    getFavoriteGames() {
        return this.games.filter(game => this.favorites.includes(game.id));
    }

    detectGameFramework(folder) {
        // Unity WebGL detection based on common patterns
        const unityIndicators = ['Build', 'TemplateData', 'UnityLoader', 'UnityProgress', 'WebGL'];
        const constructIndicators = ['c3runtime', 'data.json', 'offlineclient'];
        const phaserIndicators = ['phaser'];
        const godotIndicators = ['godot', '.pck'];
        
        const folderLower = folder.toLowerCase();
        
        // Check for Unity WebGL (new format)
        if (folderLower.includes('webgl') || this.hasUnityFiles(folder)) {
            // Check if it's new or old Unity format
            if (this.hasNewUnityFormat(folder)) {
                return { id: 'unity-webgl-new', name: 'Unity WebGL (New)', loader: 'unity-new' };
            }
            return { id: 'unity-webgl', name: 'Unity WebGL', loader: 'unity' };
        }
        
        // Check for Construct
        if (constructIndicators.some(ind => folderLower.includes(ind))) {
            return { id: 'construct', name: 'Construct 3', loader: 'construct' };
        }
        
        // Check for Phaser
        if (phaserIndicators.some(ind => folderLower.includes(ind))) {
            return { id: 'phaser', name: 'Phaser', loader: 'phaser' };
        }
        
        // Check for Godot
        if (godotIndicators.some(ind => folderLower.includes(ind))) {
            return { id: 'godot', name: 'Godot', loader: 'godot' };
        }
        
        // Check for Flash/Ruffle
        if (folderLower.includes('ruffle') || folderLower.includes('flash')) {
            return { id: 'flash', name: 'Flash (Ruffle)', loader: 'flash' };
        }
        
        // Default to HTML5
        return { id: 'html5', name: 'HTML5', loader: 'html5' };
    }

    hasUnityFiles(folder) {
        // Common Unity game folders that typically have Unity files
        const unityGames = [
            'townscaper', 'bitlife', 'glass-city', 'tunnel-rush', 'baldis-basics',
            'slope', 'subway-surfers', 'madalin-stunt-cars-2', 'madalin-stunt-cars-3',
            'death-run-3d', 'aquapark-slides', 'a-dance-of-fire-and-ice',
            'cell-machine', 'cars-simulator', 'ducklife4', 'evolution', 'flippy-fish',
            'frying-nemo', 'georgeandtheprinter', 'game-inside', 'greybox',
            'my-rusty-submarine', 'noob-steve-parkour', 'pixel-gun-survival',
            'rooftop-snipers', 'shotinthedark', 'sky-car-stunt', 'snowbattle',
            'sort-the-court', 'stack-bump-3d', 'station-141', 'tiny-islands',
            'veloce', 'win-the-whitehouse', 'backrooms', '10-minutes-till-dawn'
        ];
        return unityGames.some(game => folder.toLowerCase().includes(game.toLowerCase()));
    }

    hasNewUnityFormat(folder) {
        // Games known to use new Unity WebGL format
        const newFormatGames = ['townscaper'];
        return newFormatGames.some(game => folder.toLowerCase().includes(game.toLowerCase()));
    }
}

// Export for use in other scripts
window.GameDataManager = GameDataManager;

