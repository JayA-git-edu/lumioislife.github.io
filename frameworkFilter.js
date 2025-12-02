// Framework Filter for Game Grid
class FrameworkFilter {
    constructor() {
        this.frameworks = [
            { id: 'all', name: 'All Frameworks' },
            { id: 'unity-webgl', name: 'Unity WebGL' },
            { id: 'construct', name: 'Construct 3' },
            { id: 'phaser', name: 'Phaser' },
            { id: 'godot', name: 'Godot' },
            { id: 'html5', name: 'HTML5' }
        ];
        this.activeFilter = 'all';
    }

    createFilterUI(container) {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'framework-filter';
        filterContainer.style.cssText = `
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            margin-bottom: 2rem;
            padding: 1rem;
            background: var(--bg-card);
            border-radius: var(--border-radius);
            border: 1px solid rgba(0, 212, 255, 0.2);
        `;

        const label = document.createElement('span');
        label.textContent = 'Filter by Framework:';
        label.style.cssText = 'color: var(--text-secondary); font-weight: 600; display: flex; align-items: center;';
        filterContainer.appendChild(label);

        this.frameworks.forEach(framework => {
            const button = document.createElement('button');
            button.className = 'framework-filter-btn';
            button.textContent = framework.name;
            button.dataset.framework = framework.id;
            button.style.cssText = `
                padding: 0.5rem 1rem;
                background: ${this.activeFilter === framework.id ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
                border: 1px solid ${this.activeFilter === framework.id ? 'var(--neon-blue)' : 'rgba(0, 212, 255, 0.3)'};
                border-radius: var(--border-radius-small);
                color: ${this.activeFilter === framework.id ? 'var(--neon-blue)' : 'var(--text-secondary)'};
                font-family: 'Orbitron', sans-serif;
                font-weight: 600;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all var(--transition-normal);
                text-transform: uppercase;
                letter-spacing: 1px;
            `;

            button.addEventListener('click', () => {
                this.setFilter(framework.id);
                this.updateButtons();
                this.dispatchFilterEvent();
            });

            filterContainer.appendChild(button);
        });

        container.appendChild(filterContainer);
    }

    setFilter(frameworkId) {
        this.activeFilter = frameworkId;
    }

    updateButtons() {
        document.querySelectorAll('.framework-filter-btn').forEach(btn => {
            const isActive = btn.dataset.framework === this.activeFilter;
            btn.style.background = isActive ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
            btn.style.borderColor = isActive ? 'var(--neon-blue)' : 'rgba(0, 212, 255, 0.3)';
            btn.style.color = isActive ? 'var(--neon-blue)' : 'var(--text-secondary)';
        });
    }

    filterGames(games) {
        if (this.activeFilter === 'all') {
            return games;
        }

        return games.filter(game => {
            if (!game.framework) return this.activeFilter === 'html5';
            return game.framework.id === this.activeFilter || 
                   (this.activeFilter === 'unity-webgl' && 
                    (game.framework.id === 'unity-webgl' || game.framework.id === 'unity-webgl-new'));
        });
    }

    dispatchFilterEvent() {
        window.dispatchEvent(new CustomEvent('frameworkFilterChanged', {
            detail: { filter: this.activeFilter }
        }));
    }
}

window.FrameworkFilter = FrameworkFilter;

