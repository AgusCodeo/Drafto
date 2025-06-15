/**
 * Draftosaurus Frontend Application
 * Handles both Tracking Mode and Digital Game Mode
 */

class DraftosaurusApp {
    constructor() {
        this.baseURL = window.location.origin;
        this.apiURL = `${this.baseURL}/api`;
        this.currentLanguage = 'es';
        this.gameMode = null;
        this.currentGame = null;
        this.currentUser = null;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.dinosaurSpecies = [];
        
        this.init();
    }

    async init() {
        await this.loadDinosaurSpecies();
        this.setupEventListeners();
        this.setupLanguageSwitch();
        this.showScreen('welcomeScreen');
    }

    // API Methods
    async apiCall(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.apiURL}${endpoint}`, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.showError(`Error de conexión: ${error.message}`);
            throw error;
        }
    }

    async loadDinosaurSpecies() {
        try {
            this.dinosaurSpecies = await this.apiCall('/species');
        } catch (error) {
            console.error('Failed to load dinosaur species:', error);
        }
    }

    async createUser(username, email = null) {
        return await this.apiCall('/users', 'POST', { username, email });
    }

    async createGame(gameName, gameMode, createdBy) {
        return await this.apiCall('/games/create', 'POST', {
            game_name: gameName,
            game_mode: gameMode,
            created_by: createdBy
        });
    }

    async joinGame(gameId, userId) {
        return await this.apiCall('/games/join', 'POST', {
            game_id: gameId,
            user_id: userId
        });
    }

    async rollDice(gameId) {
        return await this.apiCall(`/games/roll-dice/${gameId}`, 'POST');
    }

    async placeDinosaur(gameId, userId, dinosaurSpecies, penLocation, roundNumber = 1, turnNumber = 1, diceRestriction = null) {
        return await this.apiCall('/boards/place-dinosaur', 'POST', {
            game_id: gameId,
            user_id: userId,
            dinosaur_species: dinosaurSpecies,
            pen_location: penLocation,
            round_number: roundNumber,
            turn_number: turnNumber,
            dice_restriction: diceRestriction
        });
    }

    async calculateScores(gameId) {
        return await this.apiCall('/boards/calculate-scores', 'POST', {
            game_id: gameId
        });
    }

    async getPlayerBoard(gameId, userId) {
        return await this.apiCall(`/boards/${gameId}/${userId}`);
    }

    async getAllBoards(gameId) {
        return await this.apiCall(`/boards/${gameId}`);
    }

    // UI Management
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    showLoading(show = true) {
        document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorModal').style.display = 'block';
    }

    updateLanguage() {
        document.querySelectorAll('[data-es][data-en]').forEach(element => {
            const text = element.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                if (element.tagName === 'INPUT' && element.type !== 'button') {
                    element.placeholder = text;
                } else {
                    element.textContent = text;
                }
            }
        });
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Welcome screen mode selection
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const mode = card.dataset.mode;
                this.selectGameMode(mode);
            });
        });

        // Player setup
        document.getElementById('addPlayerBtn').addEventListener('click', () => {
            this.addPlayerInput();
        });

        document.getElementById('backToWelcomeBtn').addEventListener('click', () => {
            this.showScreen('welcomeScreen');
        });

        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.startGame();
        });

        // Game controls
        document.getElementById('rollDiceBtn').addEventListener('click', () => {
            this.handleRollDice();
        });

        document.getElementById('calculateScoresBtn').addEventListener('click', () => {
            this.handleCalculateScores();
        });

        document.getElementById('endGameBtn').addEventListener('click', () => {
            this.endGame();
        });

        // Results screen
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.resetGame();
            this.showScreen('welcomeScreen');
        });

        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.resetGame();
            this.showScreen('welcomeScreen');
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('errorModal').style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('errorModal')) {
                document.getElementById('errorModal').style.display = 'none';
            }
        });
    }

    setupLanguageSwitch() {
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.updateLanguage();
        });
    }

    // Game Mode Selection
    selectGameMode(mode) {
        this.gameMode = mode;
        
        const modeInfo = {
            tracking: {
                title: this.currentLanguage === 'es' ? 'Modo Seguimiento' : 'Tracking Mode',
                description: this.currentLanguage === 'es' 
                    ? 'Herramienta para contar puntos y validar reglas del juego físico'
                    : 'Tool to count points and validate rules of the physical game'
            },
            digital: {
                title: this.currentLanguage === 'es' ? 'Modo Juego Digital' : 'Digital Game Mode',
                description: this.currentLanguage === 'es'
                    ? 'Experiencia completa de juego digital con mecánicas de draft'
                    : 'Complete digital game experience with draft mechanics'
            }
        };

        document.getElementById('selectedModeTitle').textContent = modeInfo[mode].title;
        document.getElementById('selectedModeDescription').textContent = modeInfo[mode].description;
        
        this.showScreen('playerSetupScreen');
    }

    // Player Management
    addPlayerInput() {
        const playersList = document.getElementById('playersList');
        const currentCount = playersList.children.length;
        
        if (currentCount >= 5) {
            this.showError(this.currentLanguage === 'es' 
                ? 'Máximo 5 jugadores permitidos' 
                : 'Maximum 5 players allowed');
            return;
        }

        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-input';
        playerDiv.innerHTML = `
            <input type="text" placeholder="Nombre del jugador ${currentCount + 1}" class="player-name" required>
            <button class="btn-remove">✕</button>
        `;

        playerDiv.querySelector('.btn-remove').addEventListener('click', () => {
            this.removePlayerInput(playerDiv);
        });

        playersList.appendChild(playerDiv);
        this.updatePlayerCount();
    }

    removePlayerInput(playerDiv) {
        const playersList = document.getElementById('playersList');
        if (playersList.children.length > 1) {
            playerDiv.remove();
            this.updatePlayerCount();
            this.updateRemoveButtons();
        }
    }

    updatePlayerCount() {
        const count = document.getElementById('playersList').children.length;
        document.querySelector('.player-count').textContent = `${count}/5 ${this.currentLanguage === 'es' ? 'jugadores' : 'players'}`;
        this.updateRemoveButtons();
    }

    updateRemoveButtons() {
        const removeButtons = document.querySelectorAll('.btn-remove');
        removeButtons.forEach((btn, index) => {
            btn.style.display = removeButtons.length > 1 ? 'block' : 'none';
        });
    }

    // Game Management
    async startGame() {
        const gameName = document.getElementById('gameName').value.trim();
        const playerInputs = document.querySelectorAll('.player-name');
        
        if (!gameName) {
            this.showError(this.currentLanguage === 'es' 
                ? 'Por favor ingresa un nombre para el juego' 
                : 'Please enter a game name');
            return;
        }

        const playerNames = Array.from(playerInputs)
            .map(input => input.value.trim())
            .filter(name => name);

        if (playerNames.length < 2) {
            this.showError(this.currentLanguage === 'es' 
                ? 'Se necesitan al menos 2 jugadores' 
                : 'At least 2 players required');
            return;
        }

        this.showLoading();

        try {
            // Create players
            this.players = [];
            for (const name of playerNames) {
                const user = await this.createUser(name);
                this.players.push(user);
            }

            // Create game
            this.currentGame = await this.createGame(gameName, this.gameMode, this.players[0].user_id);
            
            // Add all players to game
            for (const player of this.players) {
                await this.joinGame(this.currentGame.game_id, player.user_id);
            }

            this.showLoading(false);
            this.initializeGameBoard();
            this.showScreen('gameBoardScreen');
            
        } catch (error) {
            this.showLoading(false);
            this.showError(this.currentLanguage === 'es' 
                ? 'Error al crear el juego' 
                : 'Error creating game');
        }
    }

    initializeGameBoard() {
        // Update game header
        document.getElementById('currentGameName').textContent = this.currentGame.game_name;
        document.getElementById('gameMode').textContent = this.gameMode === 'tracking' 
            ? (this.currentLanguage === 'es' ? 'Modo Seguimiento' : 'Tracking Mode')
            : (this.currentLanguage === 'es' ? 'Modo Juego Digital' : 'Digital Game Mode');

        // Create player tabs
        this.createPlayerTabs();
        
        // Show first player's board
        this.currentPlayerIndex = 0;
        this.showPlayerBoard(this.currentPlayerIndex);
    }

    createPlayerTabs() {
        const tabsList = document.getElementById('playersTabsList');
        tabsList.innerHTML = '';

        this.players.forEach((player, index) => {
            const tab = document.createElement('button');
            tab.className = `tab ${index === 0 ? 'active' : ''}`;
            tab.textContent = player.username;
            tab.addEventListener('click', () => {
                this.switchToPlayer(index);
            });
            tabsList.appendChild(tab);
        });
    }

    switchToPlayer(index) {
        this.currentPlayerIndex = index;
        
        // Update active tab
        document.querySelectorAll('.tab').forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });
        
        this.showPlayerBoard(index);
    }

    showPlayerBoard(playerIndex) {
        const player = this.players[playerIndex];
        const boardContainer = document.getElementById('currentPlayerBoard');
        
        boardContainer.innerHTML = `
            <div class="board-grid">
                ${this.createPenHTML('forest_of_sameness', 'Bosque de Igualdad', 'Forest of Sameness', [])}
                ${this.createPenHTML('meadow_of_differences', 'Pradera de Diferencias', 'Meadow of Differences', [])}
                ${this.createPenHTML('prairie_of_love', 'Pradera del Amor', 'Prairie of Love', [])}
                ${this.createPenHTML('woody_trio', 'Trío Arbolado', 'Woody Trio', [])}
                ${this.createPenHTML('king_of_jungle', 'Rey de la Jungla', 'King of Jungle', [])}
                ${this.createPenHTML('solitary_island', 'Isla Solitaria', 'Solitary Island', [])}
                ${this.createPenHTML('river', 'Río', 'River', [])}
            </div>
            
