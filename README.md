# Lumio - Modern Gaming Platform

A bright, futuristic, and smooth gaming website featuring a modern UI with neon accents, smooth animations, and a comprehensive game library.

## Features

### 🎮 Framework Support

Lumio supports multiple game frameworks and engines:

- **Unity WebGL** (Old & New formats)
  - Automatic detection of Unity games
  - Support for both UnityLoader.js and new WebGL.loader.js formats
  - Fullscreen support
  
- **Construct 3**
  - C3 runtime games
  - Offline client support
  
- **Phaser**
  - Phaser.js games
  - HTML5 canvas games
  
- **Godot**
  - Godot Web exports
  - WASM support
  
- **PlayCanvas**
  - PlayCanvas engine games
  
- **Three.js / PixiJS**
  - WebGL-based games
  
- **Flash (Ruffle)**
  - Flash games via Ruffle emulator
  
- **HTML5**
  - Standard HTML5/JavaScript games
  - Canvas-based games

Games are automatically detected and loaded with the appropriate framework handler.

### 🎮 Main Features

1. **Game Grid (Home Page)**
   - Grid of 400 square game frames
   - Rounded curved edges (20-30px radius)
   - PNG thumbnails for each game
   - Hover effects: scale-up, glow border, smooth shadow raise
   - Click to open individual game pages

2. **Game Pages**
   - Large header banner
   - Play button with embedded game iframe
   - Game description panel
   - Controls/Tutorial section
   - Tags (Action, Puzzle, Casual, etc.)
   - Recommended games footer

3. **Animated Background**
   - Subtle particle field
   - Flowing gradient waves
   - Smooth 60fps animation
   - Dark theme with neon accents (blue, purple, pink)
   - Toggleable via settings

4. **Navigation Bar**
   - Glowing "Lumio" logo
   - Navigation buttons: Home, Categories, New Games, Trending, Favorites
   - Live-filter search bar
   - Settings button
   - Profile icon dropdown

5. **Settings Menu**
   - Toggle sound effects
   - Toggle background animation
   - Light/Dark mode selector
   - Profile settings
   - Account login/register buttons
   - Language selector
   - Preferences saved to local storage

6. **Site-Wide Style**
   - Rounded shapes with neon glow accents
   - Smooth transitions (200-300ms)
   - Fully responsive (PC, tablet, mobile)
   - Modern gaming UI aesthetic

7. **General Behaviors**
   - Lazy-loading for game frames
   - Smooth scrolling throughout
   - Loading screen with animated Lumio logo
   - Quick and polished interactions

## Game Discovery

The site automatically discovers games by:
- Scanning for game folders
- Looking for thumbnail images (`thumbnail.png`, `thumb.png`, `cover.png`)
- Categorizing games based on folder names
- **Detecting game frameworks automatically** (Unity, Construct, Phaser, etc.)
- Generating game metadata

### Framework Detection

The system automatically detects game frameworks by checking for:
- **Unity WebGL**: `Build/` folder, `TemplateData/`, `UnityLoader.js`
- **Construct 3**: `scripts/c3runtime.js`, `data.json`
- **Phaser**: `phaser.js` or `phaser.min.js`
- **Godot**: `godot.js`, `engine.wasm`
- And more...

Each game is tagged with its framework, which is displayed on the game detail page.

## Customization

### Colors
Edit CSS variables in `assets/css/style.css`:
- `--neon-blue`, `--neon-purple`, `--neon-pink`: Neon accent colors
- `--bg-primary`, `--bg-secondary`: Background colors
- `--text-primary`, `--text-secondary`: Text colors

### Adding Games
Games are automatically discovered from folder structure. Ensure each game folder contains:
- `index.html` (the game file)
- A thumbnail image (`thumbnail.png`, `thumb.png`, or `cover.png`)

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern mobile browsers

## Performance

- Lazy loading for images
- Optimized animations (60fps)
- Efficient game grid rendering
- Local storage for preferences

## License

This project is open source and available for use.


