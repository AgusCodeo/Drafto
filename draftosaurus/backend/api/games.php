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

require_once __DIR__ . '/../models/Game.php';

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = trim($path, '/');
$path_parts = explode('/', $path);

// Remove 'api' and 'games' from path
$action = isset($path_parts[2]) ? $path_parts[2] : '';
$game_id = isset($path_parts[3]) ? $path_parts[3] : '';

$game = new Game();

switch ($method) {
    case 'GET':
        if ($action === 'list' || $action === '') {
            // Get all games
            $status = $_GET['status'] ?? null;
            $result = $game->getAll($status);
            Utils::sendJsonResponse($result);
        } elseif ($game_id) {
            // Get specific game
            $result = $game->getById($game_id);
            if ($result) {
                // Also get players
                $players = $game->getGamePlayers($game_id);
                $result['players'] = $players;
                Utils::sendJsonResponse($result);
            } else {
                Utils::sendError('Game not found', 404);
            }
        } else {
            Utils::sendError('Invalid endpoint');
        }
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($action === 'create') {
            // Create new game
            if (!isset($input['game_name']) || !isset($input['game_mode']) || !isset($input['created_by'])) {
                Utils::sendError('Missing required fields: game_name, game_mode, created_by');
            }
            
            if (!in_array($input['game_mode'], ['tracking', 'digital'])) {
                Utils::sendError('Invalid game_mode. Must be tracking or digital');
            }
            
            $result = $game->create(
                $input['game_name'],
                $input['game_mode'],
                $input['created_by'],
                $input['max_players'] ?? 5
            );
            
            if ($result) {
                Utils::sendJsonResponse($result, 201);
            } else {
                Utils::sendError('Failed to create game', 500);
            }
        } elseif ($action === 'join') {
            // Join a game
            if (!isset($input['game_id']) || !isset($input['user_id'])) {
                Utils::sendError('Missing required fields: game_id, user_id');
            }
            
            $result = $game->addPlayer($input['game_id'], $input['user_id']);
            if ($result) {
                Utils::sendJsonResponse(['success' => true, 'message' => 'Player added to game']);
            } else {
                Utils::sendError('Failed to join game. Game may be full or player already joined.');
            }
        } elseif ($action === 'roll-dice' && $game_id) {
            // Roll dice for game
            $dice_face = $game->rollDice();
            $result = $game->updateDiceRoll($game_id, $dice_face);
            if ($result) {
                Utils::sendJsonResponse(['dice_face' => $dice_face]);
            } else {
                Utils::sendError('Failed to roll dice', 500);
            }
        } else {
            Utils::sendError('Invalid action');
        }
        break;
        
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($action === 'status' && $game_id) {
            // Update game status
            if (!isset($input['status'])) {
                Utils::sendError('Status is required');
            }
            
            if (!in_array($input['status'], ['waiting', 'in_progress', 'completed'])) {
                Utils::sendError('Invalid status');
            }
            
            $result = $game->updateGameStatus($game_id, $input['status']);
            if ($result) {
                Utils::sendJsonResponse(['success' => true, 'message' => 'Game status updated']);
            } else {
                Utils::sendError('Failed to update game status', 500);
            }
        } else {
            Utils::sendError('Invalid action');
        }
        break;
        
    default:
        Utils::sendError('Method not allowed', 405);
}
?>