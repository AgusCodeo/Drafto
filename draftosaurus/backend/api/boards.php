<?php
// Enable CORS for all requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';
require_once '../models/ScoringEngine.php';

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = trim($path, '/');
$path_parts = explode('/', $path);

// Remove 'api' and 'boards' from path
$action = isset($path_parts[2]) ? $path_parts[2] : '';
$game_id = isset($path_parts[3]) ? $path_parts[3] : '';
$user_id = isset($path_parts[4]) ? $path_parts[4] : '';

$database = new Database();
$conn = $database->getConnection();
$scoring = new ScoringEngine();

switch ($method) {
    case 'GET':
        if ($game_id && $user_id) {
            // Get specific player board
            $query = "SELECT pb.*, u.username FROM player_boards pb JOIN users u ON pb.user_id = u.user_id WHERE pb.game_id = :game_id AND pb.user_id = :user_id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':game_id', $game_id);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            $result = $stmt->fetch();
            
            if ($result) {
                // Parse JSON fields
                $result['forest_of_sameness'] = json_decode($result['forest_of_sameness'], true) ?: [];
                $result['meadow_of_differences'] = json_decode($result['meadow_of_differences'], true) ?: [];
                $result['prairie_of_love'] = json_decode($result['prairie_of_love'], true) ?: [];
                $result['woody_trio'] = json_decode($result['woody_trio'], true) ?: [];
                $result['king_of_jungle'] = json_decode($result['king_of_jungle'], true) ?: [];
                $result['solitary_island'] = json_decode($result['solitary_island'], true) ?: [];
                $result['river'] = json_decode($result['river'], true) ?: [];
                
                Utils::sendJsonResponse($result);
            } else {
                Utils::sendError('Board not found', 404);
            }
        } elseif ($game_id) {
            // Get all boards for a game
            $query = "SELECT pb.*, u.username FROM player_boards pb JOIN users u ON pb.user_id = u.user_id WHERE pb.game_id = :game_id ORDER BY pb.total_score DESC";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':game_id', $game_id);
            $stmt->execute();
            $results = $stmt->fetchAll();
            
            // Parse JSON fields for each board
            foreach ($results as &$result) {
                $result['forest_of_sameness'] = json_decode($result['forest_of_sameness'], true) ?: [];
                $result['meadow_of_differences'] = json_decode($result['meadow_of_differences'], true) ?: [];
                $result['prairie_of_love'] = json_decode($result['prairie_of_love'], true) ?: [];
                $result['woody_trio'] = json_decode($result['woody_trio'], true) ?: [];
                $result['king_of_jungle'] = json_decode($result['king_of_jungle'], true) ?: [];
                $result['solitary_island'] = json_decode($result['solitary_island'], true) ?: [];
                $result['river'] = json_decode($result['river'], true) ?: [];
            }
            
            Utils::sendJsonResponse($results);
        } else {
            Utils::sendError('Game ID is required');
        }
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($action === 'place-dinosaur') {
            // Place a dinosaur on the board
            if (!isset($input['game_id']) || !isset($input['user_id']) || !isset($input['dinosaur_species']) || !isset($input['pen_location'])) {
                Utils::sendError('Missing required fields: game_id, user_id, dinosaur_species, pen_location');
            }
            
            if (!Utils::validateDinosaurSpecies($input['dinosaur_species'])) {
                Utils::sendError('Invalid dinosaur species');
            }
            
            if (!Utils::validatePenLocation($input['pen_location'])) {
                Utils::sendError('Invalid pen location');
            }
            
            // Get current board state
            $query = "SELECT * FROM player_boards WHERE game_id = :game_id AND user_id = :user_id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':game_id', $input['game_id']);
            $stmt->bindParam(':user_id', $input['user_id']);
            $stmt->execute();
            $board = $stmt->fetch();
            
            if (!$board) {
                Utils::sendError('Board not found', 404);
            }
            
            // Parse current pen contents
            $pen_contents = json_decode($board[$input['pen_location']], true) ?: [];
            
            // Add new dinosaur
            $pen_contents[] = $input['dinosaur_species'];
            
            // Update database
            $query = "UPDATE player_boards SET {$input['pen_location']} = :pen_contents WHERE game_id = :game_id AND user_id = :user_id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':pen_contents', json_encode($pen_contents));
            $stmt->bindParam(':game_id', $input['game_id']);
            $stmt->bindParam(':user_id', $input['user_id']);
            
            if ($stmt->execute()) {
                // Record the move
                $move_id = Utils::generateUUID();
                $query = "INSERT INTO game_moves (move_id, game_id, user_id, round_number, turn_number, dinosaur_species, pen_location, dice_restriction) VALUES (:move_id, :game_id, :user_id, :round_number, :turn_number, :dinosaur_species, :pen_location, :dice_restriction)";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':move_id', $move_id);
                $stmt->bindParam(':game_id', $input['game_id']);
                $stmt->bindParam(':user_id', $input['user_id']);
                $stmt->bindParam(':round_number', $input['round_number'] ?? 1);
                $stmt->bindParam(':turn_number', $input['turn_number'] ?? 1);
                $stmt->bindParam(':dinosaur_species', $input['dinosaur_species']);
                $stmt->bindParam(':pen_location', $input['pen_location']);
                $stmt->bindParam(':dice_restriction', $input['dice_restriction'] ?? null);
                $stmt->execute();
                
                Utils::sendJsonResponse(['success' => true, 'message' => 'Dinosaur placed successfully']);
            } else {
                Utils::sendError('Failed to place dinosaur', 500);
            }
            
        } elseif ($action === 'calculate-scores') {
            // Calculate scores for a game
            if (!isset($input['game_id'])) {
                Utils::sendError('Game ID is required');
            }
            
            $result = $scoring->calculateAllScores($input['game_id']);
            Utils::sendJsonResponse($result);
            
        } else {
            Utils::sendError('Invalid action');
        }
        break;
        
    default:
        Utils::sendError('Method not allowed', 405);
}
?>