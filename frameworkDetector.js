// Framework Detection and Support System
class FrameworkDetector {
    constructor() {
        this.frameworks = {
            'unity-webgl': {
                name: 'Unity WebGL',
                indicators: ['Build/', 'TemplateData/', 'UnityLoader.js', 'UnityProgress.js', 'unity-canvas', 'gameContainer'],
                loader: 'unity',
                version: 'auto' // auto-detect version
            },
            'unity-webgl-new': {
                name: 'Unity WebGL (New)',
                indicators: ['Build/WebGL.loader.js', 'Build/WebGL.framework.js', 'Build/WebGL.wasm', 'unity-container'],
                loader: 'unity-new',
                version: 'new'
            },
            'construct': {
                name: 'Construct',
                indicators: ['scripts/c3runtime.js', 'data.json', 'offlineclient.js'],
                loader: 'construct',
                version: 'c3'
            },
            'phaser': {
                name: 'Phaser',
                indicators: ['phaser.min.js', 'phaser.js', 'game.js'],
                loader: 'phaser',
                version: 'auto'
            },
            'godot': {
                name: 'Godot',
                indicators: ['godot.js', 'engine.wasm', '.pck'],
                loader: 'godot',
                version: 'auto'
            },
            'playcanvas': {
                name: 'PlayCanvas',
                indicators: ['playcanvas.min.js', 'playcanvas-stable.min.js'],
                loader: 'playcanvas',
                version: 'auto'
            },
            'threejs': {
                name: 'Three.js',
                indicators: ['three.min.js', 'three.js', 'THREE'],
                loader: 'threejs',
                version: 'auto'
            },
            'pixijs': {
                name: 'PixiJS',
                indicators: ['pixi.min.js', 'pixi.js', 'PIXI'],
                loader: 'pixijs',
                version: 'auto'
            },
            'flash': {
                name: 'Flash (Ruffle)',
                indicators: ['ruffle', '.swf'],
                loader: 'flash',
                version: 'ruffle'
            },
            'html5': {
                name: 'HTML5',
                indicators: ['index.html', 'game.js', 'main.js'],
                loader: 'html5',
                version: 'standard'
            }
        };
    }

    async detectFramework(gamePath) {
        try {
            // Check for Unity WebGL (new format)
            const unityNewCheck = await this.checkPath(gamePath, ['Build/WebGL.loader.js', 'Build/WebGL.framework.js']);
            if (unityNewCheck) {
                return this.frameworks['unity-webgl-new'];
            }

            // Check for Unity WebGL (old format)
            const unityOldCheck = await this.checkPath(gamePath, ['Build/', 'TemplateData/', 'UnityLoader.js']);
            if (unityOldCheck) {
                return this.frameworks['unity-webgl'];
            }

            // Check for Construct
            const constructCheck = await this.checkPath(gamePath, ['scripts/c3runtime.js', 'data.json']);
            if (constructCheck) {
                return this.frameworks['construct'];
            }

            // Check for Phaser
            const phaserCheck = await this.checkPath(gamePath, ['phaser.min.js', 'phaser.js']);
            if (phaserCheck) {
                return this.frameworks['phaser'];
            }

            // Check for Godot
            const godotCheck = await this.checkPath(gamePath, ['godot.js', 'engine.wasm']);
            if (godotCheck) {
                return this.frameworks['godot'];
            }

            // Check for PlayCanvas
            const playcanvasCheck = await this.checkPath(gamePath, ['playcanvas.min.js']);
            if (playcanvasCheck) {
                return this.frameworks['playcanvas'];
            }

            // Check for Flash/Ruffle
            const flashCheck = await this.checkPath(gamePath, ['ruffle', '.swf']);
            if (flashCheck) {
                return this.frameworks['flash'];
            }

            // Default to HTML5
            return this.frameworks['html5'];
        } catch (error) {
            console.warn('Framework detection error:', error);
            return this.frameworks['html5'];
        }
    }

    async checkPath(basePath, indicators) {
        // Check if indicators exist (simplified check - in real implementation, would use fetch)
        // For now, we'll use a heuristic based on game folder structure
        return true; // Simplified - will be enhanced with actual file checking
    }

    getFrameworkInfo(frameworkId) {
        return this.frameworks[frameworkId] || this.frameworks['html5'];
    }
}

// Framework Loaders
class FrameworkLoaders {
    static async loadUnityWebGL(gamePath, containerId) {
        // Unity WebGL (Old Format)
        return new Promise((resolve, reject) => {
            const container = document.getElementById(containerId);
            if (!container) {
                reject(new Error('Container not found'));
                return;
            }

            // Check for UnityLoader.js
            const loaderScript = document.createElement('script');
            loaderScript.src = `${gamePath}/Build/UnityLoader.js`;
            loaderScript.onload = () => {
                // Find the JSON file in Build folder
                this.findUnityBuildFile(gamePath).then(buildFile => {
                    if (buildFile) {
                        const gameInstance = UnityLoader.instantiate(
                            containerId,
                            `${gamePath}/Build/${buildFile}`,
                            { onProgress: this.unityProgress }
                        );
                        resolve(gameInstance);
                    } else {
                        reject(new Error('Unity build file not found'));
                    }
                });
            };
            loaderScript.onerror = () => reject(new Error('Failed to load UnityLoader.js'));
            document.head.appendChild(loaderScript);
        });
    }

