<?php
require_once '../config/database.php';

/**
 * Scoring engine for Draftosaurus game
 */
class ScoringEngine {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Calculate score for Forest of Sameness pen
     * Must be same species only, exponential scoring
     */
    public function calculateForestScore($dinosaurs) {
        if (empty($dinosaurs)) return 0;
        
        // Check if all are same species
        $first_species = $dinosaurs[0];
        foreach ($dinosaurs as $dino) {
            if ($dino !== $first_species) return 0; // Invalid placement
        }
        
        $count = count($dinosaurs);
        $scores = [0, 2, 4, 8, 12, 18, 24]; // Index 0 unused, 1-6 dinosaurs
        return isset($scores[$count]) ? $scores[$count] : 0;
    }

    /**
     * Calculate score for Meadow of Differences pen
     * Must be all different species, triangular scoring
     */
    public function calculateMeadowScore($dinosaurs) {
        if (empty($dinosaurs)) return 0;
        
        // Check if all are different species
        $unique_species = array_unique($dinosaurs);
        if (count($unique_species) !== count($dinosaurs)) return 0; // Invalid placement
        
        $count = count($dinosaurs);
        $scores = [0, 1, 3, 6, 10, 15, 21]; // Index 0 unused, 1-6 dinosaurs
        return isset($scores[$count]) ? $scores[$count] : 0;
    }

    /**
     * Calculate score for Prairie of Love pen
     * 5 points per pair of same species
     */
    public function calculatePrairieScore($dinosaurs) {
        if (empty($dinosaurs)) return 0;
        
        $species_count = array_count_values($dinosaurs);
        $score = 0;
        
        foreach ($species_count as $count) {
            $pairs = floor($count / 2);
            $score += $pairs * 5;
        }
        
        return $score;
    }

    /**
     * Calculate score for Woody Trio pen
     * Exactly 3 dinosaurs = 7 points, otherwise 0
     */
    public function calculateWoodyScore($dinosaurs) {
        return count($dinosaurs) === 3 ? 7 : 0;
    }

    /**
     * Calculate score for King of Jungle pen
     * 7 points if you have most of that species among all players
     */
    public function calculateKingScore($dinosaurs, $game_id, $user_id) {
        if (count($dinosaurs) !== 1) return 0;
        
        $species = $dinosaurs[0];
        
        // Get all player boards for this game
        $query = "SELECT user_id, forest_of_sameness, meadow_of_differences, prairie_of_love, woody_trio, king_of_jungle, solitary_island, river FROM player_boards WHERE game_id = :game_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':game_id', $game_id);
        $stmt->execute();
        $boards = $stmt->fetchAll();
        
        $species_counts = [];
        
        foreach ($boards as $board) {
            $total_count = 0;
            
            // Count species in all pens
            $pens = ['forest_of_sameness', 'meadow_of_differences', 'prairie_of_love', 'woody_trio', 'king_of_jungle', 'solitary_island', 'river'];
            foreach ($pens as $pen) {
                $pen_dinos = json_decode($board[$pen], true) ?: [];
                $total_count += array_count_values($pen_dinos)[$species] ?? 0;
            }
            
            $species_counts[$board['user_id']] = $total_count;
        }
        
        $my_count = $species_counts[$user_id] ?? 0;
        $max_count = max($species_counts);
        
        return ($my_count >= $max_count && $my_count > 0) ? 7 : 0;
    }

    /**
     * Calculate score for Solitary Island pen
     * 7 points if it's the only one of its species in your entire zoo
     */
    public function calculateSolitaryScore($dinosaurs, $all_pen_contents) {
        if (count($dinosaurs) !== 1) return 0;
        
        $species = $dinosaurs[0];
        $total_count = 0;
        
        // Count this species across all pens
        foreach ($all_pen_contents as $pen_dinos) {
            $total_count += array_count_values($pen_dinos)[$species] ?? 0;
        }
        
        return $total_count === 1 ? 7 : 0;
    }