            <div class="dinosaur-selection">
                <h4>${this.currentLanguage === 'es' ? 'Seleccionar Dinosaurio' : 'Select Dinosaur'}</h4>
                <div class="dinosaur-options">
                    ${this.dinosaurSpecies.map(species => `
                        <div class="dinosaur dinosaur-option ${species.species_name}" 
                             data-species="${species.species_name}"
                             title="${this.currentLanguage === 'es' ? species.species_name_es : species.species_name_en}">
                            ${this.getDinosaurEmoji(species.species_name)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.setupPenInteractions();
        this.setupDinosaurSelection();
    }

    createPenHTML(penId, nameEs, nameEn, dinosaurs) {
        const penName = this.currentLanguage === 'es' ? nameEs : nameEn;
        return `
            <div class="pen" data-pen="${penId}">
                <div class="pen-header">
                    <span class="pen-name">${penName}</span>
                    <span class="pen-score">0</span>
                </div>
                <div class="pen-content">
                    ${dinosaurs.map(dino => `
                        <div class="dinosaur ${dino}" data-species="${dino}">
                            ${this.getDinosaurEmoji(dino)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getDinosaurEmoji(species) {
        const emojis = {
            'trex': '🦖',
            'stegosaurus': '🦴',
            'triceratops': '🦕',
            'brachiosaurus': '🦣',
            'pterodactyl': '🦅',
            'velociraptor': '🦈'
        };
        return emojis[species] || '🦕';
    }

    setupPenInteractions() {
        document.querySelectorAll('.pen').forEach(pen => {
            pen.addEventListener('click', () => {
                this.selectPen(pen.dataset.pen);
            });
        });
    }

    setupDinosaurSelection() {
        document.querySelectorAll('.dinosaur-option').forEach(option => {
            option.addEventListener('click', () => {
                this.selectDinosaur(option.dataset.species);
            });
        });
    }

    selectedDinosaur = null;
    selectedPen = null;

    selectDinosaur(species) {
        // Remove previous selection
        document.querySelectorAll('.dinosaur-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add selection to clicked dinosaur
        document.querySelector(`[data-species="${species}"]`).classList.add('selected');
        this.selectedDinosaur = species;
        
        if (this.selectedPen) {
            this.placeDinosaurOnBoard();
        }
    }

    selectPen(penId) {
        // Remove previous selection
        document.querySelectorAll('.pen').forEach(pen => {
            pen.classList.remove('selected');
        });
        
        // Add selection to clicked pen
        document.querySelector(`[data-pen="${penId}"]`).classList.add('selected');
        this.selectedPen = penId;
        
        if (this.selectedDinosaur) {
            this.placeDinosaurOnBoard();
        }
    }

    async placeDinosaurOnBoard() {
        if (!this.selectedDinosaur || !this.selectedPen) return;

        const currentPlayer = this.players[this.currentPlayerIndex];
        
        try {
            await this.placeDinosaur(
                this.currentGame.game_id,
                currentPlayer.user_id,
                this.selectedDinosaur,
                this.selectedPen
            );

            // Add dinosaur to pen visually
            const penContent = document.querySelector(`[data-pen="${this.selectedPen}"] .pen-content`);
            const dinosaurElement = document.createElement('div');
            dinosaurElement.className = `dinosaur ${this.selectedDinosaur}`;
            dinosaurElement.dataset.species = this.selectedDinosaur;
            dinosaurElement.innerHTML = this.getDinosaurEmoji(this.selectedDinosaur);
            penContent.appendChild(dinosaurElement);

            // Clear selections
            this.clearSelections();

        } catch (error) {
            this.showError(this.currentLanguage === 'es' 
                ? 'Error al colocar dinosaurio' 
                : 'Error placing dinosaur');
        }
    }

    clearSelections() {
        document.querySelectorAll('.selected').forEach(element => {
            element.classList.remove('selected');
        });
        this.selectedDinosaur = null;
        this.selectedPen = null;
    }

    async handleRollDice() {
        try {
            const result = await this.rollDice(this.currentGame.game_id);
            document.getElementById('diceResult').textContent = this.getDiceFaceText(result.dice_face);
        } catch (error) {
            this.showError(this.currentLanguage === 'es' 
                ? 'Error al lanzar dado' 
                : 'Error rolling dice');
        }
    }

    getDiceFaceText(face) {
        const faceTexts = {
            'es': {
                'forest': '🌲 Bosque',
                'grassland': '🌾 Pradera',
                'mountain': '⛰️ Montaña',
                'nest': '🥚 Nido',
                'river': '🌊 Río',
                'free_choice': '✨ Libre'
            },
            'en': {
                'forest': '🌲 Forest',
                'grassland': '🌾 Grassland',
                'mountain': '⛰️ Mountain',
                'nest': '🥚 Nest',
                'river': '🌊 River',
                'free_choice': '✨ Free'
            }
        };
        return faceTexts[this.currentLanguage][face] || face;
    }

    async handleCalculateScores() {
        this.showLoading();
        
        try {
            const scores = await this.calculateScores(this.currentGame.game_id);
            await this.updateScoreDisplay();
            this.showScoreResults(scores);
        } catch (error) {
            this.showError(this.currentLanguage === 'es' 
                ? 'Error al calcular puntuaciones' 
                : 'Error calculating scores');
        }
        
        this.showLoading(false);
    }

    async updateScoreDisplay() {
        // Update score display for current player
        const currentPlayer = this.players[this.currentPlayerIndex];
        try {
            const board = await this.getPlayerBoard(this.currentGame.game_id, currentPlayer.user_id);
            
            // Update pen scores
            document.querySelector('[data-pen="forest_of_sameness"] .pen-score').textContent = board.forest_score;
            document.querySelector('[data-pen="meadow_of_differences"] .pen-score').textContent = board.meadow_score;
            document.querySelector('[data-pen="prairie_of_love"] .pen-score').textContent = board.prairie_score;
            document.querySelector('[data-pen="woody_trio"] .pen-score').textContent = board.woody_score;
            document.querySelector('[data-pen="king_of_jungle"] .pen-score').textContent = board.king_score;
            document.querySelector('[data-pen="solitary_island"] .pen-score').textContent = board.solitary_score;
            document.querySelector('[data-pen="river"] .pen-score').textContent = board.river_score;
            
        } catch (error) {
            console.error('Error updating score display:', error);
        }
    }

    async showScoreResults(scores) {
        const boards = await this.getAllBoards(this.currentGame.game_id);
        
        // Sort by total score descending
        boards.sort((a, b) => b.total_score - a.total_score);
        
        const scoreboard = document.getElementById('finalScoreboard');
        scoreboard.innerHTML = boards.map((board, index) => `
            <div class="score-row ${index === 0 ? 'winner' : ''}">
                <div>
                    <div class="player-name">${board.username}</div>
                    <div class="score-breakdown">
                        ${this.currentLanguage === 'es' ? 'Bosque' : 'Forest'}: ${board.forest_score} | 
                        ${this.currentLanguage === 'es' ? 'Pradera' : 'Meadow'}: ${board.meadow_score} | 
                        ${this.currentLanguage === 'es' ? 'Amor' : 'Love'}: ${board.prairie_score} | 
                        ${this.currentLanguage === 'es' ? 'Trio' : 'Trio'}: ${board.woody_score} | 
                        ${this.currentLanguage === 'es' ? 'Rey' : 'King'}: ${board.king_score} | 
                        ${this.currentLanguage === 'es' ? 'Isla' : 'Island'}: ${board.solitary_score} | 
                        ${this.currentLanguage === 'es' ? 'Río' : 'River'}: ${board.river_score} | 
                        T-Rex: ${board.trex_bonus}
                    </div>
                </div>
                <div class="player-total">${board.total_score}</div>
            </div>
        `).join('');
        
        this.showScreen('resultsScreen');
    }

    endGame() {
        this.handleCalculateScores();
    }

    resetGame() {
        this.currentGame = null;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.selectedDinosaur = null;
        this.selectedPen = null;
        
        // Reset forms
        document.getElementById('gameName').value = '';
        document.getElementById('playersList').innerHTML = `
            <div class="player-input">
                <input type="text" placeholder="Nombre del jugador 1" class="player-name" required>
                <button class="btn-remove" style="display: none;">✕</button>
            </div>
        `;
        this.updatePlayerCount();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.draftosaurusApp = new DraftosaurusApp();
});