    static async loadUnityWebGLNew(gamePath, containerId) {
        // Unity WebGL (New Format)
        return new Promise((resolve, reject) => {
            const container = document.getElementById(containerId);
            if (!container) {
                reject(new Error('Container not found'));
                return;
            }

            const buildUrl = `${gamePath}/Build`;
            const loaderUrl = `${buildUrl}/WebGL.loader.js`;

            const loaderScript = document.createElement('script');
            loaderScript.src = loaderUrl;
            loaderScript.onload = () => {
                const config = {
                    dataUrl: `${buildUrl}/WebGL.data`,
                    frameworkUrl: `${buildUrl}/WebGL.framework.js`,
                    codeUrl: `${buildUrl}/WebGL.wasm`,
                    streamingAssetsUrl: `${gamePath}/StreamingAssets`,
                    companyName: "Lumio",
                    productName: "Game",
                    productVersion: "1.0"
                };

                const canvas = document.createElement('canvas');
                canvas.id = 'unity-canvas';
                container.appendChild(canvas);

                createUnityInstance(canvas, config)
                    .then(instance => resolve(instance))
                    .catch(error => reject(error));
            };
            loaderScript.onerror = () => reject(new Error('Failed to load Unity WebGL loader'));
            document.head.appendChild(loaderScript);
        });
    }

    static async loadConstruct(gamePath, containerId) {
        // Construct 3 games
        return new Promise((resolve, reject) => {
            const container = document.getElementById(containerId);
            if (!container) {
                reject(new Error('Container not found'));
                return;
            }

            // Create iframe for Construct games
            const iframe = document.createElement('iframe');
            iframe.src = `${gamePath}/index.html`;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.allowFullscreen = true;
            container.appendChild(iframe);

            iframe.onload = () => resolve(iframe);
            iframe.onerror = () => reject(new Error('Failed to load Construct game'));
        });
    }

    static async loadPhaser(gamePath, containerId) {
        // Phaser games - typically loaded via iframe
        return new Promise((resolve, reject) => {
            const container = document.getElementById(containerId);
            if (!container) {
                reject(new Error('Container not found'));
                return;
            }

            const iframe = document.createElement('iframe');
            iframe.src = `${gamePath}/index.html`;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.allowFullscreen = true;
            container.appendChild(iframe);

            iframe.onload = () => resolve(iframe);
            iframe.onerror = () => reject(new Error('Failed to load Phaser game'));
        });
    }

    static async loadGodot(gamePath, containerId) {
        // Godot Web games
        return new Promise((resolve, reject) => {
            const container = document.getElementById(containerId);
            if (!container) {
                reject(new Error('Container not found'));
                return;
            }

            const iframe = document.createElement('iframe');
            iframe.src = `${gamePath}/index.html`;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.allowFullscreen = true;
            container.appendChild(iframe);

            iframe.onload = () => resolve(iframe);
            iframe.onerror = () => reject(new Error('Failed to load Godot game'));
        });
    }

    static async loadHTML5(gamePath, containerId) {
        // Standard HTML5 games
        return new Promise((resolve, reject) => {
            const container = document.getElementById(containerId);
            if (!container) {
                reject(new Error('Container not found'));
                return;
            }

            const iframe = document.createElement('iframe');
            iframe.src = `${gamePath}/index.html`;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.allowFullscreen = true;
            container.appendChild(iframe);

            iframe.onload = () => resolve(iframe);
            iframe.onerror = () => reject(new Error('Failed to load HTML5 game'));
        });
    }

    static async findUnityBuildFile(gamePath) {
        // Try common Unity build file names
        const commonNames = [
            'WebGL.json',
            'build.json',
            'game.json',
            'Build.json'
        ];

        // In a real implementation, would fetch and check
        // For now, return first common name
        return commonNames[0];
    }

    static unityProgress(gameInstance, progress) {
        if (progress === 'complete') {
            console.log('Unity game loaded');
        } else {
            const percent = Math.round(progress * 100);
            console.log(`Loading: ${percent}%`);
        }
    }

    static async loadGame(framework, gamePath, containerId) {
        switch (framework.loader) {
            case 'unity':
                return await this.loadUnityWebGL(gamePath, containerId);
            case 'unity-new':
                return await this.loadUnityWebGLNew(gamePath, containerId);
            case 'construct':
                return await this.loadConstruct(gamePath, containerId);
            case 'phaser':
                return await this.loadPhaser(gamePath, containerId);
            case 'godot':
                return await this.loadGodot(gamePath, containerId);
            case 'html5':
            default:
                return await this.loadHTML5(gamePath, containerId);
        }
    }
}

// Export
window.FrameworkDetector = FrameworkDetector;
window.FrameworkLoaders = FrameworkLoaders;