    /**
     * Calculate score for River
     * 1 point per dinosaur
     */
    public function calculateRiverScore($dinosaurs) {
        return count($dinosaurs);
    }

    /**
     * Calculate T-Rex bonus
     * +1 point per pen containing at least one T-Rex
     */
    public function calculateTRexBonus($all_pen_contents) {
        $bonus = 0;
        
        foreach ($all_pen_contents as $pen_dinos) {
            if (in_array('trex', $pen_dinos)) {
                $bonus++;
            }
        }
        
        return $bonus;
    }

    /**
     * Calculate total score for a player board
     */
    public function calculateTotalScore($game_id, $user_id) {
        // Get player board
        $query = "SELECT * FROM player_boards WHERE game_id = :game_id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':game_id', $game_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $board = $stmt->fetch();
        
        if (!$board) return false;
        
        // Parse pen contents
        $pens = [
            'forest_of_sameness' => json_decode($board['forest_of_sameness'], true) ?: [],
            'meadow_of_differences' => json_decode($board['meadow_of_differences'], true) ?: [],
            'prairie_of_love' => json_decode($board['prairie_of_love'], true) ?: [],
            'woody_trio' => json_decode($board['woody_trio'], true) ?: [],
            'king_of_jungle' => json_decode($board['king_of_jungle'], true) ?: [],
            'solitary_island' => json_decode($board['solitary_island'], true) ?: [],
            'river' => json_decode($board['river'], true) ?: []
        ];
        
        // Calculate individual scores
        $scores = [
            'forest_score' => $this->calculateForestScore($pens['forest_of_sameness']),
            'meadow_score' => $this->calculateMeadowScore($pens['meadow_of_differences']),
            'prairie_score' => $this->calculatePrairieScore($pens['prairie_of_love']),
            'woody_score' => $this->calculateWoodyScore($pens['woody_trio']),
            'king_score' => $this->calculateKingScore($pens['king_of_jungle'], $game_id, $user_id),
            'solitary_score' => $this->calculateSolitaryScore($pens['solitary_island'], $pens),
            'river_score' => $this->calculateRiverScore($pens['river']),
            'trex_bonus' => $this->calculateTRexBonus($pens)
        ];
        
        $total_score = array_sum($scores);
        
        // Update database
        $update_query = "UPDATE player_boards SET 
            forest_score = :forest_score,
            meadow_score = :meadow_score,
            prairie_score = :prairie_score,
            woody_score = :woody_score,
            king_score = :king_score,
            solitary_score = :solitary_score,
            river_score = :river_score,
            trex_bonus = :trex_bonus,
            total_score = :total_score
            WHERE game_id = :game_id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($update_query);
        $stmt->bindParam(':forest_score', $scores['forest_score']);
        $stmt->bindParam(':meadow_score', $scores['meadow_score']);
        $stmt->bindParam(':prairie_score', $scores['prairie_score']);
        $stmt->bindParam(':woody_score', $scores['woody_score']);
        $stmt->bindParam(':king_score', $scores['king_score']);
        $stmt->bindParam(':solitary_score', $scores['solitary_score']);
        $stmt->bindParam(':river_score', $scores['river_score']);
        $stmt->bindParam(':trex_bonus', $scores['trex_bonus']);
        $stmt->bindParam(':total_score', $total_score);
        $stmt->bindParam(':game_id', $game_id);
        $stmt->bindParam(':user_id', $user_id);
        
        $stmt->execute();
        
        return $scores + ['total_score' => $total_score];
    }

    /**
     * Calculate scores for all players in a game
     */
    public function calculateAllScores($game_id) {
        $query = "SELECT user_id FROM player_boards WHERE game_id = :game_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':game_id', $game_id);
        $stmt->execute();
        $players = $stmt->fetchAll();
        
        $results = [];
        foreach ($players as $player) {
            $results[$player['user_id']] = $this->calculateTotalScore($game_id, $player['user_id']);
        }
        
        return $results;
    }
}
?>