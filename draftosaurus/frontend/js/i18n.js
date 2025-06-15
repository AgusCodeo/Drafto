/**
 * Internationalization support for Draftosaurus
 */

const i18n = {
    es: {
        // Welcome Screen
        welcome_title: "Bienvenido a Draftosaurus",
        welcome_subtitle: "Gestiona y juega partidas del emocionante juego de mesa familiar",
        tracking_mode: "Modo Seguimiento",
        tracking_description: "Herramienta para contar puntos y validar reglas del juego físico",
        digital_mode: "Modo Juego Digital", 
        digital_description: "Experiencia completa de juego digital con mecánicas de draft",
        start_tracking: "Iniciar Seguimiento",
        play_digital: "Jugar Digital",
        
        // Setup Screen
        player_setup: "Configuración de Jugadores",
        game_name: "Nombre del Juego:",
        players: "Jugadores",
        add_player: "+ Agregar Jugador",
        back: "Volver",
        start_game: "Comenzar Juego",
        players_count: "jugadores",
        
        // Game Screen
        round: "Ronda",
        turn: "Turno", 
        roll_dice: "🎲 Lanzar Dado",
        select_dinosaur: "Seleccionar Dinosaurio",
        calculate_scores: "Calcular Puntuaciones",
        end_game: "Finalizar Juego",
        
        // Pen Names
        forest_of_sameness: "Bosque de Igualdad",
        meadow_of_differences: "Pradera de Diferencias", 
        prairie_of_love: "Pradera del Amor",
        woody_trio: "Trío Arbolado",
        king_of_jungle: "Rey de la Jungla",
        solitary_island: "Isla Solitaria",
        river: "Río",
        
        // Dice Faces
        forest: "🌲 Bosque",
        grassland: "🌾 Pradera",
        mountain: "⛰️ Montaña", 
        nest: "🥚 Nido",
        river_dice: "🌊 Río",
        free_choice: "✨ Libre",
        
        // Results Screen
        final_results: "🏆 Resultados Finales",
        new_game: "Nueva Partida",
        main_menu: "Menú Principal",
        
        // Errors
        error: "Error",
        close: "Cerrar",
        loading: "Cargando...",
        max_players_error: "Máximo 5 jugadores permitidos",
        game_name_required: "Por favor ingresa un nombre para el juego",
        min_players_error: "Se necesitan al menos 2 jugadores",
        create_game_error: "Error al crear el juego",
        place_dinosaur_error: "Error al colocar dinosaurio",
        roll_dice_error: "Error al lanzar dado",
        calculate_scores_error: "Error al calcular puntuaciones"
    },
    
    en: {
        // Welcome Screen
        welcome_title: "Welcome to Draftosaurus",
        welcome_subtitle: "Manage and play sessions of the exciting family board game",
        tracking_mode: "Tracking Mode",
        tracking_description: "Tool to count points and validate rules of the physical game",
        digital_mode: "Digital Game Mode",
        digital_description: "Complete digital game experience with draft mechanics", 
        start_tracking: "Start Tracking",
        play_digital: "Play Digital",
        
        // Setup Screen
        player_setup: "Player Setup",
        game_name: "Game Name:",
        players: "Players",
        add_player: "+ Add Player",
        back: "Back",
        start_game: "Start Game",
        players_count: "players",
        
        // Game Screen
        round: "Round",
        turn: "Turn",
        roll_dice: "🎲 Roll Dice",
        select_dinosaur: "Select Dinosaur",
        calculate_scores: "Calculate Scores", 
        end_game: "End Game",
        
        // Pen Names
        forest_of_sameness: "Forest of Sameness",
        meadow_of_differences: "Meadow of Differences",
        prairie_of_love: "Prairie of Love", 
        woody_trio: "Woody Trio",
        king_of_jungle: "King of Jungle",
        solitary_island: "Solitary Island",
        river: "River",
        
        // Dice Faces
        forest: "🌲 Forest",
        grassland: "🌾 Grassland", 
        mountain: "⛰️ Mountain",
        nest: "🥚 Nest",
        river_dice: "🌊 River",
        free_choice: "✨ Free",
        
        // Results Screen
        final_results: "🏆 Final Results",
        new_game: "New Game",
        main_menu: "Main Menu",
        
        // Errors
        error: "Error",
        close: "Close", 
        loading: "Loading...",
        max_players_error: "Maximum 5 players allowed",
        game_name_required: "Please enter a game name", 
        min_players_error: "At least 2 players required",
        create_game_error: "Error creating game",
        place_dinosaur_error: "Error placing dinosaur",
        roll_dice_error: "Error rolling dice",
        calculate_scores_error: "Error calculating scores"
    }
};

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
}