-- Draftosaurus Database Schema
-- Database for the Draftosaurus board game tracking and digital game system

USE draftosaurus;

-- Users table for player and administrator management
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100),
    password_hash VARCHAR(255),
    user_type ENUM('player', 'administrator') DEFAULT 'player',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Games table for game sessions
CREATE TABLE games (
    game_id VARCHAR(36) PRIMARY KEY,
    game_name VARCHAR(100) NOT NULL,
    game_mode ENUM('tracking', 'digital') NOT NULL,
    game_status ENUM('waiting', 'in_progress', 'completed') DEFAULT 'waiting',
    max_players INT DEFAULT 5,
    current_players INT DEFAULT 0,
    current_round INT DEFAULT 1,
    current_turn INT DEFAULT 1,
    dice_face ENUM('forest', 'grassland', 'mountain', 'nest', 'river', 'free_choice'),
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Game participants - linking players to games
CREATE TABLE game_participants (
    participant_id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    player_order INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE KEY unique_game_user (game_id, user_id),
    UNIQUE KEY unique_game_order (game_id, player_order)
);

-- Player boards - each player's individual board state
CREATE TABLE player_boards (
    board_id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    board_side ENUM('summer', 'winter') DEFAULT 'summer',
    
    -- Pen contents (JSON arrays of dinosaur species)
    forest_of_sameness TEXT DEFAULT '[]',
    meadow_of_differences TEXT DEFAULT '[]',
    prairie_of_love TEXT DEFAULT '[]',
    woody_trio TEXT DEFAULT '[]',
    king_of_jungle TEXT DEFAULT '[]',
    solitary_island TEXT DEFAULT '[]',
    river TEXT DEFAULT '[]',
    
    -- Scores for each pen
    forest_score INT DEFAULT 0,
    meadow_score INT DEFAULT 0,
    prairie_score INT DEFAULT 0,
    woody_score INT DEFAULT 0,
    king_score INT DEFAULT 0,
    solitary_score INT DEFAULT 0,
    river_score INT DEFAULT 0,
    trex_bonus INT DEFAULT 0,
    total_score INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE KEY unique_game_player_board (game_id, user_id)
);

-- Dinosaur species reference table
CREATE TABLE dinosaur_species (
    species_id INT PRIMARY KEY AUTO_INCREMENT,
    species_name VARCHAR(50) NOT NULL UNIQUE,
    species_color VARCHAR(20) NOT NULL,
    species_name_es VARCHAR(50) NOT NULL,
    species_name_en VARCHAR(50) NOT NULL
);

-- Insert dinosaur species
INSERT INTO dinosaur_species (species_name, species_color, species_name_es, species_name_en) VALUES
('trex', 'red', 'Tiranosaurio Rex', 'Tyrannosaurus Rex'),
('stegosaurus', 'green', 'Estegosaurio', 'Stegosaurus'),
('triceratops', 'blue', 'Triceratops', 'Triceratops'),
('brachiosaurus', 'yellow', 'Braquiosaurio', 'Brachiosaurus'),
('pterodactyl', 'purple', 'Pterodáctilo', 'Pterodactyl'),
('velociraptor', 'orange', 'Velociraptor', 'Velociraptor');

-- Game moves/actions table for tracking all placements
CREATE TABLE game_moves (
    move_id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    round_number INT NOT NULL,
    turn_number INT NOT NULL,
    dinosaur_species VARCHAR(20) NOT NULL,
    pen_location VARCHAR(30) NOT NULL,
    dice_restriction VARCHAR(20),
    is_valid BOOLEAN DEFAULT TRUE,
    move_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Draft pool - for digital mode drafting mechanics
CREATE TABLE draft_pools (
    pool_id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    round_number INT NOT NULL,
    turn_number INT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    available_dinosaurs TEXT NOT NULL, -- JSON array of available dinosaurs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Game settings for configuration
CREATE TABLE game_settings (
    setting_id VARCHAR(36) PRIMARY KEY,
    setting_name VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description_es TEXT,
    description_en TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default game settings
INSERT INTO game_settings (setting_id, setting_name, setting_value, description_es, description_en) VALUES
(UUID(), 'dinosaurs_per_round', '6', 'Número de dinosaurios por ronda', 'Number of dinosaurs per round'),
(UUID(), 'total_rounds', '2', 'Número total de rondas', 'Total number of rounds'),
(UUID(), 'turns_per_round', '6', 'Turnos por ronda', 'Turns per round'),
(UUID(), 'default_language', 'es', 'Idioma predeterminado', 'Default language');

-- Create indexes for better performance
CREATE INDEX idx_games_status ON games(game_status);
CREATE INDEX idx_games_mode ON games(game_mode);
CREATE INDEX idx_game_participants_game ON game_participants(game_id);
CREATE INDEX idx_player_boards_game ON player_boards(game_id);
CREATE INDEX idx_game_moves_game ON game_moves(game_id);
CREATE INDEX idx_game_moves_user ON game_moves(user_id);
CREATE INDEX idx_draft_pools_game_round ON draft_pools(game_id, round_number, turn_number);