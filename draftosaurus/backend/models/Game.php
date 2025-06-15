<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Game management class
 */
class Game {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    public function create($game_name, $game_mode, $created_by, $max_players = 5) {
        $game_id = Utils::generateUUID();
        
        $query = "INSERT INTO games (game_id, game_name, game_mode, created_by, max_players, current_players) VALUES (:game_id, :game_name, :game_mode, :created_by, :max_players, 0)";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':game_id', $game_id);
        $stmt->bindParam(':game_name', $game_name);
        $stmt->bindParam(':game_mode', $game_mode);
        $stmt->bindParam(':created_by', $created_by);
        $stmt->bindParam(':max_players', $max_players);
        
        if ($stmt->execute()) {
            return $this->getById($game_id);
        }
        return false;
    }

    public function getById($game_id) {
        $query = "SELECT * FROM games WHERE game_id = :game_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':game_id', $game_id);
        $stmt->execute();
        
        return $stmt->fetch();
    }

    public function getAll($status = null) {
        $query = "SELECT g.*, u.username as creator_name FROM games g LEFT JOIN users u ON g.created_by = u.user_id";
        if ($status) {
            $query .= " WHERE g.game_status = :status";
        }
        $query .= " ORDER BY g.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        if ($status) {
            $stmt->bindParam(':status', $status);
        }
        $stmt->execute();
        
        return $stmt->fetchAll();
    }

    public function addPlayer($game_id, $user_id) {
        // Check if game exists and has space
        $game = $this->getById($game_id);
        if (!$game || $game['current_players'] >= $game['max_players']) {
            return false;
        }

        // Check if player already in game
        $query = "SELECT * FROM game_participants WHERE game_id = :game_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':game_id', $game_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        if ($stmt->fetch()) {
            return false; // Player already in game
        }

        // Add player
        $participant_id = Utils::generateUUID();
        $player_order = $game['current_players'] + 1;
        
        $query = "INSERT INTO game_participants (participant_id, game_id, user_id, player_order) VALUES (:participant_id, :game_id, :user_id, :player_order)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':participant_id', $participant_id);
        $stmt->bindParam(':game_id', $game_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':player_order', $player_order);
        
        if ($stmt->execute()) {
            // Update game player count
            $query = "UPDATE games SET current_players = current_players + 1 WHERE game_id = :game_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':game_id', $game_id);
            $stmt->execute();

            // Create player board
            $this->createPlayerBoard($game_id, $user_id);
            
            return true;
        }
        return false;
    }

    private function createPlayerBoard($game_id, $user_id) {
        $board_id = Utils::generateUUID();
        
        $query = "INSERT INTO player_boards (board_id, game_id, user_id) VALUES (:board_id, :game_id, :user_id)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':board_id', $board_id);
        $stmt->bindParam(':game_id', $game_id);
        $stmt->bindParam(':user_id', $user_id);
        
        return $stmt->execute();
    }

    public function getGamePlayers($game_id) {
        $query = "SELECT gp.*, u.username FROM game_participants gp JOIN users u ON gp.user_id = u.user_id WHERE gp.game_id = :game_id ORDER BY gp.player_order";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':game_id', $game_id);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }

    public function updateGameStatus($game_id, $status) {
        $query = "UPDATE games SET game_status = :status WHERE game_id = :game_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':game_id', $game_id);
        $stmt->bindParam(':status', $status);
        
        return $stmt->execute();
    }

    public function rollDice() {
        $faces = ['forest', 'grassland', 'mountain', 'nest', 'river', 'free_choice'];
        return $faces[array_rand($faces)];
    }

    public function updateDiceRoll($game_id, $dice_face) {
        $query = "UPDATE games SET dice_face = :dice_face WHERE game_id = :game_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':game_id', $game_id);
        $stmt->bindParam(':dice_face', $dice_face);
        
        return $stmt->execute();
    }
}
?>